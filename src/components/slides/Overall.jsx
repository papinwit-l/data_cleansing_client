import React, { useEffect, useMemo, useState } from "react";
import SlideHeader from "./SlideHeader";
import NumberDisplayBox from "./utils/NumberDisplayBox";
import TextEditorModal from "./utils/TextEditorModal";
import { useData } from "@/contexts/dataContext";
import DonutChart from "../charts-tables/DonutChart";
import { Edit } from "lucide-react";
import { Button } from "../ui/button";

// Import utility functions
import {
  formatDisplayData,
  formatTableValue,
  formatMetricsData,
  METRIC_CONFIGS,
} from "@/utils/dataDisplayUtils";
import { AdvancedDataTable } from "../charts-tables/AdvancedDataTable";

function Overall() {
  const {
    loading,
    error,
    refetch,
    GGDemographicData,
    overallData,
    overallTotals,
    overallMetrics,
    overallComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0]);

  const summarizeData = () => {
    // Handle "No Data" case
    if (
      overallTotals?.Clicks === "No Data" ||
      !overallTotals ||
      Object.keys(overallTotals).length === 0
    ) {
      setSummaryText("<li>No data available for the selected period</li>");
      return;
    }

    let summaryTextTemp = "";
    const overallText = `Overall: **CPL ${parseFloat(
      overallTotals?.cpl?.toFixed(2) || 0
    )?.toLocaleString()} THB with ${
      overallTotals.Conversions || 0
    } conversions**`;
    summaryTextTemp = `<li>${overallText}</li>`;

    // Find top channel by conversions
    const topConversionChannel = Object.entries(overallData).reduce(
      (max, [key, value]) =>
        (value.Conversions || 0) > (max.value.Conversions || 0)
          ? { key, value }
          : max,
      { key: "", value: { Conversions: 0 } }
    );

    if (topConversionChannel.key) {
      const topChannelText = `Highest conversion channel: **${
        topConversionChannel.key
      } with ${topConversionChannel.value.Conversions?.toLocaleString()} conversions (${(
        (topConversionChannel.value.Conversions / overallTotals.Conversions) *
        100
      ).toFixed(2)}% of total conversions)**`;
      summaryTextTemp += `<li>${topChannelText}</li>`;
    }

    // Find top channel by conversion rate
    const topConversionRateChannel = Object.entries(overallData).reduce(
      (max, [key, value]) =>
        (value.conRate || 0) > (max.value.conRate || 0) ? { key, value } : max,
      { key: "", value: { conRate: 0 } }
    );

    if (
      topConversionRateChannel.key &&
      topConversionRateChannel.key !== topConversionChannel.key
    ) {
      const topRateText = `Highest conversion rate channel: **${
        topConversionRateChannel.key
      } with ${topConversionRateChannel.value.conRate?.toFixed(
        2
      )}% conversion rate**`;
      summaryTextTemp += `<li>${topRateText}</li>`;
    }

    setSummaryText(summaryTextTemp);
  };

  // Demographic for chart
  const { impressionsByGender, impressionsByAge } = useMemo(() => {
    try {
      if (!GGDemographicData || GGDemographicData.length === 0) {
        return {
          impressionsByGender: {},
          impressionsByAge: {},
        };
      }

      // Filter for demographic data
      const filteredDemographicData = [...GGDemographicData];

      if (filteredDemographicData.length === 0) {
        return {
          impressionsByGender: {},
          impressionsByAge: {},
        };
      }

      // Helper function for consistent parsing
      const parseImpressions = (value) => {
        if (value === null || value === undefined || value === "") return 0;
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Gender impressions
      const sumImpressionsByGender = filteredDemographicData.reduce(
        (acc, item) => {
          if (item?.Gender && item?.Impressions !== undefined) {
            acc[item.Gender] =
              (acc[item.Gender] || 0) + parseImpressions(item.Impressions);
          }
          return acc;
        },
        {}
      );

      const totalGenderImpressions = Object.values(
        sumImpressionsByGender
      ).reduce((a, b) => a + b, 0);

      // Age impressions
      const sumImpressionsByAge = filteredDemographicData.reduce(
        (acc, item) => {
          if (item?.Age && item?.Impressions !== undefined) {
            acc[item.Age] =
              (acc[item.Age] || 0) + parseImpressions(item.Impressions);
          }
          return acc;
        },
        {}
      );

      const totalAgeImpressions = Object.values(sumImpressionsByAge).reduce(
        (a, b) => a + b,
        0
      );

      // Early return if no impressions
      if (totalGenderImpressions === 0 && totalAgeImpressions === 0) {
        return {
          impressionsByGender: {},
          impressionsByAge: {},
        };
      }

      // Calculate percentages with correct totals
      const genderPercentages =
        totalGenderImpressions > 0
          ? Object.entries(sumImpressionsByGender).reduce(
              (acc, [gender, impressions]) => {
                acc[gender] =
                  ((impressions / totalGenderImpressions) * 100).toFixed(2) +
                  "%";
                return acc;
              },
              {}
            )
          : {};

      const agePercentages =
        totalAgeImpressions > 0
          ? Object.entries(sumImpressionsByAge).reduce(
              (acc, [age, impressions]) => {
                acc[age] =
                  ((impressions / totalAgeImpressions) * 100).toFixed(2) + "%";
                return acc;
              },
              {}
            )
          : {};

      return {
        impressionsByGender: genderPercentages,
        impressionsByAge: agePercentages,
      };
    } catch (error) {
      console.error("Error processing demographic data:", error);
      return {
        impressionsByGender: {},
        impressionsByAge: {},
      };
    }
  }, [GGDemographicData]);

  useEffect(() => {
    // console.log("Overall data", overallData);
    summarizeData();
  }, [overallTotals, overallData]);

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
  const impressionData = formatDisplayData(
    overallTotals?.Impressions,
    overallComparison?.Impressions,
    "compact"
  );
  const clicksData = formatDisplayData(
    overallTotals?.Clicks,
    overallComparison?.Clicks,
    "compact"
  );
  const ctrData = formatDisplayData(
    overallTotals?.ctr,
    overallComparison?.ctr,
    "percentage"
  );
  const reachData = formatDisplayData(
    overallTotals?.Reach,
    overallComparison?.Reach,
    "compact"
  );
  const conversionsData = formatDisplayData(
    overallTotals?.Conversions,
    overallComparison?.Conversions,
    "number"
  );
  const conRateData = formatDisplayData(
    overallTotals?.conRate,
    overallComparison?.conRate,
    "percentage"
  );
  const cplData = formatDisplayData(
    overallTotals?.cpl,
    overallComparison?.cpl,
    "compact"
  );
  const spentData = formatDisplayData(
    overallTotals?.Spent,
    overallComparison?.Spent,
    "compact"
  );

  return (
    <div
      id="overall-component"
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
      <SlideHeader title={"Overall"} />
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-16">
          <div className="col-span-16 flex flex-col gap-2">
            <div className="grid grid-cols-8 gap-2">
              <h4 className="col-span-4 text-lg font-semibold">
                Awareness & Considerations
              </h4>
              <h4 className="col-span-4 text-lg font-semibold">Conversions</h4>

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
                title={"Clicks"}
                value={clicksData.displayValue}
                compareValue={clicksData.compareValue}
                isNegative={clicksData.isNegative}
              />
              <NumberDisplayBox
                title={"%CTR"}
                value={ctrData.displayValue}
                compareValue={ctrData.compareValue}
                isNegative={ctrData.isNegative}
              />
              <NumberDisplayBox
                title={"Conversions"}
                value={conversionsData.displayValue}
                isConversion={true}
                compareValue={conversionsData.compareValue}
                isNegative={conversionsData.isNegative}
              />
              <NumberDisplayBox
                title={"%Con Rate"}
                value={conRateData.displayValue}
                compareValue={conRateData.compareValue}
                isConversion={true}
                isNegative={conRateData.isNegative}
              />
              <NumberDisplayBox
                title={"CPL"}
                value={cplData.displayValue}
                compareValue={cplData.compareValue}
                isConversion={true}
                isNegative={cplData.isNegative}
                invertCompareColor={true}
              />
              <NumberDisplayBox
                title={"Spent"}
                value={spentData.displayValue}
                compareValue={spentData.compareValue}
                isConversion={true}
                isNegative={spentData.isNegative}
                invertCompareColor={true}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Channel</h4>

              <AdvancedDataTable
                firstMetric="Channel"
                channelData={overallData}
                totalData={overallTotals}
                metrics={[
                  "Channel",
                  "Impressions",
                  "Reach",
                  "Clicks",
                  "ctr",
                  "Conversions",
                  "conRate",
                  "cpl",
                  "Spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="Conversions"
                defaultSortOrder="desc"
                enableSorting={true}
              />
            </div>
            <div className="grid grid-cols-2">
              <div className="col-span-1">
                {/* Summary */}
                <div className="px-4">
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
          <div className="col-span-4 flex flex-col ml-2 mt-8 justify-between items-center">
            {/* Chart */}
            {/* <div className="col-span-3">
              <DonutChart
                data={impressionsByGender}
                title="Impression By Gender"
                width={220}
                height={160}
                innerRadius={30}
                outerRadius={60}
                isPercentage={true}
              />
              <DonutChart
                data={impressionsByAge}
                title="Impression By Age"
                width={220}
                height={160}
                innerRadius={30}
                outerRadius={60}
                isPercentage={true}
                isLegendWrap={false}
              />
            </div> */}
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

export default Overall;
