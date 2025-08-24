"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Download, Loader2 } from "lucide-react";
import axios from "axios";
import React, { useEffect } from "react";

const TARGET_URL =
  "https://lookerstudio.google.com/u/0/reporting/d0ce7551-e5d8-43b4-b572-eabd2c7e8ba3/page/4SVjC";

function Home() {
  const [screenshot, setScreenshot] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [recommendationText, setRecommendationText] = React.useState("");
  const [slideReport, setSlideReport] = React.useState(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/scrape/take-screenshot",
        {
          url: TARGET_URL,
        }
      );
      const data = response.data;
      const capture = data?.screenshot;
      const recommendation = data?.recommendationText;
      setScreenshot(capture);
      setTitle(data?.title);
      setRecommendationText(recommendation);
      setSlideReport(data?.slideReport);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGotoSlideReport = () => {
    window.open(slideReport.presentationUrl, "_blank");
  };

  const downloadScreenshot = () => {
    if (screenshot) {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${screenshot}`;
      link.download = `screenshot-${Date.now()}.png`;
      link.click();
    }
  };

  useEffect(() => {
    // redirect to /slide-rport
    window.location.href = "/slide-report";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-800 mb-2">
            Screenshot Capture
          </h1>
          <p className="text-yellow-600">
            Capture screenshots from Looker Studio
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-yellow-200 shadow-xl gap-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-700 flex items-center justify-center gap-2">
              <Camera className="w-6 h-6" />
              Dashboard Screenshot
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleClick}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 text-lg rounded-full shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Take Screenshot
                  </>
                )}
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
                <p className="text-yellow-600 font-medium">
                  Capturing your screenshot...
                </p>
              </div>
            )}

            {/* Screenshot Result */}
            {!loading && screenshot && (
              <div className="space-y-4">
                {/* Title */}
                {title && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg inline-block">
                      {title}
                    </h3>
                  </div>
                )}

                {/* Screenshot Image */}
                <div className="relative group">
                  <div className="bg-gradient-to-r from-yellow-200 to-amber-200 p-1">
                    <img
                      src={`data:image/png;base64,${screenshot}`}
                      alt="Screenshot"
                      className="w-full shadow-lg"
                    />
                  </div>

                  {/* Download Button Overlay */}
                  {/* <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      onClick={downloadScreenshot}
                      size="sm"
                      className="bg-white/90 hover:bg-white text-yellow-600 shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div> */}
                </div>

                {/* Recommendation */}
                {recommendationText && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg inline-block">
                      Recommendation
                    </h3>
                    <p className="text-yellow-600">{recommendationText}</p>
                  </div>
                )}

                {/* Goto Slide Report */}
                {slideReport && (
                  <Button onClick={handleGotoSlideReport}>Slide Report</Button>
                )}

                {/* Download Button (Always Visible) */}
                {/* <div className="flex justify-center pt-4">
                  <Button
                    onClick={downloadScreenshot}
                    variant="outline"
                    className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Screenshot
                  </Button>
                </div> */}
              </div>
            )}

            {/* Empty State */}
            {!loading && !screenshot && (
              <div className="text-center pb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                  <Camera className="w-10 h-10 text-yellow-400" />
                </div>
                <p className="text-yellow-500 text-lg">
                  Click the button above to capture a screenshot
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
