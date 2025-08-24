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
import ImageFallback from "./utils/ImageFallback";

function FacebookTrafficSlide02() {
  const {
    loading,
    error,
    refetch,
    FacebookTrafficAudienceData,
    FacebookTrafficAudienceTotals,
    FacebookTrafficCreativeData,
    FacebookTrafficCreativeTotals,
    FacebookTrafficAudienceMetrics,
    FacebookTrafficAudienceComparison,
    FacebookAdsPicture,
    FBDemographicData,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    const KEY = "clicks";
    const ENABLE_CONVERSION = false;
    try {
      // Handle "No Data" case
      if (
        FacebookTrafficCreativeTotals[KEY] === "No Data" ||
        !FacebookTrafficCreativeTotals ||
        Object.keys(FacebookTrafficCreativeTotals).length === 0
      ) {
        setSummaryText("<li>No data available for the selected period</li>");
        return;
      }

      let summaryTextTemp = "";
      const averageCPC = FacebookTrafficCreativeTotals.cpc?.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
      const overallText = `Overall Clicks: ** ${parseFloat(
        FacebookTrafficCreativeTotals[KEY]?.toFixed(2) || 0
      )?.toLocaleString()} clicks**`;
      // summaryTextTemp = `<li>${overallText}</li>`;
      // summaryTextTemp += `<li>Average CPC: **${averageCPC} THB**</li>`;

      // Find top audience by reach (with error handling)
      const topAudience = FacebookTrafficCreativeData
        ? Object.entries(FacebookTrafficCreativeData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top audience: **${
          topAudience.key
        } (with ${topAudience.value[KEY]?.toLocaleString()} clicks)**`;
        // summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by reach (with error handling)
      const topCreative = FacebookTrafficCreativeData
        ? Object.entries(FacebookTrafficCreativeData).reduce(
            (max, [key, value]) =>
              (value?.clicks || 0) > (max.value?.clicks || 0)
                ? { key, value }
                : max,
            { key: "", value: { clicks: 0 } }
          )
        : { key: "", value: { clicks: 0 } };

      // if (topCreative.key) {
      // Fix: Added missing closing parenthesis
      const topCreativeText = `Top creative: **${
        topCreative.key
      } (with ${topCreative.value.clicks?.toLocaleString()} clicks)**`;
      summaryTextTemp += `<li>${topCreativeText}</li>`;
      // }

      const totalConversions = FacebookTrafficCreativeTotals?.Conversions;
      if (totalConversions > 0 && ENABLE_CONVERSION) {
        summaryTextTemp += `<li>Total conversion: **${totalConversions?.toLocaleString(
          undefined,
          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        )} conversions**</li>`;
      }
      prepareAdsPicture(topCreative.key);
      setTopAds(topCreative.key);
      setSummaryText(summaryTextTemp);
    } catch (error) {
      console.error("Error in summarizeData:", error);
      setSummaryText("<li>Error generating summary</li>");
    }
  }, [
    FacebookTrafficAudienceData,
    FacebookTrafficAudienceTotals,
    FacebookTrafficCreativeData,
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
  const { chartByGender, chartByDevice } = useMemo(() => {
    const GRAPH_KEY = "clicks";
    const CHANNEL = "FB Traffic";
    try {
      if (!FBDemographicData || FBDemographicData.length === 0) {
        return {
          impressionsByGender: {},
          impressionsByAge: {},
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
      const sumGraphByDevice = sumGraphHelper(GRAPH_KEY, "Age");
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
    if (!FacebookTrafficAudienceTotals || !FacebookTrafficAudienceComparison) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        FacebookTrafficAudienceTotals?.impressions,
        FacebookTrafficAudienceComparison?.impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        FacebookTrafficAudienceTotals?.clicks,
        FacebookTrafficAudienceComparison?.clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        FacebookTrafficAudienceTotals?.ctr,
        FacebookTrafficAudienceComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        FacebookTrafficAudienceTotals?.cpc,
        FacebookTrafficAudienceComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        FacebookTrafficAudienceTotals?.conversions,
        FacebookTrafficAudienceComparison?.conversions,
        "number"
      ),
      cplData: formatDisplayData(
        FacebookTrafficAudienceTotals?.cpl,
        FacebookTrafficAudienceComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        FacebookTrafficAudienceTotals?.spent,
        FacebookTrafficAudienceComparison?.spent,
        "compact"
      ),
      conRate: formatDisplayData(
        FacebookTrafficAudienceTotals?.cvr,
        FacebookTrafficAudienceComparison?.cvr,
        "percentage"
      ),
      cpmData: formatDisplayData(
        FacebookTrafficAudienceTotals?.cpm,
        FacebookTrafficAudienceComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        FacebookTrafficAudienceTotals?.reach,
        FacebookTrafficAudienceComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        FacebookTrafficAudienceTotals?.frequency,
        FacebookTrafficAudienceComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        FacebookTrafficAudienceTotals?.cpr,
        FacebookTrafficAudienceComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        FacebookTrafficAudienceTotals?.engagements,
        FacebookTrafficAudienceComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        FacebookTrafficAudienceTotals?.engagementRate,
        FacebookTrafficAudienceComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        FacebookTrafficAudienceTotals?.cpe,
        FacebookTrafficAudienceComparison?.cpe,
        "compact"
      ),
      viewRateData: formatDisplayData(
        FacebookTrafficAudienceTotals?.viewRate,
        FacebookTrafficAudienceComparison?.viewRate,
        "percentage"
      ),
      VideoViewsData: formatDisplayData(
        FacebookTrafficAudienceTotals["Video views"],
        FacebookTrafficAudienceComparison["Video views"],
        "number"
      ),
      cpvData: formatDisplayData(
        FacebookTrafficAudienceTotals?.cpv,
        FacebookTrafficAudienceComparison?.cpv,
        "compact"
      ),
      conRateData: formatDisplayData(
        FacebookTrafficAudienceTotals?.conRate,
        FacebookTrafficAudienceComparison?.conRate,
        "percentage"
      ),
    };
  }, [FacebookTrafficAudienceTotals, FacebookTrafficAudienceComparison]);

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
      id="facebook-traffic-02-component"
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
      <SlideHeader title={"Facebook Traffic (2/2)"} />
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
                title={"CPC"}
                value={formattedMetrics.cpcData?.displayValue}
                compareValue={formattedMetrics.cpcData?.compareValue}
                isNegative={formattedMetrics.cpcData?.isNegative}
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
                invertCompareColor={true}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={FacebookTrafficCreativeData}
                totalData={FacebookTrafficAudienceTotals}
                metrics={[
                  "Ad name",
                  "impressions",
                  "reach",
                  // "cpr",
                  // "frequency",
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
                defaultSortBy="clicks"
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

export default FacebookTrafficSlide02;
