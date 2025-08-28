import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DateRangePicker from "@/components/slides/utils/DateRangePicker";
import {
  FileSpreadsheet,
  Presentation,
  Plus,
  Edit3,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  Trash2,
  MoreVertical,
  Clock,
} from "lucide-react";
import DateRangePickerV2 from "./utils/DateRangePickerV2";
import axiosInstance from "@/configs/axiosConfigs";

const SlideGeneratorSidebar = ({
  isOpen,
  onToggle,
  sheetsLink,
  sheetsID,
  ableToGenerate,
  isGenerating,
  slideGenerated,
  enableDateRange,
  isExporting,
  presentationUrl,
  onSheetsLinkChange,
  onGenerate,
  onEnableDateRangeChange,
  handleExportAllSlides,
  projectName,
  onProjectNameChange,
  reportType,
  onReportTypeChange,
}) => {
  const [savedUrls, setSavedUrls] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Storage key for localStorage
  const STORAGE_KEY = "slide_generator_saved_urls";

  const handleCheckFile = async () => {
    const response = await axiosInstance.get(
      `/data-sheets/check-file-type/${sheetsID}`
    );
    console.log("🎯 checkFileType result:", response.data);
  };

  // Load saved URLs from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedUrls = JSON.parse(saved);
        setSavedUrls(parsedUrls);

        // Check if current URL is already saved
        const isCurrentSaved = parsedUrls.some(
          (item) => item.url === sheetsLink
        );
        setIsSaved(isCurrentSaved);
      }
    } catch (error) {
      console.error("Error loading saved URLs:", error);
    }
  }, []);

  // Check if current URL is saved whenever sheetsLink changes
  useEffect(() => {
    const isCurrentSaved = savedUrls.some((item) => item.url === sheetsLink);
    setIsSaved(isCurrentSaved);
  }, [sheetsLink, savedUrls]);

  // Save URLs to localStorage
  const saveToStorage = (urls) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    } catch (error) {
      console.error("Error saving URLs:", error);
    }
  };

  // Extract title from URL or use project name
  const extractTitle = (url, projectName) => {
    if (projectName && projectName.trim()) {
      return projectName.trim();
    }

    // Try to extract sheet ID and use it as title
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `Sheet ${match[1].substring(0, 8)}...`;
    }

    return "Untitled Sheet";
  };

  // Save current URL
  const saveCurrentUrl = () => {
    if (!sheetsLink || !sheetsLink.trim()) return;

    const newItem = {
      id: Date.now(),
      url: sheetsLink,
      title: extractTitle(sheetsLink, projectName),
      projectName: projectName || "",
      reportType: reportType || "",
      savedAt: new Date().toISOString(),
    };

    const updatedUrls = [
      newItem,
      ...savedUrls.filter((item) => item.url !== sheetsLink),
    ];

    // Keep only the most recent 10 URLs
    const limitedUrls = updatedUrls.slice(0, 10);

    setSavedUrls(limitedUrls);
    saveToStorage(limitedUrls);
    setIsSaved(true);
  };

  // Remove saved URL
  const removeSavedUrl = (urlToRemove) => {
    const updatedUrls = savedUrls.filter((item) => item.url !== urlToRemove);
    setSavedUrls(updatedUrls);
    saveToStorage(updatedUrls);

    if (urlToRemove === sheetsLink) {
      setIsSaved(false);
    }
  };

  // Load saved URL
  const loadSavedUrl = (savedItem) => {
    onSheetsLinkChange({ target: { value: savedItem.url } });
    if (savedItem.projectName) {
      onProjectNameChange({ target: { value: savedItem.projectName } });
    }
    if (savedItem.reportType) {
      onReportTypeChange({ target: { value: savedItem.reportType } });
    }
  };

  // Clear all saved URLs
  const clearAllSavedUrls = () => {
    setSavedUrls([]);
    saveToStorage([]);
    setIsSaved(false);
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className={`fixed top-20 left-4 z-50 bg-white shadow-md border transition-all duration-300 ${
          isOpen ? "translate-x-80" : "translate-x-0"
        }`}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Slide Generator</h2>
              <p className="text-sm text-muted-foreground">Configuration</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Data Source Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-sm">Data Source</h3>
            </div>

            <Card className="shadow-sm py-1">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-sm font-medium">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    type="text"
                    placeholder="Project Name..."
                    value={projectName}
                    onChange={onProjectNameChange}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-type" className="text-sm font-medium">
                    Report Type
                  </Label>
                  <Input
                    id="report-type"
                    type="text"
                    placeholder="Monthly Report/Weekly Report..."
                    value={reportType}
                    onChange={onReportTypeChange}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Google Sheets URL with Remember Feature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sheet-link" className="text-sm font-medium">
                      Google Sheets URL
                    </Label>
                    <div className="flex items-center gap-1">
                      {sheetsLink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={
                            isSaved
                              ? () => removeSavedUrl(sheetsLink)
                              : saveCurrentUrl
                          }
                          className="h-6 w-6 p-0"
                          title={isSaved ? "Remove from saved" : "Save URL"}
                        >
                          {isSaved ? (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                      {savedUrls.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              title="Manage saved URLs"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={clearAllSavedUrls}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Clear All
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="sheet-link"
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetsLink}
                      onChange={onSheetsLinkChange}
                      className="font-mono text-sm"
                    />

                    {/* Saved URLs Dropdown */}
                    {savedUrls.length > 0 && (
                      <Select
                        onValueChange={(value) => {
                          const savedItem = savedUrls.find(
                            (item) => item.url === value
                          );
                          if (savedItem) loadSavedUrl(savedItem);
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <SelectValue placeholder="Load saved URL..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {savedUrls.map((item) => (
                            <SelectItem key={item.id} value={item.url}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {item.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.savedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {sheetsID && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Sheet ID
                    </Label>
                    <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
                      {sheetsID}
                    </div>
                    <Badge
                      variant={ableToGenerate ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {ableToGenerate ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                )}

                {/* Date Range Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Date Range</h3>
                  </div>

                  <Card className="shadow-sm py-1">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="date-range-enable"
                          checked={enableDateRange}
                          onChange={onEnableDateRangeChange}
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor="date-range-enable"
                          className="text-sm font-medium"
                        >
                          Enable date filtering
                        </Label>
                      </div>

                      {enableDateRange && (
                        <div className="pt-2 flex flex-col gap-2">
                          <DateRangePicker />
                          <DateRangePickerV2 />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating || !ableToGenerate}
                  className="w-full"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Generate Slides
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleCheckFile}>Check File Type</Button>

          {/* Actions Section */}
          {slideGenerated && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Presentation className="h-4 w-4 text-purple-600" />
                <h3 className="font-medium text-sm">Actions</h3>
              </div>

              <Card className="shadow-sm py-1">
                <CardContent className="p-4 space-y-3">
                  <Button
                    onClick={handleExportAllSlides}
                    disabled={isExporting}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Presentation className="mr-2 h-4 w-4" />
                        Export to Slides
                      </>
                    )}
                  </Button>

                  <Separator />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-30" onClick={onToggle} />
      )}
    </>
  );
};

export default SlideGeneratorSidebar;
