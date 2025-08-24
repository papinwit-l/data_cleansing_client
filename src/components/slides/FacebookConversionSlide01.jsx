import React, { useEffect, useMemo, useState, useCallback } from "react";
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

function FacebookConversionSlide01() {
  const {
    loading,
    error,
    refetch,
    FacebookConversionAudienceData,
    FacebookConversionAudienceTotals,
    FacebookConversionAudienceMetrics,
    FacebookConversionAudienceComparison,
    FacebookConversionCreativeData,
    FacebookConversionCreativeTotals,
    FBDemographicData,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([8]);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    try {
      // Handle "No Data" case
      if (
        FacebookConversionAudienceTotals?.clicks === "No Data" ||
        !FacebookConversionAudienceTotals ||
        Object.keys(FacebookConversionAudienceTotals).length === 0
      ) {
        setSummaryText("<li>No data available for the selected period</li>");
        return;
      }

      let summaryTextTemp = "";
      const overallText = `Overall Conversions: ** ${parseFloat(
        FacebookConversionAudienceTotals?.conversions?.toFixed(2) || 0
      )?.toLocaleString()} conversions**`;
      summaryTextTemp = `<li>${overallText}</li>`;

      summaryTextTemp += `<li>Average CPL: **${FacebookConversionAudienceTotals.cpl?.toLocaleString(
        undefined,
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )} THB**</li>`;

      // Find top audience by conversions (with error handling)
      const topAudience = FacebookConversionAudienceData
        ? Object.entries(FacebookConversionAudienceData).reduce(
            (max, [key, value]) =>
              (value?.conversions || 0) > (max.value?.conversions || 0)
                ? { key, value }
                : max,
            { key: "", value: { conversions: 0 } }
          )
        : { key: "", value: { conversions: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top Audience: **${
          topAudience.key
        } (with ${topAudience.value.conversions?.toLocaleString()} conversions)**`;
        summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by conversions (with error handling)
      const topCreative = FacebookConversionCreativeData
        ? Object.entries(FacebookConversionCreativeData).reduce(
            (max, [key, value]) =>
              (value?.conversions || 0) > (max.value?.conversions || 0)
                ? { key, value }
                : max,
            { key: "", value: { conversions: 0 } }
          )
        : { key: "", value: { conversions: 0 } };

      if (topCreative.key) {
        const topCreativeText = `Top Creative: **${
          topCreative.key
        } (with ${topCreative.value.conversions?.toLocaleString()} conversions)**`;
        // summaryTextTemp += `<li>${topCreativeText}</li>`;
      }

      setSummaryText(summaryTextTemp);
    } catch (error) {
      console.error("Error in summarizeData:", error);
      setSummaryText("<li>Error generating summary</li>");
    }
  }, [
    FacebookConversionAudienceTotals,
    FacebookConversionAudienceData,
    FacebookConversionCreativeData,
  ]);

  //Demographic for chart
  const { impressionsByGender, impressionsByAge } = useMemo(() => {
    try {
      if (!FBDemographicData || FBDemographicData.length === 0) {
        return {
          impressionsByGender: {},
          impressionsByAge: {},
        };
      }

      // Filter for FB Lead data
      const filteredDemographicData = FBDemographicData.filter((item) => {
        return item?.Channel?.trim() === "FB Lead";
      });

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
  }, [FBDemographicData]);

  // Fix: Add summarizeData to dependency array
  useEffect(() => {
    summarizeData();
  }, [summarizeData]);

  // Fix: Memoize formatted metrics to prevent unnecessary recalculations
  const formattedMetrics = useMemo(() => {
    if (
      !FacebookConversionAudienceTotals ||
      !FacebookConversionAudienceComparison
    ) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        FacebookConversionAudienceTotals?.impressions,
        FacebookConversionAudienceComparison?.impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        FacebookConversionAudienceTotals?.clicks,
        FacebookConversionAudienceComparison?.clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        FacebookConversionAudienceTotals?.ctr,
        FacebookConversionAudienceComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        FacebookConversionAudienceTotals?.cpc,
        FacebookConversionAudienceComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        FacebookConversionAudienceTotals?.conversions,
        FacebookConversionAudienceComparison?.conversions,
        "number"
      ),
      cplData: formatDisplayData(
        FacebookConversionAudienceTotals?.cpl,
        FacebookConversionAudienceComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        FacebookConversionAudienceTotals?.spent,
        FacebookConversionAudienceComparison?.spent,
        "compact"
      ),
      conRate: formatDisplayData(
        FacebookConversionAudienceTotals?.cvr,
        FacebookConversionAudienceComparison?.cvr,
        "percentage"
      ),
      cpmData: formatDisplayData(
        FacebookConversionAudienceTotals?.cpm,
        FacebookConversionAudienceComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        FacebookConversionAudienceTotals?.reach,
        FacebookConversionAudienceComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        FacebookConversionAudienceTotals?.frequency,
        FacebookConversionAudienceComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        FacebookConversionAudienceTotals?.cpr,
        FacebookConversionAudienceComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        FacebookConversionAudienceTotals?.engagements,
        FacebookConversionAudienceComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        FacebookConversionAudienceTotals?.engagementRate,
        FacebookConversionAudienceComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        FacebookConversionAudienceTotals?.cpe,
        FacebookConversionAudienceComparison?.cpe,
        "compact"
      ),
    };
  }, [FacebookConversionAudienceTotals, FacebookConversionAudienceComparison]);

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
      id="facebook-conversion-01-component"
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
      <SlideHeader title={"Facebook Conversion (1/2)"} />
      <div className="flex flex-col h-full gap-2">
        <div className="grid grid-cols-16">
          <div className="col-span-12 flex flex-col gap-2">
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
                title={"Conversion"}
                value={formattedMetrics.conversionsData?.displayValue}
                compareValue={formattedMetrics.conversionsData?.compareValue}
                isNegative={formattedMetrics.conversionsData?.isNegative}
                isConversion={true}
              />

              <NumberDisplayBox
                title={"%Conv Rate"}
                value={formattedMetrics.conRate?.displayValue}
                compareValue={formattedMetrics.conRate?.compareValue}
                isNegative={formattedMetrics.conRate?.isNegative}
                isConversion={true}
              />

              <NumberDisplayBox
                title={"CPL"}
                value={formattedMetrics.cplData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.cplData?.compareValue}
                isNegative={formattedMetrics.cplData?.isNegative}
                invertCompareColor={true}
              />

              <NumberDisplayBox
                title={"Spent"}
                value={formattedMetrics.spentData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.spentData?.compareValue}
                isNegative={formattedMetrics.spentData?.isNegative}
                invertCompareColor={true}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Audience</h4>

              <AdvancedDataTable
                firstMetric="Ad set name"
                channelData={FacebookConversionAudienceData}
                totalData={FacebookConversionAudienceTotals}
                metrics={[
                  "Ad set name",
                  "impressions",
                  "reach",
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
            </div>
          </div>
          {/* Chart */}
          <div className="col-span-4 flex flex-col">
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
            />
          </div>
        </div>
        <div className="grid grid-cols-16">
          <div className="col-span-16">
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

export default FacebookConversionSlide01;
