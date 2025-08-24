import DateRangePicker from "@/components/slides/utils/DateRangePicker";
import Overall from "@/components/slides/Overall";
import SEMSlide from "@/components/slides/SEMConversionSlide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/contexts/dataContext";
import domtoimage from "dom-to-image";
import React from "react";

function SlideReport() {
  // const [isOverallEditModalOpen, setIsOverallEditModalOpen] =
  //   React.useState(false);
  const [isSEMEditModalOpen, setIsSEMEditModalOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [presentationUrl, setPresentationUrl] = React.useState(null);
  const [sheetsID, setSheetsID] = React.useState(
    "Please enter a Google Sheets link"
  );

  const [ableToGenerate, setAbleToGenerate] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [slideGernerated, setSlideGenerated] = React.useState(false);
  const [enableDateRange, setEnableDateRange] = React.useState(false);

  const { fetchData } = useData();

  const handleExportToSlides = async () => {
    setIsExporting(true);
    setError(null);

    try {
      console.log("Starting export process...");

      // Step 1: Capture component as image
      const element = document.getElementById("overall-component");
      if (!element) {
        throw new Error(
          "Component not found. Make sure the Overall component has id='overall-component'"
        );
      }

      console.log("Capturing component...");
      const imageData = await domtoimage.toPng(element, {
        quality: 0.95,
        bgcolor: "#ffffff",
        width: element.offsetWidth,
        height: element.offsetHeight,
        // style: {
        //   transform: "scale(2)",
        //   transformOrigin: "top left",
        //   width: element.offsetWidth + "px",
        //   height: element.offsetHeight + "px",
        // },
        filter: (node) => {
          // Filter out any problematic nodes if needed
          return true;
        },
      });

      console.log("Component captured successfully");

      // Step 2: Send to backend
      console.log("Sending to backend...");
      const response = await fetch(
        "http://localhost:8000/data-sheets/create-presentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData: imageData,
            title: "Monthly Report",
            slideTitle: "Overall Performance",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Backend response:", result);

      // Step 3: Open presentation
      setPresentationUrl(result.presentationUrl);
      window.open(result.presentationUrl, "_blank");

      alert("Presentation created successfully! Opening in new tab...");
    } catch (error) {
      console.error("Export failed:", error);
      setError(error.message);
      alert(`Failed to create presentation: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddSlide = async () => {
    if (!presentationUrl) {
      alert("Please create a presentation first");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Extract presentation ID from URL
      const urlMatch = presentationUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!urlMatch) {
        throw new Error("Invalid presentation URL");
      }
      const presentationId = urlMatch[1];

      // Capture component
      const element = document.getElementById("overall-component");
      const imageData = await domtoimage.toPng(element, {
        quality: 0.95,
        bgcolor: "#ffffff",
        width: element.offsetWidth,
        height: element.offsetHeight,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
          width: element.offsetWidth + "px",
          height: element.offsetHeight + "px",
        },
      });

      // Add slide to existing presentation
      const response = await fetch(
        "http://localhost:8000/data-sheets/add-slide",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            presentationId: presentationId,
            imageData: imageData,
            slideTitle: "Additional Slide",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      alert("Slide added successfully!");
    } catch (error) {
      console.error("Add slide failed:", error);
      setError(error.message);
      alert(`Failed to add slide: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSheetsLinkChange = (event) => {
    const value = event.target.value;
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
      alert("Please enter a valid Google Sheets link");
      return;
    }
    try {
      await fetchData(sheetsID);
      setSlideGenerated(true);
    } catch (error) {
      alert("Failed to generate slides: " + error.message);
    }
  };

  const handleEnableDateRangeChange = (event) => {
    setEnableDateRange(event.target.checked);
  };

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Slide Report</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Display */}
      {presentationUrl && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success:</strong> Presentation created!
          <a
            href={presentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline hover:text-green-800"
          >
            Open Presentation
          </a>
        </div>
      )}

      <div className="flex flex-col w-full items-center gap-4">
        {/* Controls */}
        <div className="flex flex-col gap-2 w-full max-w-[500px]">
          <div className="flex gap-2">
            <Input
              id="sheet-link"
              type="text"
              placeholder="Please enter a Google Sheets link"
              onChange={handleSheetsLinkChange}
            />
            <Button
              disabled={isGenerating || !ableToGenerate}
              onClick={handleGenerate}
            >
              Generate Google Slide
            </Button>
          </div>
          <div className="flex flex-col">
            <Label>
              <input
                type="checkbox"
                name="date-range-enable"
                value={enableDateRange}
                onChange={handleEnableDateRangeChange}
              />
              Date Range
            </Label>
            {enableDateRange && <DateRangePicker />}
          </div>
          <p>ID: {sheetsID}</p>
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleExportToSlides}
            disabled={isExporting || !slideGernerated}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
          >
            {isExporting
              ? "Creating Presentation..."
              : "Export to Google Slides"}
          </Button>

          <Button
            onClick={handleAddSlide}
            disabled={isExporting || !presentationUrl}
            variant="outline"
            className="disabled:opacity-50"
          >
            {isExporting ? "Adding Slide..." : "Add Another Slide"}
          </Button>

          <Button onClick={() => setIsSEMEditModalOpen(true)} variant="outline">
            Edit Summary
          </Button>
        </div>

        {/* Component to be exported */}
        {/* Google Slides Preview */}
        {slideGernerated && (
          <div className="w-full flex justify-center">
            {/* <Overall
              isOverallEditModalOpen={isOverallEditModalOpen}
              setIsOverallEditModalOpen={setIsOverallEditModalOpen}
            /> */}
            <SEMSlide
              isSEMEditModalOpen={isSEMEditModalOpen}
              setIsSEMEditModalOpen={setIsSEMEditModalOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SlideReport;
