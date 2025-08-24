import SlideGeneratorSidebar from "@/components/slides/SlideGeneratorSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/contexts/dataContext";
import domtoimage from "dom-to-image";
import axios from "axios";
import React from "react";
import {
  Presentation,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import GDNSlide from "@/components/slides/GDNSlide";
import DiscoverySlide from "@/components/slides/DiscoverySlide";
import TitleSlide from "@/components/slides/TitleSlide";
import FacebookReachSlide01 from "@/components/slides/FacebookReachSlide01";
import FacebookReachSlide02 from "@/components/slides/FacebookReachSlide02";
import SectionSlide from "@/components/slides/SectionSlide";
import FacebookEngagementSlide01 from "@/components/slides/FacebookEngagementSlide01";
import FacebookEngagementSlide02 from "@/components/slides/FacebookEngagementSlide02";
import FacebookAwarenessSlide01 from "@/components/slides/FacebookAwarenessSlide01";
import FacebookAwarenessSlide02 from "@/components/slides/FacebookAwarenessSlide02";
import FacebookAwarenessSlide02PicTable from "@/components/slides/FacebookAwarenessSlide02PicTable";
import EndSlide from "@/components/slides/EndSlide";
import Overall from "@/components/slides/Overall";
import FacebookMessageSlide01 from "@/components/slides/FacebookMessageSlide01";
import FacebookMessageSlide02 from "@/components/slides/FacebookMessageSlide02";
import FacebookLeadSlide01 from "@/components/slides/FacebookLeadSlide01";
import FacebookLeadSlide02 from "@/components/slides/FacebookLeadSlide02";
import FacebookConversionSlide01 from "@/components/slides/FacebookConversionSlide01";
import FacebookConversionSlide02 from "@/components/slides/FacebookConversionSlide02";
import SEMConversionSlide from "@/components/slides/SEMConversionSlide";
import SEMClickSlide from "@/components/slides/SEMClickSlide";
import YoutubeSlide from "@/components/slides/YoutubeSlide";
import FacebookTrafficSlide01 from "@/components/slides/FacebookTrafficSlide01";
import FacebookTrafficSlide02 from "@/components/slides/FacebookTrafficSlide02";
import FacebookVideoSlide01 from "@/components/slides/FacebookVideoSlide01";
import FacebookVideoSlide02 from "@/components/slides/FacebookVideoSlide02";
import FacebookCatalogSlide01 from "@/components/slides/FacebookCatalogSlide01";
import FacebookCatalogSlide02 from "@/components/slides/FacebookCatalogSlide02";
import TiktokReachSlide01 from "@/components/slides/TiktokReachSlide01";
import TiktokVideoSlide01 from "@/components/slides/TiktokVideoSlide01";
import TiktokTrafficSlide01 from "@/components/slides/TiktokTrafficSlide01";
import TiktokLeadSlide01 from "@/components/slides/TiktokLeadSlide01";
import TiktokConversionSlide01 from "@/components/slides/TiktokConversionSlide01";
import LineReachSlide01 from "@/components/slides/LineReachSlide01";
import LineGainFriendsSlide01 from "@/components/slides/LineGainFriendsSlide01";
import TaboolaSlide from "@/components/slides/TaboolaSlide";
import { EXPORT_SLIDE_COMPONENT_LISTS } from "@/configs/exportSlideConfigs";

function SlideReport() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [presentationUrl, setPresentationUrl] = React.useState(null);
  const [sheetsID, setSheetsID] = React.useState("");
  const [sheetsLink, setSheetsLink] = React.useState("");
  const [ableToGenerate, setAbleToGenerate] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [slideGenerated, setSlideGenerated] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [reportType, setReportType] = React.useState("");

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const {
    fetchData,
    enableDateRange,
    setEnableDateRange,
    fetchFacebookPicture,
  } = useData();

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleSheetsLinkChange = (event) => {
    const value = event.target.value;
    setSheetsLink(value);

    if (!value.trim()) {
      setSheetsID("");
      setAbleToGenerate(false);
      return;
    }

    const match = value.match(
      /^(https:\/\/docs\.google\.com\/spreadsheets\/d\/)([a-zA-Z0-9-_]+)/
    );

    if (!match) {
      setSheetsID("Invalid Sheets Link");
      setAbleToGenerate(false);
      return;
    }

    const sheetsId = match[2];
    setSheetsID(sheetsId);
    setAbleToGenerate(true);
  };

  const handleGenerate = async () => {
    if (!ableToGenerate) {
      setError("Please enter a valid Google Sheets link");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await fetchData(sheetsID);
      setSlideGenerated(true);
    } catch (error) {
      setError("Failed to generate slides: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnableDateRangeChange = (event) => {
    setEnableDateRange(event.target.checked);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fixCorsImages = async () => {
    console.log("Fixing CORS images...");

    const problematicImages = document.querySelectorAll(
      'img[src*="github.com"], img[src*="raw.githubusercontent.com"]'
    );
    console.log(`Found ${problematicImages.length} images that need CORS fix`);

    if (problematicImages.length === 0) {
      return Promise.resolve();
    }

    // Multiple proxy options in order of preference
    const proxyOptions = [
      (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url) => `https://cors-anywhere.herokuapp.com/${url}`, // Requires demo request
    ];

    const imagePromises = Array.from(problematicImages).map((img, index) => {
      return new Promise((resolve) => {
        const originalSrc = img.src;
        let proxyIndex = 0;

        const tryNextProxy = () => {
          if (proxyIndex >= proxyOptions.length) {
            console.warn(
              `✗ All proxies failed for image ${index + 1}: ${originalSrc}`
            );
            resolve(); // Don't block export for failed images
            return;
          }

          const proxiedSrc = proxyOptions[proxyIndex](originalSrc);
          const testImg = new Image();
          testImg.crossOrigin = "anonymous";

          const timeout = setTimeout(() => {
            console.warn(
              `⏱ Timeout for proxy ${proxyIndex + 1} on image ${index + 1}`
            );
            proxyIndex++;
            tryNextProxy();
          }, 3000); // 3 second timeout instead of 5

          testImg.onload = () => {
            clearTimeout(timeout);
            img.src = proxiedSrc;
            img.crossOrigin = "anonymous";
            console.log(
              `✓ Fixed image ${index + 1} with proxy ${
                proxyIndex + 1
              }: ${originalSrc}`
            );
            resolve();
          };

          testImg.onerror = () => {
            clearTimeout(timeout);
            console.warn(
              `✗ Proxy ${proxyIndex + 1} failed for image ${index + 1}`
            );
            proxyIndex++;
            tryNextProxy();
          };

          testImg.src = proxiedSrc;
        };

        tryNextProxy();
      });
    });

    // Wait for all images to be processed (or timeout)
    await Promise.all(imagePromises);

    // Shorter wait time since images either loaded or failed
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("CORS image fix complete");
  };

  const convertImagesToCanvas = async () => {
    console.log("Converting external images to canvas...");

    const externalImages = document.querySelectorAll(
      'img[src*="github.com"], img[src*="raw.githubusercontent.com"]'
    );

    for (const img of externalImages) {
      try {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to match image
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // Try to draw image to canvas
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          tempImg.onload = () => {
            try {
              ctx.drawImage(tempImg, 0, 0);

              // Replace original img with canvas
              canvas.style.width = img.style.width;
              canvas.style.height = img.style.height;
              canvas.className = img.className;

              img.parentNode.replaceChild(canvas, img);
              console.log(`✓ Converted image to canvas: ${img.src}`);
              resolve();
            } catch (error) {
              console.warn(`Canvas conversion failed: ${error.message}`);
              reject(error);
            }
          };

          tempImg.onerror = () => {
            console.warn(
              `Failed to load image for canvas conversion: ${img.src}`
            );
            reject(new Error("Image load failed"));
          };

          // Use proxy URL for loading
          const proxiedSrc = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            img.src
          )}`;
          tempImg.src = proxiedSrc;
        }).catch(() => {
          // If conversion fails, leave original image
          console.warn(`Keeping original image: ${img.src}`);
        });
      } catch (error) {
        console.warn(`Failed to convert image: ${img.src}`, error);
      }
    }

    console.log("Image to canvas conversion complete");
  };

  const handleExportAllSlides = async () => {
    setIsExporting(true);
    setError(null);

    try {
      console.log("Starting multi-slide export process...");

      // STEP 1: Fix CORS images first
      try {
        await fixCorsImages();
      } catch (corsError) {
        console.warn("CORS fix failed, trying canvas conversion:", corsError);
        try {
          await convertImagesToCanvas();
        } catch (canvasError) {
          console.warn("Canvas conversion failed:", canvasError);
          // Continue anyway - some slides might still work
        }
      }

      // STEP 2: Define all your slide components
      const slideComponents = EXPORT_SLIDE_COMPONENT_LISTS;

      // STEP 3: Capture all components with better error handling
      const slideData = [];

      for (const slide of slideComponents) {
        const element = document.getElementById(slide.id);
        if (!element) {
          console.warn(`Component ${slide.id} not found, skipping...`);
          continue;
        }

        console.log(`Capturing ${slide.title}...`);

        try {
          // Enhanced domtoimage options
          const imageData = await domtoimage.toPng(element, {
            quality: 0.95,
            bgcolor: "#ffffff",
            width: element.offsetWidth,
            height: element.offsetHeight,
            cacheBust: true,
            useCORS: true,
            allowTaint: false, // Prevent tainted canvas issues
            filter: (node) => {
              // Skip problematic nodes
              if (node.tagName === "SCRIPT") return false;
              if (node.classList && node.classList.contains("exclude-export"))
                return false;
              return true;
            },
            style: {
              // Ensure consistent rendering
              transform: "scale(1)",
              "transform-origin": "top left",
            },
          });

          slideData.push({
            imageData: imageData,
            title: slide.title,
          });

          console.log(`✓ Successfully captured ${slide.title}`);
        } catch (captureError) {
          console.error(`Failed to capture ${slide.title}:`, captureError);

          // Try alternative capture method
          try {
            console.log(`Retrying ${slide.title} with alternative method...`);

            const alternativeImageData = await domtoimage.toJpeg(element, {
              quality: 0.9,
              bgcolor: "#ffffff",
              width: element.offsetWidth,
              height: element.offsetHeight,
            });

            slideData.push({
              imageData: alternativeImageData,
              title: slide.title,
            });

            console.log(
              `✓ Successfully captured ${slide.title} (alternative method)`
            );
          } catch (alternativeError) {
            console.error(
              `Both capture methods failed for ${slide.title}:`,
              alternativeError
            );
            // Continue with other slides instead of failing completely
          }
        }
      }

      if (slideData.length === 0) {
        throw new Error(
          "No slide components found to export. This might be due to CORS issues with external images."
        );
      }

      console.log(`Captured ${slideData.length} slides, sending to backend...`);

      // STEP 4: Send to backend (unchanged)
      const response = await axios.post(
        "http://localhost:8000/data-sheets/create-multi-slide-presentation",
        {
          slides: slideData,
          presentationTitle: "Monthly Performance Report",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      console.log("Backend response:", result);

      setPresentationUrl(result.presentationUrl);
      window.open(result.presentationUrl, "_blank");
    } catch (error) {
      console.error("Multi-slide export failed:", error);

      // Provide more specific error messages
      let errorMessage = error.response?.data?.error || error.message;

      if (errorMessage.includes("CORS") || errorMessage.includes("tainted")) {
        errorMessage +=
          "\n\nTip: This error is likely due to external images. Try refreshing the page and exporting again.";
      }

      setError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Sidebar Component */}
      <SlideGeneratorSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        sheetsLink={sheetsLink}
        sheetsID={sheetsID}
        ableToGenerate={ableToGenerate}
        isGenerating={isGenerating}
        slideGenerated={slideGenerated}
        enableDateRange={enableDateRange}
        isExporting={isExporting}
        presentationUrl={presentationUrl}
        onSheetsLinkChange={handleSheetsLinkChange}
        onGenerate={handleGenerate}
        onEnableDateRangeChange={handleEnableDateRangeChange}
        onExportAllSlides={handleExportAllSlides}
        handleExportAllSlides={handleExportAllSlides}
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
        reportType={reportType}
        onReportTypeChange={handleReportTypeChange}
      />

      {/* Main Content */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Presentation className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Slide Report Generator
            </h1>
            <button onClick={() => fetchFacebookPicture(sheetsID)}>TEST</button>
          </div>
          <div className="ml-auto text-sm text-slate-600">
            Transform your Google Sheets data into beautiful presentation slides
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Status Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {presentationUrl && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Presentation created successfully!{" "}
                  <a
                    href={presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline hover:text-green-900 font-medium"
                  >
                    Open Presentation <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Panel */}
            {slideGenerated ? (
              <div className="w-full flex flex-col items-center gap-10">
                <TitleSlide projectName={projectName} reportType={reportType} />
                <Overall />
                <SectionSlide
                  title={"Facebook"}
                  componentID={"facebook-section-component"}
                />
                <FacebookAwarenessSlide01 />
                <FacebookAwarenessSlide02 />
                {/* <FacebookAwarenessSlide02PicTable /> */}
                <FacebookReachSlide01 />
                <FacebookReachSlide02 />
                <FacebookEngagementSlide01 />
                <FacebookEngagementSlide02 />
                <FacebookTrafficSlide01 />
                <FacebookTrafficSlide02 />
                <FacebookVideoSlide01 />
                <FacebookVideoSlide02 />
                <FacebookMessageSlide01 />
                <FacebookMessageSlide02 />
                <FacebookLeadSlide01 />
                <FacebookLeadSlide02 />
                <FacebookConversionSlide01 />
                <FacebookConversionSlide02 />
                <FacebookCatalogSlide01 />
                <FacebookCatalogSlide02 />
                <SectionSlide
                  title={"Google"}
                  componentID={"google-section-component"}
                />
                <SEMConversionSlide />
                <SEMClickSlide />
                <GDNSlide />
                <DiscoverySlide />
                <YoutubeSlide />
                <SectionSlide
                  title={"Tiktok"}
                  componentID={"tiktok-section-component"}
                />
                <TiktokReachSlide01 />
                <TiktokVideoSlide01 />
                <TiktokTrafficSlide01 />
                <TiktokLeadSlide01 />
                <TiktokConversionSlide01 />
                <SectionSlide
                  title={"Line"}
                  componentID={"line-section-component"}
                />
                <LineReachSlide01 />
                <LineGainFriendsSlide01 />
                <SectionSlide
                  title={"Taboola"}
                  componentID={"taboola-section-component"}
                />
                <TaboolaSlide />
                <EndSlide />
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Presentation className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      No slides generated yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Click the sidebar toggle button in the top-left corner to
                      open the configuration panel. Enter a valid Google Sheets
                      URL and click "Generate Slides" to create your
                      presentation preview.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SlideReport;
