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
import React from "react";
import {
  Presentation,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import TitleSlide from "@/components/slides/TitleSlide";
import { EXPORT_SLIDE_COMPONENT_LISTS } from "@/configs/exportSlideConfigs";
import axiosInstance from "@/configs/axiosConfigs";
import ExampleDataTable from "@/components/charts-tables/exampleDataTable";
import { SHEETS_EXPORT_OPTIONS } from "@/configs/exportSheetsConfig";
import { prepareDataForExport } from "@/utils/dataProcessors";
import OverallSlide from "@/components/slides/OverallSlide";
import OverallSlide2 from "@/components/slides/OverallSlide2";
import OverallSlide3 from "@/components/slides/OverallSlide3";

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
    AllData,
    setAllData,
    UniqueData,
    setUniqueData,
    FilteredSales,
    setFilteredSales,
    UniqueFilteredSales,
    setUniqueFilteredSales,
    RawFilteredSalesOnly,
    setRawFilteredSalesOnly,
    FilteredSalesOnly,
    setFilteredSalesOnly,
    exportSheetsURL,
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

  // NEW: Convert all external images from Google Sheets to base64
  const convertGoogleSheetsImagesToBase64 = async () => {
    console.log("Converting Google Sheets images to base64...");

    // Find all images that look like external URLs (not already base64 or local)
    const externalImages = document.querySelectorAll(
      'img[src^="http"]:not([src^="data:"]):not([src*="localhost"])'
    );

    console.log(
      `Found ${externalImages.length} external images from Google Sheets`
    );

    const conversionPromises = Array.from(externalImages).map(
      async (img, index) => {
        const originalSrc = img.src;

        // Skip if already processed or not an external image
        if (
          originalSrc.startsWith("data:") ||
          originalSrc.includes("localhost")
        ) {
          return;
        }

        try {
          console.log(`Converting image ${index + 1}: ${originalSrc}`);

          // Method 1: Try direct fetch with multiple proxies
          const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(
              originalSrc
            )}`,
            `https://corsproxy.io/?${encodeURIComponent(originalSrc)}`,
            `https://cors-anywhere.herokuapp.com/${originalSrc}`,
          ];

          let success = false;

          for (const proxyUrl of proxies) {
            try {
              const response = await fetch(proxyUrl, {
                method: "GET",
                headers: {
                  Accept: "image/*",
                },
              });

              if (response.ok) {
                const blob = await response.blob();

                // Convert blob to base64
                const base64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });

                // Update image source
                img.src = base64;
                console.log(
                  `✓ Successfully converted image ${index + 1} using proxy`
                );
                success = true;
                break;
              }
            } catch (proxyError) {
              console.warn(`Proxy failed for image ${index + 1}:`, proxyError);
              continue;
            }
          }

          // Method 2: If proxies fail, try canvas method
          if (!success) {
            await new Promise((resolve, reject) => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const tempImg = new Image();

              tempImg.crossOrigin = "anonymous";

              tempImg.onload = () => {
                try {
                  canvas.width = tempImg.naturalWidth || tempImg.width;
                  canvas.height = tempImg.naturalHeight || tempImg.height;

                  ctx.drawImage(tempImg, 0, 0);

                  const base64 = canvas.toDataURL("image/png", 0.9);
                  img.src = base64;

                  console.log(
                    `✓ Successfully converted image ${index + 1} using canvas`
                  );
                  success = true;
                  resolve();
                } catch (canvasError) {
                  reject(canvasError);
                }
              };

              tempImg.onerror = () => {
                reject(new Error("Canvas image load failed"));
              };

              // Try with first proxy for canvas method
              tempImg.src = proxies[0];
            });
          }

          if (!success) {
            throw new Error("All conversion methods failed");
          }
        } catch (error) {
          console.error(`Failed to convert image ${index + 1}:`, error);

          // Create a styled placeholder that looks like the actual image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Get current image dimensions or use defaults
          const width = img.offsetWidth || img.width || 400;
          const height = img.offsetHeight || img.height || 300;

          canvas.width = width;
          canvas.height = height;

          // Create a professional-looking placeholder
          ctx.fillStyle = "#f8f9fa";
          ctx.fillRect(0, 0, width, height);

          // Add subtle gradient
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, "#f8f9fa");
          gradient.addColorStop(1, "#e9ecef");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          // Add border
          ctx.strokeStyle = "#dee2e6";
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

          // Add icon and text
          ctx.fillStyle = "#6c757d";
          ctx.font = `${Math.min(width, height) * 0.06}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Draw image icon
          const iconSize = Math.min(width, height) * 0.15;
          ctx.strokeStyle = "#adb5bd";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            width / 2 - iconSize / 2,
            height / 2 - iconSize / 2 - 20,
            iconSize,
            iconSize * 0.7
          );

          // Add text
          ctx.fillText("Image from Sheets", width / 2, height / 2 + 25);
          ctx.font = `${Math.min(width, height) * 0.04}px Arial`;
          ctx.fillStyle = "#adb5bd";
          ctx.fillText(`${width} × ${height}`, width / 2, height / 2 + 45);

          // Replace image with placeholder
          img.src = canvas.toDataURL("image/png");
          console.log(
            `Created professional placeholder for image ${index + 1}`
          );
        }
      }
    );

    // Wait for all conversions to complete
    await Promise.allSettled(conversionPromises);

    console.log("✓ Google Sheets image conversion complete");

    // Wait for DOM updates
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  // Ensure all images are fully loaded
  const ensureImagesLoaded = async () => {
    console.log("Ensuring all images are fully loaded...");

    const allImages = document.querySelectorAll("img");

    const imagePromises = Array.from(allImages).map((img) => {
      return new Promise((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          const timeout = setTimeout(() => {
            console.warn(`Image load timeout: ${img.src}`);
            resolve(); // Don't block on timeout
          }, 10000); // 10 second timeout

          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };

          img.onerror = () => {
            clearTimeout(timeout);
            console.warn(`Image failed to load: ${img.src}`);
            resolve(); // Don't block on errors
          };
        }
      });
    });

    await Promise.all(imagePromises);
    console.log("All images processed");
  };

  const handleExportAllSlides = async () => {
    setIsExporting(true);
    setError(null);

    try {
      console.log("Starting export with Google Sheets image handling...");

      // // STEP 1: Convert all external images from Google Sheets to base64
      // await convertGoogleSheetsImagesToBase64();

      // // STEP 2: Ensure all images are fully loaded
      // await ensureImagesLoaded();

      // STEP 3: Define slide components
      const slideComponents = EXPORT_SLIDE_COMPONENT_LISTS;
      const slideData = [];

      for (const slide of slideComponents) {
        const element = document.getElementById(slide.id);
        if (!element) {
          console.warn(`Component ${slide.id} not found, skipping...`);
          continue;
        }

        console.log(`Capturing ${slide.title}...`);

        try {
          // Optimized settings for base64 images
          const imageData = await domtoimage.toPng(element, {
            quality: 0.95,
            bgcolor: "#ffffff",
            width: element.offsetWidth,
            height: element.offsetHeight,
            cacheBust: false, // Cache is good for base64 images
            useCORS: false, // Not needed with base64
            allowTaint: true, // Allow for better compatibility
            filter: (node) => {
              if (node.tagName === "SCRIPT") return false;
              if (node.classList && node.classList.contains("exclude-export"))
                return false;
              return true;
            },
            style: {
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

          // Fallback: Try JPEG format
          try {
            console.log(`Retrying ${slide.title} with JPEG...`);

            const fallbackImageData = await domtoimage.toJpeg(element, {
              quality: 0.9,
              bgcolor: "#ffffff",
              width: element.offsetWidth,
              height: element.offsetHeight,
              useCORS: false,
              allowTaint: true,
            });

            slideData.push({
              imageData: fallbackImageData,
              title: slide.title,
            });

            console.log(`✓ Captured ${slide.title} with JPEG fallback`);
          } catch (fallbackError) {
            console.error(
              `Both methods failed for ${slide.title}`,
              fallbackError
            );

            // Last resort: Create error slide
            const errorCanvas = document.createElement("canvas");
            const errorCtx = errorCanvas.getContext("2d");
            errorCanvas.width = 1200;
            errorCanvas.height = 800;

            errorCtx.fillStyle = "#ffffff";
            errorCtx.fillRect(0, 0, 1200, 800);
            errorCtx.fillStyle = "#dc3545";
            errorCtx.font = "24px Arial";
            errorCtx.textAlign = "center";
            errorCtx.fillText(`Failed to capture: ${slide.title}`, 600, 400);

            slideData.push({
              imageData: errorCanvas.toDataURL("image/png"),
              title: slide.title,
            });

            console.log(`Created error slide for ${slide.title}`);
          }
        }
      }

      if (slideData.length === 0) {
        throw new Error("No slides were captured successfully.");
      }

      console.log(`Captured ${slideData.length} slides, sending to backend...`);

      // Send to backend
      const response = await axiosInstance.post(
        "/data-sheets/create-multi-slide-presentation",
        {
          slides: slideData,
          presentationTitle: "Monthly Performance Report",
        }
      );

      const result = response.data;
      console.log("Backend response:", result);

      setPresentationUrl(result.presentationUrl);
      window.open(result.presentationUrl, "_blank");
    } catch (error) {
      console.error("Multi-slide export failed:", error);
      setError(error.response?.data?.error || error.message);
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
                {/* <a href={exportSheetsURL} target="_blank">
                  {exportSheetsURL}
                </a>
                <TitleSlide projectName={projectName} reportType={reportType} /> */}
                <OverallSlide />
                <OverallSlide2 />
                <OverallSlide3 />
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

            {AllData.length > 0 && (
              <div className="">
                <ExampleDataTable data={AllData} tableTitle="All Data" />
              </div>
            )}
            {UniqueData.length > 0 && (
              <div className="">
                <ExampleDataTable data={UniqueData} tableTitle="Unique Data" />
              </div>
            )}
            {FilteredSales.length > 0 && (
              <div className="">
                <ExampleDataTable
                  data={FilteredSales}
                  tableTitle="Filtered Sales"
                />
              </div>
            )}
            {UniqueFilteredSales.length > 0 && (
              <div className="">
                <ExampleDataTable
                  data={UniqueFilteredSales}
                  tableTitle="Unique Filtered Sales"
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SlideReport;
