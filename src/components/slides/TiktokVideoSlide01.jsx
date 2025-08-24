import React, { useEffect, useMemo, useState, useCallback } from "react";
import SlideHeader from "./SlideHeader";
import NumberDisplayBox from "./utils/NumberDisplayBox";
import TextEditorModal from "./utils/TextEditorModal";
import { useData } from "@/contexts/dataContext";
import DonutChart from "../charts-tables/DonutChart";
import { Edit, Video } from "lucide-react";
import { Button } from "../ui/button";

// Import utility functions
import {
  formatDisplayData,
  formatTableValue,
  formatMetricsData,
  METRIC_CONFIGS,
} from "@/utils/dataDisplayUtils";
import { AdvancedDataTable } from "../charts-tables/AdvancedDataTable";

function TiktokVideoSlide01() {
  const {
    loading,
    error,
    refetch,
    FacebookAdsPicture,
    FBDemographicData,
    TikTokVideoAudienceData,
    TikTokVideoAudienceTotals,
    TikTokVideoCreativeData,
    TikTokVideoCreativeTotals,
    TikTokVideoAudienceMetrics,
    TikTokVideoAudienceComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0, 0]);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    const KEY = "views";
    const ENABLE_CONVERSION = false;
    try {
      // Handle "No Data" case
      if (
        TikTokVideoAudienceTotals[KEY] === "No Data" ||
        !TikTokVideoAudienceTotals ||
        Object.keys(TikTokVideoAudienceTotals).length === 0
      ) {
        setSummaryText("<li>No data available for the selected period</li>");
        return;
      }

      let summaryTextTemp = "";
      const averageCPV = TikTokVideoAudienceTotals.cpv?.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
      const overallText = `Overall VDO View: ** ${parseFloat(
        TikTokVideoAudienceTotals[KEY]?.toFixed(2) || 0
      )?.toLocaleString()} VDO Views`;
      summaryTextTemp = `<li>${overallText}**</li>`;
      // summaryTextTemp += `<li>Overall conversion Value: **${parseFloat(
      //   TikTokVideoAudienceTotals["purchaseConValue"]?.toFixed(2) || 0
      // )?.toLocaleString()} THB with ${parseFloat(
      //   TikTokVideoAudienceTotals["roas"]?.toFixed(2) || 0
      // )?.toLocaleString()} of ROAS**</li>`;
      summaryTextTemp += `<li>Average CPV: **${averageCPV} THB**</li>`;

      // Find top audience by reach (with error handling)
      const topAudience = TikTokVideoAudienceData
        ? Object.entries(TikTokVideoAudienceData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top audience: **${
          topAudience.key
        } with ${topAudience.value[KEY]?.toLocaleString()} VDO Views**`;
        summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by reach (with error handling)
      const topCreative = TikTokVideoCreativeData
        ? Object.entries(TikTokVideoCreativeData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      // if (topCreative.key) {
      // Fix: Added missing closing parenthesis
      const topCreativeText = `Top Creative: **${
        topCreative.key
      } with ${topCreative.value[KEY]?.toLocaleString()} VDO Views**`;
      summaryTextTemp += `<li>${topCreativeText}</li>`;
      // }

      const totalConversions = TikTokVideoAudienceTotals?.Conversions;
      // if (totalConversions > 0 && ENABLE_CONVERSION) {
      //   summaryTextTemp += `<li>Total conversion: **${totalConversions?.toLocaleString(
      //     undefined,
      //     { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      //   )} conversions**</li>`;
      // }

      setSummaryText(summaryTextTemp);
    } catch (error) {
      console.error("Error in summarizeData:", error);
      setSummaryText("<li>Error generating summary</li>");
    }
  }, [
    TikTokVideoAudienceTotals,
    TikTokVideoAudienceData,
    TikTokVideoCreativeData,
  ]);

  //Demographic for chart
  const { chartByGender, chartByDevice } = useMemo(() => {
    const GRAPH_KEY = "purchase";
    const CHANNEL = "FB Catalog Sales";
    try {
      if (!FBDemographicData || FBDemographicData.length === 0) {
        return {
          chartByGender: {},
          chartByDevice: {},
        };
      }

      // Filter Channel
      const filteredDemographicData = FBDemographicData.filter((item) => {
        return item?.Channel?.trim() === CHANNEL;
      });

      if (filteredDemographicData.length === 0) {
        return {
          chartByGender: {},
          chartByDevice: {},
        };
      }

      // Helper function for consistent parsing
      const parseHelper = (value) => {
        if (value === null || value === undefined || value === "") return 0;
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Group by the specified field
      const sumGraphHelper = (key, graphBy) => {
        return filteredDemographicData.reduce((acc, item) => {
          if (item[graphBy] && item[key] !== undefined) {
            acc[item[graphBy]] =
              (acc[item[graphBy]] || 0) + parseHelper(item[key]);
          }
          return acc;
        }, {});
      };

      // By Gender
      const sumGraphByGender = sumGraphHelper(GRAPH_KEY, "Gender");
      const totalGraphByGender = Object.values(sumGraphByGender).reduce(
        (a, b) => a + b,
        0
      );

      // By Device
      const sumGraphByDevice = sumGraphHelper(GRAPH_KEY, "Device");
      const totalGraphByDevice = Object.values(sumGraphByDevice).reduce(
        (a, b) => a + b,
        0
      );

      // Early return if no impressions
      if (totalGraphByGender === 0 && totalGraphByDevice === 0) {
        return {
          chartByGender: {},
          chartByDevice: {},
        };
      }

      // Calculate percentages with correct totals
      const genderPercentages =
        totalGraphByGender > 0
          ? Object.entries(sumGraphByGender).reduce((acc, [gender, key]) => {
              acc[gender] = ((key / totalGraphByGender) * 100).toFixed(2) + "%";
              return acc;
            }, {})
          : {};

      const agePercentages =
        totalGraphByDevice > 0
          ? Object.entries(sumGraphByDevice).reduce((acc, [age, key]) => {
              acc[age] = ((key / totalGraphByDevice) * 100).toFixed(2) + "%";
              return acc;
            }, {})
          : {};

      return {
        chartByGender: genderPercentages,
        chartByDevice: agePercentages,
      };
    } catch (error) {
      console.error("Error processing demographic data:", error);
      return {
        chartByGender: {},
        chartByDevice: {},
      };
    }
  }, [FBDemographicData]);
  // Fix: Add summarizeData to dependency array
  useEffect(() => {
    summarizeData();
  }, [summarizeData]);

  // Fix: Memoize formatted metrics to prevent unnecessary recalculations
  const formattedMetrics = useMemo(() => {
    if (!TikTokVideoAudienceTotals || !TikTokVideoAudienceComparison) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        TikTokVideoAudienceTotals?.impressions,
        TikTokVideoAudienceComparison?.impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        TikTokVideoAudienceTotals?.clicks,
        TikTokVideoAudienceComparison?.clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        TikTokVideoAudienceTotals?.ctr,
        TikTokVideoAudienceComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        TikTokVideoAudienceTotals?.cpc,
        TikTokVideoAudienceComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        TikTokVideoAudienceTotals?.conversions,
        TikTokVideoAudienceComparison?.conversions,
        "number"
      ),
      cplData: formatDisplayData(
        TikTokVideoAudienceTotals?.cpl,
        TikTokVideoAudienceComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        TikTokVideoAudienceTotals?.spent,
        TikTokVideoAudienceComparison?.spent,
        "compact"
      ),
      conRate: formatDisplayData(
        TikTokVideoAudienceTotals?.cvr,
        TikTokVideoAudienceComparison?.cvr,
        "percentage"
      ),
      cpmData: formatDisplayData(
        TikTokVideoAudienceTotals?.cpm,
        TikTokVideoAudienceComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        TikTokVideoAudienceTotals?.reach,
        TikTokVideoAudienceComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        TikTokVideoAudienceTotals?.frequency,
        TikTokVideoAudienceComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        TikTokVideoAudienceTotals?.cpr,
        TikTokVideoAudienceComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        TikTokVideoAudienceTotals?.engagements,
        TikTokVideoAudienceComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        TikTokVideoAudienceTotals?.engagementRate,
        TikTokVideoAudienceComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        TikTokVideoAudienceTotals?.cpe,
        TikTokVideoAudienceComparison?.cpe,
        "compact"
      ),
      viewRateData: formatDisplayData(
        TikTokVideoAudienceTotals?.viewRate,
        TikTokVideoAudienceComparison?.viewRate,
        "percentage"
      ),
      VideoViewsData: formatDisplayData(
        TikTokVideoAudienceTotals["views"],
        TikTokVideoAudienceComparison["views"],
        "number"
      ),
      cpvData: formatDisplayData(
        TikTokVideoAudienceTotals?.cpv,
        TikTokVideoAudienceComparison?.cpv,
        "compact"
      ),
      conRateData: formatDisplayData(
        TikTokVideoAudienceTotals?.conRate,
        TikTokVideoAudienceComparison?.conRate,
        "percentage"
      ),
      purchaseConValueData: formatDisplayData(
        TikTokVideoAudienceTotals?.purchaseConValue,
        TikTokVideoAudienceComparison?.purchaseConValue,
        "compact"
      ),
      roasData: formatDisplayData(
        TikTokVideoAudienceTotals?.roas,
        TikTokVideoAudienceComparison?.roas,
        "compact"
      ),
      purchaseData: formatDisplayData(
        TikTokVideoAudienceTotals?.purchase,
        TikTokVideoAudienceComparison?.purchase,
        "number"
      ),
      addToCartData: formatDisplayData(
        TikTokVideoAudienceTotals?.addToCart,
        TikTokVideoAudienceComparison?.addToCart,
        "number"
      ),
      view6secData: formatDisplayData(
        TikTokVideoAudienceTotals?.view6sec,
        TikTokVideoAudienceComparison?.view6sec,
        "number"
      ),
    };
  }, [TikTokVideoAudienceTotals, TikTokVideoAudienceComparison]);

  // Memoize text formatter
  const renderFormattedText = useCallback((text) => {
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
  }, []);

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

  return (
    <div
      id="tiktok-video-01-component"
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
      <SlideHeader title={"TikTok VDO View"} />
      <div className="flex flex-col h-full gap-2">
        <div className="grid grid-cols-20 h-full">
          <div className="col-span-14 flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-2">
              <h4 className="col-span-5 text-lg font-semibold">
                Awareness & Considerations
              </h4>
              <h4 className="col-span-2 text-lg font-semibold">Conversions</h4>

              <NumberDisplayBox
                title={"Impression"}
                value={formattedMetrics.impressionData?.displayValue}
                compareValue={formattedMetrics.impressionData?.compareValue}
                isNegative={formattedMetrics.impressionData?.isNegative}
              />
              <NumberDisplayBox
                title={"Reach"}
                value={formattedMetrics.reachData?.displayValue}
                compareValue={formattedMetrics.reachData?.compareValue}
                isNegative={formattedMetrics.reachData?.isNegative}
              />

              <NumberDisplayBox
                title={"Video views"}
                value={formattedMetrics.VideoViewsData?.displayValue}
                compareValue={formattedMetrics.VideoViewsData?.compareValue}
                isNegative={formattedMetrics.VideoViewsData?.isNegative}
              />

              <NumberDisplayBox
                title={"%View Rate"}
                value={formattedMetrics.viewRateData?.displayValue}
                compareValue={formattedMetrics.viewRateData?.compareValue}
                isNegative={formattedMetrics.viewRateData?.isNegative}
              />

              <NumberDisplayBox
                title={"CPV"}
                value={formattedMetrics.cpvData?.displayValue}
                compareValue={formattedMetrics.cpvData?.compareValue}
                isNegative={formattedMetrics.cpvData?.isNegative}
                invertCompareColor={true}
              />

              <NumberDisplayBox
                title={"Conversions"}
                value={formattedMetrics.conversionsData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.conversionsData?.compareValue}
                isNegative={formattedMetrics.conversionsData?.isNegative}
              />

              <NumberDisplayBox
                title={"Spent"}
                value={formattedMetrics.spentData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.spentData?.compareValue}
                isNegative={formattedMetrics.spentData?.isNegative}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Audience</h4>

              <AdvancedDataTable
                firstMetric="Ad group name"
                channelData={TikTokVideoAudienceData}
                totalData={TikTokVideoAudienceTotals}
                metrics={[
                  "Ad group name",
                  "impressions",
                  "reach",
                  "views",
                  "viewRate",
                  "cpv",
                  "conversions",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="views"
                defaultSortOrder="desc"
                enableSorting={true}
              />
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={TikTokVideoCreativeData}
                totalData={TikTokVideoAudienceTotals}
                metrics={[
                  "Ad name",
                  "impressions",
                  "reach",
                  "views",
                  "viewRate",
                  "cpv",
                  "conversions",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[1]}
                defaultSortBy="views"
                defaultSortOrder="desc"
                enableSorting={true}
              />
            </div>
          </div>
          <div className="col-span-6 flex flex-col justify-between">
            {/* Image Preview */}
            <div className=""></div>
          </div>
          {/* Summary */}
          <div className="px-4 mt-6 col-span-10">
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

export default TiktokVideoSlide01;
