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

function TaboolaSlide() {
  const {
    loading,
    error,
    refetch,
    FacebookAdsPicture,
    FBDemographicData,
    TaboolaData,
    TaboolaTotals,
    TaboolaMetrics,
    TaboolaComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0]);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    const KEY = "Conversions";
    const ENABLE_CONVERSION = false;
    try {
      // Handle "No Data" case
      if (
        TaboolaTotals[KEY] === "No Data" ||
        !TaboolaTotals ||
        Object.keys(TaboolaTotals).length === 0
      ) {
        setSummaryText("<li>No data available for the selected period</li>");
        return;
      }

      let summaryTextTemp = "";
      const averageCPL = TaboolaTotals.cpl?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const overallText = `Overall conversions: ** ${parseFloat(
        TaboolaTotals[KEY]?.toFixed(2) || 0
      )?.toLocaleString()} conversions`;
      summaryTextTemp = `<li>${overallText}**</li>`;
      // summaryTextTemp += `<li>Overall conversion Value: **${parseFloat(
      //   TaboolaTotals["purchaseConValue"]?.toFixed(2) || 0
      // )?.toLocaleString()} THB with ${parseFloat(
      //   TaboolaTotals["roas"]?.toFixed(2) || 0
      // )?.toLocaleString()} of ROAS**</li>`;
      summaryTextTemp += `<li>Average CPL: **${averageCPL} THB**</li>`;

      // Find top audience by reach (with error handling)
      const topAudience = TaboolaData
        ? Object.entries(TaboolaData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top audience: **${
          topAudience.key
        } with ${topAudience.value[KEY]?.toLocaleString()} conversions**`;
        // summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by reach (with error handling)

      const totalConversions = TaboolaTotals?.Conversions;
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
  }, [TaboolaTotals, TaboolaData]);

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
    if (!TaboolaTotals || !TaboolaComparison) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        TaboolaTotals?.Impressions,
        TaboolaComparison?.Impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        TaboolaTotals?.Clicks,
        TaboolaComparison?.Clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        TaboolaTotals?.ctr,
        TaboolaComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        TaboolaTotals?.cpc,
        TaboolaComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        TaboolaTotals?.Conversions,
        TaboolaComparison?.Conversions,
        "number"
      ),
      cplData: formatDisplayData(
        TaboolaTotals?.cpl,
        TaboolaComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        TaboolaTotals?.Spent,
        TaboolaComparison?.Spent,
        "compact"
      ),
      cpmData: formatDisplayData(
        TaboolaTotals?.cpm,
        TaboolaComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        TaboolaTotals?.reach,
        TaboolaComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        TaboolaTotals?.frequency,
        TaboolaComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        TaboolaTotals?.cpr,
        TaboolaComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        TaboolaTotals?.engagements,
        TaboolaComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        TaboolaTotals?.engagementRate,
        TaboolaComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        TaboolaTotals?.cpe,
        TaboolaComparison?.cpe,
        "compact"
      ),
      viewRateData: formatDisplayData(
        TaboolaTotals?.viewRate,
        TaboolaComparison?.viewRate,
        "percentage"
      ),
      VideoViewsData: formatDisplayData(
        TaboolaTotals["views"],
        TaboolaComparison["views"],
        "number"
      ),
      cpvData: formatDisplayData(
        TaboolaTotals?.cpv,
        TaboolaComparison?.cpv,
        "compact"
      ),
      conRateData: formatDisplayData(
        TaboolaTotals?.conRate,
        TaboolaComparison?.conRate,
        "percentage"
      ),
      purchaseConValueData: formatDisplayData(
        TaboolaTotals?.purchaseConValue,
        TaboolaComparison?.purchaseConValue,
        "compact"
      ),
      roasData: formatDisplayData(
        TaboolaTotals?.roas,
        TaboolaComparison?.roas,
        "compact"
      ),
      purchaseData: formatDisplayData(
        TaboolaTotals?.purchase,
        TaboolaComparison?.purchase,
        "number"
      ),
      addToCartData: formatDisplayData(
        TaboolaTotals?.addToCart,
        TaboolaComparison?.addToCart,
        "number"
      ),
      view6secData: formatDisplayData(
        TaboolaTotals?.view6sec,
        TaboolaComparison?.view6sec,
        "number"
      ),
    };
  }, [TaboolaTotals, TaboolaComparison]);

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
      id="taboola-component"
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
      <SlideHeader title={"Taboola"} />
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
              <h4 className="text-lg font-semibold">Performance by Day</h4>

              <AdvancedDataTable
                firstMetric="Date"
                channelData={TaboolaData}
                totalData={TaboolaTotals}
                metrics={[
                  "Impressions",
                  "Clicks",
                  "ctr",
                  "Conversions",
                  "conRate",
                  "cpl",
                  "Spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
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

export default TaboolaSlide;
