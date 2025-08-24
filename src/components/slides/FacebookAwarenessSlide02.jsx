import React, { useEffect, useMemo, useState } from "react";
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

function FacebookAwarenessSlide02() {
  const {
    loading,
    error,
    refetch,
    FBDemographicData,
    FacebookAdsPicture,
    FacebookAwarenessAudienceData,
    FacebookAwarenessAudienceTotals,
    FacebookAwarenessCreativeData,
    FacebookAwarenessCreativeTotals,
    FacebookAwarenessAudienceMetrics,
    FacebookAwarenessAudienceComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([7]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);

  const summarizeData = () => {
    // Handle "No Data" case
    if (
      FacebookAwarenessAudienceTotals?.clicks === "No Data" ||
      !FacebookAwarenessAudienceTotals ||
      Object.keys(FacebookAwarenessAudienceTotals).length === 0
    ) {
      setSummaryText("<li>No data available for the selected period</li>");
      return;
    }

    let summaryTextTemp = "";
    const overallText = `Overall impression: ** ${parseFloat(
      FacebookAwarenessAudienceTotals?.impressions?.toFixed(2) || 0
    )?.toLocaleString()} impressions**`;
    // summaryTextTemp = `<li>${overallText}</li>`;

    // summaryTextTemp += `<li>Average CPM: **${FacebookAwarenessAudienceTotals.cpm?.toLocaleString(
    //   undefined,
    //   { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    // )} THB (per 1000 impressions)**</li>`;

    // Find top audience by impressions (simpler approach)
    const topAudience = Object.entries(FacebookAwarenessAudienceData).reduce(
      (max, [key, value]) =>
        (value.impressions || 0) > (max.value.impressions || 0)
          ? { key, value }
          : max,
      { key: "", value: { impressions: 0 } }
    );

    const topAudienceText = `Top Audience: **${
      topAudience.key
    } (with ${topAudience.value.impressions?.toLocaleString()} Impressions)**`;
    // summaryTextTemp += `<li>${topAudienceText}</li>`;

    // Find top creative by impressions (simpler approach)
    const topCreative = Object.entries(FacebookAwarenessCreativeData).reduce(
      (max, [key, value]) =>
        (value.impressions || 0) > (max.value.impressions || 0)
          ? { key, value }
          : max,
      { key: "", value: { impressions: 0 } }
    );
    const topCreativeText = `Top Creative: **${
      topCreative.key
    } (with ${topCreative.value.impressions?.toLocaleString()} Impressions)**`;
    summaryTextTemp += `<li>${topCreativeText}</li>`;

    prepareAdsPicture(topCreative.key);
    setTopAds(topCreative.key);
    setSummaryText(summaryTextTemp);
  };

  const prepareAdsPicture = (adsName) => {
    const adsPicture = FacebookAdsPicture.filter((item) => {
      return item["Ad name"] == adsName;
    });
    // console.log("ads name is", adsName);
    // console.log("Ads Picture", adsPicture);
    if (adsPicture.length === 0) return;
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
      const filteredDemographicData = [...FBDemographicData];

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

  useEffect(() => {
    summarizeData();
  }, [FacebookAwarenessAudienceTotals, FacebookAwarenessAudienceData]);

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
  // Using optional chaining to handle undefined/null values from useState
  const impressionData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.impressions,
    FacebookAwarenessAudienceComparison?.impressions,
    "compact"
  );
  const clicksData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.clicks,
    FacebookAwarenessAudienceComparison?.clicks,
    "compact"
  );
  const ctrData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.ctr,
    FacebookAwarenessAudienceComparison?.ctr,
    "percentage"
  );
  const cpcData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.cpc,
    FacebookAwarenessAudienceComparison?.cpc,
    "compact"
  );
  const conversionsData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.conversions,
    FacebookAwarenessAudienceComparison?.conversions,
    "number"
  );
  const cplData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.cpl,
    FacebookAwarenessAudienceComparison?.cpl,
    "compact"
  );
  const spentData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.spent,
    FacebookAwarenessAudienceComparison?.spent,
    "compact"
  );
  const conRate = formatDisplayData(
    FacebookAwarenessAudienceTotals?.cvr, // Changed from conRate to cvr
    FacebookAwarenessAudienceComparison?.cvr,
    "percentage"
  );
  const cpmData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.cpm,
    FacebookAwarenessAudienceComparison?.cpm,
    "compact"
  );
  const reachData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.reach,
    FacebookAwarenessAudienceComparison?.reach,
    "compact"
  );
  const frequencyData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.frequency,
    FacebookAwarenessAudienceComparison?.frequency,
    "compact"
  );
  const cprData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.cpr,
    FacebookAwarenessAudienceComparison?.cpr,
    "compact"
  );
  const engagementData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.engagements,
    FacebookAwarenessAudienceComparison?.engagements,
    "compact"
  );
  const engagementRateData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.engagementRate,
    FacebookAwarenessAudienceComparison?.engagementRate,
    "percentage"
  );
  const cpeData = formatDisplayData(
    FacebookAwarenessAudienceTotals?.cpe,
    FacebookAwarenessAudienceComparison?.cpe,
    "compact"
  );

  // Alternative: Batch formatting approach (safer for useState data)
  // const formattedMetrics = formatMetricsData(DiscTotals, DiscComparison, METRIC_CONFIGS);
  // console.log("facebookMEtrics", FacebookAudienceMetrics);
  return (
    <div
      id="facebook-awareness-02-component"
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
      <SlideHeader title={"Facebook Awareness (2/2)"} />
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-16">
          <div className="col-span-13 flex flex-col gap-2">
            <div className="grid grid-cols-8 gap-2">
              <h4 className="col-span-6 text-lg font-semibold">
                Awareness & Considerations
              </h4>
              <h4 className="col-span-2 text-lg font-semibold">Conversions</h4>

              <NumberDisplayBox
                title={"Impression"}
                value={impressionData.displayValue}
                compareValue={impressionData.compareValue}
                isNegative={impressionData.isNegative}
              />
              <NumberDisplayBox
                title={"CPM"}
                value={cpmData.displayValue}
                compareValue={cpmData.compareValue}
                isNegative={cpmData.isNegative}
                invertCompareColor={true}
              />
              <NumberDisplayBox
                title={"Reach"}
                value={reachData.displayValue}
                compareValue={reachData.compareValue}
                isNegative={reachData.isNegative}
              />
              <NumberDisplayBox
                title={"Post Engagements"}
                value={engagementData.displayValue}
                compareValue={engagementData.compareValue}
                isNegative={engagementData.isNegative}
              />
              <NumberDisplayBox
                title={"% Engagement Rate"}
                value={engagementRateData.displayValue}
                compareValue={engagementRateData.compareValue}
                isNegative={engagementRateData.isNegative}
              />
              <NumberDisplayBox
                title={"CPE"}
                value={cpeData.displayValue}
                compareValue={cpeData.compareValue}
                isNegative={cpeData.isNegative}
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
                invertCompareColor={true}
              />
            </div>
            {/* <div>
              <h4 className="text-lg font-semibold">Performance by Audience</h4>

              <AdvancedDataTable
                firstMetric="Ad set name"
                channelData={FacebookAudienceData}
                totalData={FacebookAwarenessAudienceTotals}
                metrics={[
                  "Ad set name",
                  "impressions",
                  "cpm",
                  "reach",
                  "clicks",
                  "ctr",
                  "cpc",
                  "engagements",
                  "engagementRate",
                  "cpe",
                  "conversions",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="impressions"
                defaultSortOrder="desc"
                enableSorting={true} // Can disable sorting if needed
              />
            </div> */}
            <div>
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={FacebookAwarenessCreativeData}
                totalData={FacebookAwarenessCreativeTotals}
                metrics={[
                  "Ad name",
                  "impressions",
                  "cpm",
                  "reach",
                  "clicks",
                  "ctr",
                  "cpc",
                  "engagements",
                  "engagementRate",
                  "cpe",
                  "conversions",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="impressions"
                defaultSortOrder="desc"
                enableSorting={true} // Can disable sorting if needed
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
          <div className="col-span-3 flex flex-col ml-2 mt-8 justify-between items-center">
            {/* Ads Preview */}
            {adsPicture &&
              typeof adsPicture === "string" &&
              adsPicture.startsWith("http") && (
                <div className="p-6 flex flex-col gap-2">
                  <ImageFallback src={adsPicture} alt="ads preview" />
                  <p className="mx-auto">{topAds}</p>
                </div>
              )}

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

export default FacebookAwarenessSlide02;
