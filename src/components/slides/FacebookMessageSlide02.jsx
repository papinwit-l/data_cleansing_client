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

function FacebookMessageSlide02() {
  const {
    loading,
    error,
    refetch,
    FBDemographicData,
    FacebookMessageAudienceData,
    FacebookMessageAudienceTotals,
    FacebookMessageCreativeData,
    FacebookMessageCreativeTotals,
    FacebookMessageAudienceMetrics,
    FacebookMessageAudienceComparison,
    FacebookAdsPicture,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);

  const summarizeData = () => {
    // Handle "No Data" case
    if (
      FacebookMessageAudienceTotals?.clicks === "No Data" ||
      !FacebookMessageAudienceTotals ||
      Object.keys(FacebookMessageAudienceTotals).length === 0
    ) {
      setSummaryText("<li>No data available for the selected period</li>");
      return;
    }

    let summaryTextTemp = "";
    const overallText = `Overall Messages: ** ${parseFloat(
      FacebookMessageAudienceTotals?.messages?.toFixed(2) || 0
    )?.toLocaleString()} messages**`;
    // summaryTextTemp = `<li>${overallText}</li>`;

    // summaryTextTemp += `<li>Average CPA: **${FacebookMessageAudienceTotals.cpa?.toLocaleString(
    //   undefined,
    //   { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    // )} THB**</li>`;

    // Find top audience by engagements (simpler approach)
    const topAudience = Object.entries(FacebookMessageAudienceData).reduce(
      (max, [key, value]) =>
        (value.messages || 0) > (max.value.messages || 0)
          ? { key, value }
          : max,
      { key: "", value: { messages: 0 } }
    );

    const topAudienceText = `Top Audience: **${
      topAudience.key
    } (with ${topAudience.value.messages?.toLocaleString()} messages)**`;
    // summaryTextTemp += `<li>${topAudienceText}</li>`;

    // Find top creative by impressions (simpler approach)
    const topCreative = Object.entries(FacebookMessageCreativeData).reduce(
      (max, [key, value]) =>
        (value.engagements || 0) > (max.value.engagements || 0)
          ? { key, value }
          : max,
      { key: "", value: { engagements: 0 } }
    );
    const topCreativeText = `Top Creative: **${
      topCreative.key
    } (with ${topCreative.value.messages?.toLocaleString()} messages)**`;
    summaryTextTemp += `<li>${topCreativeText}</li>`;
    prepareAdsPicture(topCreative.key);
    setTopAds(topCreative.key);
    setSummaryText(summaryTextTemp);
  };

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
        return item?.Channel?.trim() === "FB Messages";
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
          if (
            item?.Gender &&
            item["New messaging conversations within 7 days"] !== undefined
          ) {
            acc[item.Gender] =
              (acc[item.Gender] || 0) +
              parseImpressions(
                item["New messaging conversations within 7 days"]
              );
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
          if (
            item?.Age &&
            item["New messaging conversations within 7 days"] !== undefined
          ) {
            acc[item.Age] =
              (acc[item.Age] || 0) +
              parseImpressions(
                item["New messaging conversations within 7 days"]
              );
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
  }, [FacebookMessageAudienceTotals, FacebookMessageAudienceData]);

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
    FacebookMessageAudienceTotals?.impressions,
    FacebookMessageAudienceComparison?.impressions,
    "compact"
  );
  const clicksData = formatDisplayData(
    FacebookMessageAudienceTotals?.clicks,
    FacebookMessageAudienceComparison?.clicks,
    "compact"
  );
  const ctrData = formatDisplayData(
    FacebookMessageAudienceTotals?.ctr,
    FacebookMessageAudienceComparison?.ctr,
    "percentage"
  );
  const cpcData = formatDisplayData(
    FacebookMessageAudienceTotals?.cpc,
    FacebookMessageAudienceComparison?.cpc,
    "compact"
  );
  const conversionsData = formatDisplayData(
    FacebookMessageAudienceTotals?.conversions,
    FacebookMessageAudienceComparison?.conversions,
    "number"
  );
  const cplData = formatDisplayData(
    FacebookMessageAudienceTotals?.cpl,
    FacebookMessageAudienceComparison?.cpl,
    "compact"
  );
  const spentData = formatDisplayData(
    FacebookMessageAudienceTotals?.spent,
    FacebookMessageAudienceComparison?.spent,
    "compact"
  );
  const conRate = formatDisplayData(
    FacebookMessageAudienceTotals?.cvr, // Changed from conRate to cvr
    FacebookMessageAudienceComparison?.cvr,
    "percentage"
  );
  const cpmData = formatDisplayData(
    FacebookMessageAudienceTotals?.cpm,
    FacebookMessageAudienceComparison?.cpm,
    "compact"
  );
  const reachData = formatDisplayData(
    FacebookMessageAudienceTotals?.reach,
    FacebookMessageAudienceComparison?.reach,
    "compact"
  );
  const frequencyData = formatDisplayData(
    FacebookMessageAudienceTotals?.frequency,
    FacebookMessageAudienceComparison?.frequency,
    "compact"
  );
  const cprData = formatDisplayData(
    FacebookMessageAudienceTotals?.cpr,
    FacebookMessageAudienceComparison?.cpr,
    "compact"
  );
  const engagementData = formatDisplayData(
    FacebookMessageAudienceTotals?.engagements,
    FacebookMessageAudienceComparison?.engagements,
    "compact"
  );
  const engagementRateData = formatDisplayData(
    FacebookMessageAudienceTotals?.engagementRate,
    FacebookMessageAudienceComparison?.engagementRate,
    "percentage"
  );
  const cpeData = formatDisplayData(
    FacebookMessageAudienceTotals?.cpe,
    FacebookMessageAudienceComparison?.cpe,
    "compact"
  );
  const cpaData = formatDisplayData(
    FacebookMessageAudienceTotals?.cpa,
    FacebookMessageAudienceComparison?.cpa,
    "compact"
  );

  // Alternative: Batch formatting approach (safer for useState data)
  // const formattedMetrics = formatMetricsData(DiscTotals, DiscComparison, METRIC_CONFIGS);
  // console.log("facebookMEtrics", FacebookAudienceMetrics);
  // console.log("data", FacebookAudienceData);
  return (
    <div
      id="facebook-message-02-component"
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
      <SlideHeader title={"Facebook Message (2/2)"} />
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
                value={impressionData.displayValue}
                compareValue={impressionData.compareValue}
                isNegative={impressionData.isNegative}
              />
              <NumberDisplayBox
                title={"Link Clicks"}
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
                value={conRate.displayValue}
                compareValue={conRate.compareValue}
                isConversion={true}
                isNegative={conRate.isNegative}
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
                isConversion={true}
                compareValue={spentData.compareValue}
                isNegative={spentData.isNegative}
                invertCompareColor={true}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={FacebookMessageCreativeData}
                totalData={FacebookMessageCreativeTotals}
                metrics={[
                  "Ad set name",
                  "impressions",
                  "reach",
                  "clicks",
                  "messages",
                  "ctr",
                  "conversions",
                  "conRate",
                  "cpl",
                  "spent",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="messages"
                defaultSortOrder="desc"
                enableSorting={true} // Can disable sorting if needed
              />
            </div>
          </div>
          {/* Chart */}
          <div className="col-span-4">
            {/* <DonutChart
              data={impressionsByGender}
              title="Messages By Gender"
              width={220}
              height={160}
              innerRadius={30}
              outerRadius={60}
              isPercentage={true}
            />
            <DonutChart
              data={impressionsByAge}
              title="Messages
               By Age"
              width={220}
              height={160}
              innerRadius={30}
              outerRadius={60}
              isPercentage={true}
              isLegendWrap={false}
            /> */}
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
          {/* Summary */}
          <div className="col-span-16">
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

export default FacebookMessageSlide02;
