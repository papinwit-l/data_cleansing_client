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

function TiktokLeadSlide01() {
  const {
    loading,
    error,
    refetch,
    FacebookAdsPicture,
    FBDemographicData,
    TikTokLeadAudienceData,
    TikTokLeadAudienceTotals,
    TikTokLeadCreativeData,
    TikTokLeadCreativeTotals,
    TikTokLeadAudienceMetrics,
    TikTokLeadAudienceComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([5, 0]);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    const KEY = "conversions";
    const ENABLE_CONVERSION = false;
    try {
      // Handle "No Data" case
      if (
        TikTokLeadAudienceTotals[KEY] === "No Data" ||
        !TikTokLeadAudienceTotals ||
        Object.keys(TikTokLeadAudienceTotals).length === 0
      ) {
        setSummaryText("<li>No data available for the selected period</li>");
        return;
      }

      let summaryTextTemp = "";
      const averageCPL = TikTokLeadAudienceTotals.cpl?.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
      const overallText = `Overall conversions: ** ${parseFloat(
        TikTokLeadAudienceTotals[KEY]?.toFixed(2) || 0
      )?.toLocaleString()} conversions`;
      summaryTextTemp = `<li>${overallText}**</li>`;
      // summaryTextTemp += `<li>Overall conversion Value: **${parseFloat(
      //   TikTokLeadAudienceTotals["purchaseConValue"]?.toFixed(2) || 0
      // )?.toLocaleString()} THB with ${parseFloat(
      //   TikTokLeadAudienceTotals["roas"]?.toFixed(2) || 0
      // )?.toLocaleString()} of ROAS**</li>`;
      summaryTextTemp += `<li>Average CPL: **${averageCPL} THB**</li>`;

      // Find top audience by reach (with error handling)
      const topAudience = TikTokLeadAudienceData
        ? Object.entries(TikTokLeadAudienceData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top audience: **${
          topAudience.key
        } with ${topAudience.value[KEY]?.toLocaleString()} conversions**`;
        summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by reach (with error handling)
      const topCreative = TikTokLeadCreativeData
        ? Object.entries(TikTokLeadCreativeData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      // if (topCreative.key) {
      // Fix: Added missing closing parenthesis
      const topCreativeText = `Top Creative: **${
        topCreative.key
      } with ${topCreative.value[KEY]?.toLocaleString()} conversions**`;
      summaryTextTemp += `<li>${topCreativeText}</li>`;
      // }

      const totalConversions = TikTokLeadAudienceTotals?.Conversions;
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
    TikTokLeadAudienceTotals,
    TikTokLeadAudienceData,
    TikTokLeadCreativeData,
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
    if (!TikTokLeadAudienceTotals || !TikTokLeadAudienceComparison) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        TikTokLeadAudienceTotals?.impressions,
        TikTokLeadAudienceComparison?.impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        TikTokLeadAudienceTotals?.clicks,
        TikTokLeadAudienceComparison?.clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        TikTokLeadAudienceTotals?.ctr,
        TikTokLeadAudienceComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        TikTokLeadAudienceTotals?.cpc,
        TikTokLeadAudienceComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        TikTokLeadAudienceTotals?.conversions,
        TikTokLeadAudienceComparison?.conversions,
        "number"
      ),
      cplData: formatDisplayData(
        TikTokLeadAudienceTotals?.cpl,
        TikTokLeadAudienceComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        TikTokLeadAudienceTotals?.spent,
        TikTokLeadAudienceComparison?.spent,
        "compact"
      ),
      conRate: formatDisplayData(
        TikTokLeadAudienceTotals?.cvr,
        TikTokLeadAudienceComparison?.cvr,
        "percentage"
      ),
      cpmData: formatDisplayData(
        TikTokLeadAudienceTotals?.cpm,
        TikTokLeadAudienceComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        TikTokLeadAudienceTotals?.reach,
        TikTokLeadAudienceComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        TikTokLeadAudienceTotals?.frequency,
        TikTokLeadAudienceComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        TikTokLeadAudienceTotals?.cpr,
        TikTokLeadAudienceComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        TikTokLeadAudienceTotals?.engagements,
        TikTokLeadAudienceComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        TikTokLeadAudienceTotals?.engagementRate,
        TikTokLeadAudienceComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        TikTokLeadAudienceTotals?.cpe,
        TikTokLeadAudienceComparison?.cpe,
        "compact"
      ),
      viewRateData: formatDisplayData(
        TikTokLeadAudienceTotals?.viewRate,
        TikTokLeadAudienceComparison?.viewRate,
        "percentage"
      ),
      VideoViewsData: formatDisplayData(
        TikTokLeadAudienceTotals["views"],
        TikTokLeadAudienceComparison["views"],
        "number"
      ),
      cpvData: formatDisplayData(
        TikTokLeadAudienceTotals?.cpv,
        TikTokLeadAudienceComparison?.cpv,
        "compact"
      ),
      conRateData: formatDisplayData(
        TikTokLeadAudienceTotals?.cvr,
        TikTokLeadAudienceComparison?.cvr,
        "percentage"
      ),
      purchaseConValueData: formatDisplayData(
        TikTokLeadAudienceTotals?.purchaseConValue,
        TikTokLeadAudienceComparison?.purchaseConValue,
        "compact"
      ),
      roasData: formatDisplayData(
        TikTokLeadAudienceTotals?.roas,
        TikTokLeadAudienceComparison?.roas,
        "compact"
      ),
      purchaseData: formatDisplayData(
        TikTokLeadAudienceTotals?.purchase,
        TikTokLeadAudienceComparison?.purchase,
        "number"
      ),
      addToCartData: formatDisplayData(
        TikTokLeadAudienceTotals?.addToCart,
        TikTokLeadAudienceComparison?.addToCart,
        "number"
      ),
      view6secData: formatDisplayData(
        TikTokLeadAudienceTotals?.view6sec,
        TikTokLeadAudienceComparison?.view6sec,
        "number"
      ),
    };
  }, [TikTokLeadAudienceTotals, TikTokLeadAudienceComparison]);

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
      id="tiktok-lead-01-component"
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
      <SlideHeader title={"TikTok Lead"} />
      <div className="flex flex-col h-full gap-2">
        <div className="grid grid-cols-20 h-full">
          <div className="col-span-14 flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-2">
              <h4 className="col-span-3 text-lg font-semibold">
                Awareness & Considerations
              </h4>
              <h4 className="col-span-4 text-lg font-semibold">Conversions</h4>

              <NumberDisplayBox
                title={"Impression"}
                value={formattedMetrics.impressionData?.displayValue}
                compareValue={formattedMetrics.impressionData?.compareValue}
                isNegative={formattedMetrics.impressionData?.isNegative}
              />

              <NumberDisplayBox
                title={"Clicks"}
                value={formattedMetrics.clicksData?.displayValue}
                compareValue={formattedMetrics.clicksData?.compareValue}
                isNegative={formattedMetrics.clicksData?.isNegative}
              />

              <NumberDisplayBox
                title={"%CTR"}
                value={formattedMetrics.ctrData?.displayValue}
                compareValue={formattedMetrics.ctrData?.compareValue}
                isNegative={formattedMetrics.ctrData?.isNegative}
              />

              <NumberDisplayBox
                title={"Conversions"}
                value={formattedMetrics.conversionsData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.conversionsData?.compareValue}
                isNegative={formattedMetrics.conversionsData?.isNegative}
              />

              <NumberDisplayBox
                title={"%Conv Rate"}
                value={formattedMetrics.conRateData?.displayValue}
                compareValue={formattedMetrics.conRateData?.compareValue}
                isNegative={formattedMetrics.conRateData?.isNegative}
                isConversion={true}
                invertCompareColor={true}
              />

              <NumberDisplayBox
                title={"CPL"}
                value={formattedMetrics.cplData?.displayValue}
                compareValue={formattedMetrics.cplData?.compareValue}
                isNegative={formattedMetrics.cplData?.isNegative}
                isConversion={true}
                invertCompareColor={true}
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
                channelData={TikTokLeadAudienceData}
                totalData={TikTokLeadAudienceTotals}
                metrics={[
                  "Ad group name",
                  "impressions",
                  "clicks",
                  "ctr",
                  "conversions",
                  "cvr",
                  "cpl",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="conversions"
                defaultSortOrder="desc"
                enableSorting={true}
              />
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={TikTokLeadCreativeData}
                totalData={TikTokLeadAudienceTotals}
                metrics={[
                  "Ad name",
                  "impressions",
                  "clicks",
                  "ctr",
                  "conversions",
                  "cvr",
                  "cpl",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[1]}
                defaultSortBy="conversions"
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

export default TiktokLeadSlide01;
