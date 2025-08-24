import React, { useEffect, useState } from "react";
import SlideHeader from "./SlideHeader";
import NumberDisplayBox from "./utils/NumberDisplayBox";
import TextEditorModal from "./utils/TextEditorModal";
import { useData } from "@/contexts/dataContext";
import DonutChart from "../charts-tables/DonutChart";
import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import DataTable from "../charts-tables/DataTable";

// Import utility functions
import {
  formatDisplayData,
  formatTableValue,
  formatMetricsData,
  METRIC_CONFIGS,
} from "@/utils/dataDisplayUtils";
import { AdvancedDataTable } from "../charts-tables/AdvancedDataTable";

function FacebookReachSlide() {
  const {
    loading,
    error,
    refetch,
    GGDemographicData,
    FacebookAudienceData,
    FacebookAudienceTotals,
    FacebookAudienceMetrics,
    FacebookAudienceComparison,
    FacebookCreativeData,
    FacebookCreativeTotals,
    FacebookReachAudienceData,
    FacebookReachAudienceTotals,
    FacebookReachAudienceMetrics,
    FacebookReachAudienceComparison,
    FacebookReachCreativeData,
    FacebookReachCreativeTotals,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([5, 5]);

  const summarizeData = () => {
    // Handle "No Data" case
    if (
      FacebookReachAudienceTotals?.clicks === "No Data" ||
      !FacebookReachAudienceTotals ||
      Object.keys(FacebookReachAudienceTotals).length === 0
    ) {
      setSummaryText("<li>No data available for the selected period</li>");
      return;
    }

    let summaryTextTemp = "";
    const overallText = `Overall Reach: ** ${parseFloat(
      FacebookReachAudienceTotals?.reach?.toFixed(2) || 0
    )?.toLocaleString()} reaches**`;
    summaryTextTemp = `<li>${overallText}</li>`;

    summaryTextTemp += `<li>Average CPR: **${FacebookReachAudienceTotals.cpr?.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )} THB (per 1000 reaches)**</li>`;

    // Find top audience by reach (simpler approach)
    const topAudience = Object.entries(FacebookReachAudienceData).reduce(
      (max, [key, value]) =>
        (value.reach || 0) > (max.value.reach || 0) ? { key, value } : max,
      { key: "", value: { reach: 0 } }
    );

    const topAudienceText = `Top Audience: **${
      topAudience.key
    } (with ${topAudience.value.reach?.toLocaleString()} reaches)**`;
    summaryTextTemp += `<li>${topAudienceText}</li>`;

    // Find top creative by impressions (simpler approach)
    const topCreative = Object.entries(FacebookReachCreativeData).reduce(
      (max, [key, value]) =>
        (value.reach || 0) > (max.value.reach || 0) ? { key, value } : max,
      { key: "", value: { reach: 0 } }
    );
    const topCreativeText = `Top Creative: **${
      topCreative.key
    } (with ${topCreative.value.reach?.toLocaleString()} reaches**`;
    summaryTextTemp += `<li>${topCreativeText}</li>`;

    setSummaryText(summaryTextTemp);
  };

  useEffect(() => {
    summarizeData();
  }, [
    FacebookReachAudienceTotals,
    FacebookReachAudienceData,
    GGDemographicData,
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col py-7 px-10 border w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col py-7 px-10 border w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log("FacebookReachAudienceData", FacebookReachAudienceData);

  const renderFormattedText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>')
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/~~(.*?)~~/g, '<span class="text-red-500">$1</span>')
      .replace(/\+\+(.*?)\+\+/g, '<span class="text-green-500">$1</span>')
      .replace(
        /\[\[(.*?)\]\]/g,
        '<span class="text-blue-500 font-semibold">$1</span>'
      )
      .replace(/\{\{(.*?)\}\}/g, '<span class="text-lg font-bold">$1</span>')
      .replace(
        /\(\((.*?)\)\)/g,
        '<span class="text-xs text-gray-600">$1</span>'
      );
  };

  // Format display data with safe fallbacks
  // Using optional chaining to handle undefined/null values from useState
  const impressionData = formatDisplayData(
    FacebookReachAudienceTotals?.impressions,
    FacebookReachAudienceComparison?.impressions,
    "compact"
  );
  const clicksData = formatDisplayData(
    FacebookReachAudienceTotals?.clicks,
    FacebookReachAudienceComparison?.clicks,
    "compact"
  );
  const ctrData = formatDisplayData(
    FacebookReachAudienceTotals?.ctr,
    FacebookReachAudienceComparison?.ctr,
    "percentage"
  );
  const cpcData = formatDisplayData(
    FacebookReachAudienceTotals?.cpc,
    FacebookReachAudienceComparison?.cpc,
    "compact"
  );
  const conversionsData = formatDisplayData(
    FacebookReachAudienceTotals?.conversions,
    FacebookReachAudienceComparison?.conversions,
    "number"
  );
  const cplData = formatDisplayData(
    FacebookReachAudienceTotals?.cpl,
    FacebookReachAudienceComparison?.cpl,
    "compact"
  );
  const spentData = formatDisplayData(
    FacebookReachAudienceTotals?.spent,
    FacebookReachAudienceComparison?.spent,
    "compact"
  );
  const conRate = formatDisplayData(
    FacebookReachAudienceTotals?.cvr, // Changed from conRate to cvr
    FacebookReachAudienceComparison?.cvr,
    "percentage"
  );
  const cpmData = formatDisplayData(
    FacebookReachAudienceTotals?.cpm,
    FacebookReachAudienceComparison?.cpm,
    "compact"
  );
  const reachData = formatDisplayData(
    FacebookReachAudienceTotals?.reach,
    FacebookReachAudienceComparison?.reach,
    "compact"
  );
  const frequencyData = formatDisplayData(
    FacebookReachAudienceTotals?.frequency,
    FacebookReachAudienceComparison?.frequency,
    "compact"
  );
  const cprData = formatDisplayData(
    FacebookReachAudienceTotals?.cpr,
    FacebookReachAudienceComparison?.cpr,
    "compact"
  );

  // Alternative: Batch formatting approach (safer for useState data)
  // const formattedMetrics = formatMetricsData(DiscTotals, DiscComparison, METRIC_CONFIGS);
  // console.log("facebookMEtrics", FacebookAudienceMetrics);
  return (
    <div
      id="facebook-reach-component"
      className="flex flex-col py-7 px-10 border w-7xl h-[720px] gap-2 relative group bg-white"
    >
      {/* EDIT BUTTON */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          onClick={() => {
            setIsEditModalOpen(true);
          }}
        >
          <Edit />
        </Button>
      </div>
      <SlideHeader title={"Facebook Reach"} />
      <div className="flex flex-col h-full gap-2">
        <div className="grid grid-cols-16">
          <div className="col-span-13 flex flex-col gap-2">
            <div className="grid grid-cols-6 gap-2">
              <h4 className="col-span-6 text-lg font-semibold">
                Awareness & Considerations
              </h4>

              <NumberDisplayBox
                title={"Impression"}
                value={impressionData.displayValue}
                compareValue={impressionData.compareValue}
                isNegative={impressionData.isNegative}
              />
              <NumberDisplayBox
                title={"Reach"}
                value={reachData.displayValue}
                compareValue={reachData.compareValue}
                isNegative={reachData.isNegative}
              />

              <NumberDisplayBox
                title={"Frequency"}
                value={frequencyData.displayValue}
                compareValue={frequencyData.compareValue}
                isNegative={frequencyData.isNegative}
              />

              <NumberDisplayBox
                title={"CPR"}
                value={cprData.displayValue}
                compareValue={cprData.compareValue}
                isNegative={cprData.isNegative}
                invertCompareColor={true}
              />

              <NumberDisplayBox
                title={"Conversions"}
                value={conversionsData.displayValue}
                isConversion={true}
                compareValue={conversionsData.compareValue}
                isNegative={conversionsData.isNegative}
              />

              <NumberDisplayBox
                title={"Spent"}
                value={spentData.displayValue}
                isConversion={true}
                compareValue={spentData.compareValue}
                isNegative={spentData.isNegative}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Audience</h4>

              <AdvancedDataTable
                firstMetric="Ad set name"
                channelData={FacebookReachAudienceData}
                totalData={FacebookReachAudienceTotals}
                metrics={[
                  "Ad set name",
                  "impressions",
                  "reach",
                  "frequency",
                  "cpr",
                  "conversions",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="reach"
                defaultSortOrder="desc"
                enableSorting={true} // Can disable sorting if needed
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-16">
          <div className="col-span-11">
            <h4 className="text-lg font-semibold">Performance by Creative</h4>

            <AdvancedDataTable
              firstMetric="Ad name"
              channelData={FacebookReachCreativeData}
              totalData={FacebookReachCreativeTotals}
              metrics={[
                "Ad set name",
                "impressions",
                "reach",
                "frequency",
                "cpr",
                "conversions",
                "spent",
              ]}
              formatValue={formatTableValue}
              maxRows={maxTableRows[1]}
              defaultSortBy="reach"
              defaultSortOrder="desc"
              enableSorting={true} // Can disable sorting if needed
            />
          </div>
          <div className="col-span-5">
            {/* Summary */}
            <div className="px-4 mt-6">
              <h4 className="text-lg font-semibold">Summary</h4>
              <ul className="list-disc pl-6">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderFormattedText(summaryText),
                  }}
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
      <TextEditorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(newText) => setSummaryText(newText)}
        initialText={summaryText}
        revertText={summarizeData}
        title="Edit Summary Text"
        placeholder="Enter your summary text..."
        maxTableRows={maxTableRows}
        setMaxTableRows={setMaxTableRows}
      />
    </div>
  );
}

export default FacebookReachSlide;
