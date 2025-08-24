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

function FacebookAwarenessSlide02PicTable() {
  const {
    loading,
    error,
    refetch,
    GGDemographicData,
    FBDemographicData,
    FacebookAudienceData,
    FacebookAudienceTotals,
    FacebookAudienceMetrics,
    FacebookAudienceComparison,
    FacebookCreativeData,
    FacebookCreativeTotals,
    FacebookAdsPicture,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([5]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);
  const [tablePicture, setTablePicture] = useState([]);

  const summarizeData = () => {
    // Handle "No Data" case
    if (
      FacebookAudienceTotals?.clicks === "No Data" ||
      !FacebookAudienceTotals ||
      Object.keys(FacebookAudienceTotals).length === 0
    ) {
      setSummaryText("<li>No data available for the selected period</li>");
      return;
    }

    let summaryTextTemp = "";
    const overallText = `Overall impression: ** ${parseFloat(
      FacebookAudienceTotals?.impressions?.toFixed(2) || 0
    )?.toLocaleString()} impressions**`;
    summaryTextTemp = `<li>${overallText}</li>`;

    summaryTextTemp += `<li>Average CPM: **${FacebookAudienceTotals.cpm?.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )} THB (per 1000 impressions)**</li>`;

    // Find top audience by impressions (simpler approach)
    const topAudience = Object.entries(FacebookAudienceData).reduce(
      (max, [key, value]) =>
        (value.impressions || 0) > (max.value.impressions || 0)
          ? { key, value }
          : max,
      { key: "", value: { impressions: 0 } }
    );

    const topAudienceText = `Top Audience: **${
      topAudience.key
    } (with ${topAudience.value.impressions?.toLocaleString()} Impressions)**`;
    summaryTextTemp += `<li>${topAudienceText}</li>`;

    // Find top creative by impressions (simpler approach)
    const topCreative = Object.entries(FacebookCreativeData).reduce(
      (max, [key, value]) =>
        (value.impressions || 0) > (max.value.impressions || 0)
          ? { key, value }
          : max,
      { key: "", value: { impressions: 0 } }
    );
    const topCreativeText = `Top Creative: **${
      topCreative.key
    } (with ${topCreative.value.impressions?.toLocaleString()} Impressions**`;
    summaryTextTemp += `<li>${topCreativeText}</li>`;

    prepareAdsPicture(topCreative.key);
    // prepareTablePicture();
    setTopAds(topCreative.key);
    prepareTablePictureObject();
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
  const prepareTablePictureObject = () => {
    const pictureTableData = {};

    // Iterate through each ad in FacebookCreativeData
    Object.entries(FacebookCreativeData).forEach(([adName, adData]) => {
      const adsPicture = findPicture(adName);

      // Keep original ad name as key, add picture as separate property
      pictureTableData[adName] = {
        "Ad name": adName, // Keep original name for display/sorting
        "Ad Picture": adsPicture, // Add picture URL as separate property
        ...adData, // Spread all the original metrics
      };
    });

    setTablePicture(pictureTableData);
    // console.log("Table Picture", pictureTableData);
  };

  // const prepareTablePicture = () => {
  //   // Convert object to array
  //   const FacebookCreativeDataArray = Object.entries(FacebookCreativeData).map(
  //     ([key, value]) => ({
  //       "Ad name": key,
  //       ...value,
  //     })
  //   );

  //   const pictureTableData = FacebookCreativeDataArray.reduce((acc, item) => {
  //     const adsPicture = findPicture(item["Ad name"]);

  //     // Replace "Ad name" with picture URL (your original logic)
  //     const tempObj = {
  //       ...item,
  //       "Ad name": adsPicture || item["Ad name"], // Use picture URL, fallback to original name if no picture
  //     };
  //     acc.push(tempObj);
  //     return acc;
  //   }, []);

  //   setTablePicture(pictureTableData);
  //   console.log("Table Picture", pictureTableData);
  // };

  const findPicture = (adsName) => {
    const adsPicture = FacebookAdsPicture.filter((item) => {
      return item["Ad name"].toLowerCase() === adsName.toLowerCase();
    });

    if (adsPicture.length > 0 && adsPicture[0]["Ads"]) {
      return adsPicture[0]["Ads"];
    }

    console.warn(`No picture found for ad: ${adsName}`);
    return null;
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
  }, [FacebookAudienceTotals, FacebookAudienceData]);

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
    FacebookAudienceTotals?.impressions,
    FacebookAudienceComparison?.impressions,
    "compact"
  );
  const clicksData = formatDisplayData(
    FacebookAudienceTotals?.clicks,
    FacebookAudienceComparison?.clicks,
    "compact"
  );
  const ctrData = formatDisplayData(
    FacebookAudienceTotals?.ctr,
    FacebookAudienceComparison?.ctr,
    "percentage"
  );
  const cpcData = formatDisplayData(
    FacebookAudienceTotals?.cpc,
    FacebookAudienceComparison?.cpc,
    "compact"
  );
  const conversionsData = formatDisplayData(
    FacebookAudienceTotals?.conversions,
    FacebookAudienceComparison?.conversions,
    "number"
  );
  const cplData = formatDisplayData(
    FacebookAudienceTotals?.cpl,
    FacebookAudienceComparison?.cpl,
    "compact"
  );
  const spentData = formatDisplayData(
    FacebookAudienceTotals?.spent,
    FacebookAudienceComparison?.spent,
    "compact"
  );
  const conRate = formatDisplayData(
    FacebookAudienceTotals?.cvr, // Changed from conRate to cvr
    FacebookAudienceComparison?.cvr,
    "percentage"
  );
  const cpmData = formatDisplayData(
    FacebookAudienceTotals?.cpm,
    FacebookAudienceComparison?.cpm,
    "compact"
  );
  const reachData = formatDisplayData(
    FacebookAudienceTotals?.reach,
    FacebookAudienceComparison?.reach,
    "compact"
  );
  const frequencyData = formatDisplayData(
    FacebookAudienceTotals?.frequency,
    FacebookAudienceComparison?.frequency,
    "compact"
  );
  const cprData = formatDisplayData(
    FacebookAudienceTotals?.cpr,
    FacebookAudienceComparison?.cpr,
    "compact"
  );
  const engagementData = formatDisplayData(
    FacebookAudienceTotals?.engagements,
    FacebookAudienceComparison?.engagements,
    "compact"
  );
  const engagementRateData = formatDisplayData(
    FacebookAudienceTotals?.engagementRate,
    FacebookAudienceComparison?.engagementRate,
    "percentage"
  );
  const cpeData = formatDisplayData(
    FacebookAudienceTotals?.cpe,
    FacebookAudienceComparison?.cpe,
    "compact"
  );

  // Alternative: Batch formatting approach (safer for useState data)
  // const formattedMetrics = formatMetricsData(DiscTotals, DiscComparison, METRIC_CONFIGS);
  // console.log("facebookMEtrics", FacebookAudienceMetrics);
  return (
    <div
      id="facebook-awareness-02-picture-table-component"
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
      <SlideHeader title={"Facebook Awareness (2/2) **"} />
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
                totalData={FacebookAudienceTotals}
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
                channelData={tablePicture}
                totalData={FacebookCreativeTotals}
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
                isPictureTable={true} // Enable picture display
                pictureSize="w-8 h-8" // Customizable image size
                pictureKey="Ad Picture" // Which property contains the picture URL
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
            <ImageFallback src={adsPicture} alt="ads preview" />
            <p className="mx-auto">{topAds}</p>
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

export default FacebookAwarenessSlide02PicTable;
