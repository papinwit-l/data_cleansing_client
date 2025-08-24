import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import ImageFallback from "./utils/ImageFallback";

function FacebookReachSlide02() {
  const {
    loading,
    error,
    refetch,
    FacebookReachAudienceData,
    FacebookReachAudienceTotals,
    FacebookReachAudienceMetrics,
    FacebookReachAudienceComparison,
    FacebookReachCreativeData,
    FacebookReachCreativeTotals,
    FBDemographicData,
    FacebookAdsPicture,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    try {
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
      // summaryTextTemp = `<li>${overallText}</li>`;

      // summaryTextTemp += `<li>Average CPR: **${FacebookReachAudienceTotals.cpr?.toLocaleString(
      //   undefined,
      //   { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      // )} THB (per 1000 reaches)**</li>`;

      // Find top audience by reach (with error handling)
      const topAudience = FacebookReachAudienceData
        ? Object.entries(FacebookReachAudienceData).reduce(
            (max, [key, value]) =>
              (value?.reach || 0) > (max.value?.reach || 0)
                ? { key, value }
                : max,
            { key: "", value: { reach: 0 } }
          )
        : { key: "", value: { reach: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top Audience: **${
          topAudience.key
        } (with ${topAudience.value.reach?.toLocaleString()} reaches)**`;
        // summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by reach (with error handling)
      const topCreative = FacebookReachCreativeData
        ? Object.entries(FacebookReachCreativeData).reduce(
            (max, [key, value]) =>
              (value?.reach || 0) > (max.value?.reach || 0)
                ? { key, value }
                : max,
            { key: "", value: { reach: 0 } }
          )
        : { key: "", value: { reach: 0 } };

      if (topCreative.key) {
        // Fix: Added missing closing parenthesis
        const topCreativeText = `Top Creative: **${
          topCreative.key
        } (with ${topCreative.value.reach?.toLocaleString()} reaches)**`;
        summaryTextTemp += `<li>${topCreativeText}</li>`;
      }
      prepareAdsPicture(topCreative.key);
      setTopAds(topCreative.key);
      setSummaryText(summaryTextTemp);
    } catch (error) {
      console.error("Error in summarizeData:", error);
      setSummaryText("<li>Error generating summary</li>");
    }
  }, [
    FacebookReachAudienceTotals,
    FacebookReachAudienceData,
    FacebookReachCreativeData,
  ]);

  const prepareAdsPicture = (adsName) => {
    const adsPicture = FacebookAdsPicture.filter((item) => {
      return item["Ad name"] == adsName;
    });
    if (adsPicture.length === 0) return;
    // console.log("Ads Picture", adsPicture);
    setAdsPicture(adsPicture[0]["Ads"]);
  };

  //Demographic for chart
  const { impressionsByGender, impressionsByAge } = useMemo(() => {
    try {
      if (!FBDemographicData || FBDemographicData.length === 0) {
        return {
          impressionsByGender: {},
          impressionsByAge: {},
        };
      }

      // Filter for FB Reach data
      const filteredDemographicData = FBDemographicData.filter((item) => {
        return item?.Channel?.trim() === "FB Reach";
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
    if (!FacebookReachAudienceTotals || !FacebookReachAudienceComparison) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        FacebookReachAudienceTotals?.impressions,
        FacebookReachAudienceComparison?.impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        FacebookReachAudienceTotals?.clicks,
        FacebookReachAudienceComparison?.clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        FacebookReachAudienceTotals?.ctr,
        FacebookReachAudienceComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        FacebookReachAudienceTotals?.cpc,
        FacebookReachAudienceComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        FacebookReachAudienceTotals?.conversions,
        FacebookReachAudienceComparison?.conversions,
        "number"
      ),
      cplData: formatDisplayData(
        FacebookReachAudienceTotals?.cpl,
        FacebookReachAudienceComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        FacebookReachAudienceTotals?.spent,
        FacebookReachAudienceComparison?.spent,
        "compact"
      ),
      conRate: formatDisplayData(
        FacebookReachAudienceTotals?.cvr,
        FacebookReachAudienceComparison?.cvr,
        "percentage"
      ),
      cpmData: formatDisplayData(
        FacebookReachAudienceTotals?.cpm,
        FacebookReachAudienceComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        FacebookReachAudienceTotals?.reach,
        FacebookReachAudienceComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        FacebookReachAudienceTotals?.frequency,
        FacebookReachAudienceComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        FacebookReachAudienceTotals?.cpr,
        FacebookReachAudienceComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        FacebookReachAudienceTotals?.engagements,
        FacebookReachAudienceComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        FacebookReachAudienceTotals?.engagementRate,
        FacebookReachAudienceComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        FacebookReachAudienceTotals?.cpe,
        FacebookReachAudienceComparison?.cpe,
        "compact"
      ),
    };
  }, [FacebookReachAudienceTotals, FacebookReachAudienceComparison]);

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
      id="facebook-reach-02-component"
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
      <SlideHeader title={"Facebook Reach (2/2)"} />
      <div className="flex flex-col h-full gap-2">
        <div className="grid grid-cols-16">
          <div className="col-span-12 flex flex-col gap-2">
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
                title={"Reach"}
                value={formattedMetrics.reachData?.displayValue}
                compareValue={formattedMetrics.reachData?.compareValue}
                isNegative={formattedMetrics.reachData?.isNegative}
              />

              <NumberDisplayBox
                title={"CPR"}
                value={formattedMetrics.cprData?.displayValue}
                compareValue={formattedMetrics.cprData?.compareValue}
                isNegative={formattedMetrics.cprData?.isNegative}
                invertCompareColor={true}
              />

              <NumberDisplayBox
                title={"Clicks"}
                value={formattedMetrics.clicksData?.displayValue}
                compareValue={formattedMetrics.clicksData?.compareValue}
                isNegative={formattedMetrics.clicksData?.isNegative}
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
                invertCompareColor={true}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={FacebookReachCreativeData}
                totalData={FacebookReachCreativeTotals}
                metrics={[
                  "Ad set name",
                  "impressions",
                  "reach",
                  "cpr",
                  "frequency",
                  "clicks",
                  "ctr",
                  "cpc",
                  // "engagements",
                  // "engagementRate",
                  // "cpe",
                  "conversions",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="reach"
                defaultSortOrder="desc"
                enableSorting={true}
              />
            </div>
          </div>
          {/* Images */}
          {adsPicture &&
            typeof adsPicture === "string" &&
            adsPicture.startsWith("http") && (
              <div className="col-span-4 flex flex-col p-4 pt-10 gap-4">
                <ImageFallback src={adsPicture} alt="ads preview" />
                <p className="mx-auto">{topAds}</p>
              </div>
            )}
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

export default FacebookReachSlide02;
