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

function FacebookCatalogSlide02() {
  const {
    loading,
    error,
    refetch,
    FacebookAdsPicture,
    FBDemographicData,
    FacebookCatalogAudienceData,
    FacebookCatalogAudienceTotals,
    FacebookCatalogCreativeData,
    FacebookCatalogCreativeTotals,
    FacebookCatalogAudienceMetrics,
    FacebookCatalogAudienceComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([7]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);

  // Fix: Memoize summarizeData to prevent unnecessary re-renders
  const summarizeData = useCallback(() => {
    const KEY = "purchase";
    const ENABLE_CONVERSION = false;
    try {
      // Handle "No Data" case
      if (
        FacebookCatalogAudienceTotals[KEY] === "No Data" ||
        !FacebookCatalogAudienceTotals ||
        Object.keys(FacebookCatalogAudienceTotals).length === 0
      ) {
        setSummaryText("<li>No data available for the selected period</li>");
        return;
      }

      let summaryTextTemp = "";
      const averageCPA = FacebookCatalogAudienceTotals.cpa?.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
      const overallText = `Overall conversions: ** ${parseFloat(
        FacebookCatalogAudienceTotals[KEY]?.toFixed(2) || 0
      )?.toLocaleString()} purchases`;
      // summaryTextTemp = `<li>${overallText} with average CPA: ${averageCPA} THB**</li>`;
      // summaryTextTemp += `<li>Overall conversion Value: **${parseFloat(
      //   FacebookCatalogAudienceTotals["purchaseConValue"]?.toFixed(2) || 0
      // )?.toLocaleString()} THB with ${parseFloat(
      //   FacebookCatalogAudienceTotals["roas"]?.toFixed(2) || 0
      // )?.toLocaleString()} of ROAS**</li>`;
      // summaryTextTemp += `<li>Average CPV: **${averageCPA} THB**</li>`;

      // Find top audience by reach (with error handling)
      const topAudience = FacebookCatalogCreativeData
        ? Object.entries(FacebookCatalogCreativeData).reduce(
            (max, [key, value]) =>
              (value[KEY] || 0) > (max.value[KEY] || 0) ? { key, value } : max,
            { key: "", value: { KEY: 0 } }
          )
        : { key: "", value: { KEY: 0 } };

      if (topAudience.key) {
        const topAudienceText = `Top Creative: **${
          topAudience.key
        } (with ${topAudience.value[KEY]?.toLocaleString()} purchases)**`;
        summaryTextTemp += `<li>${topAudienceText}</li>`;
      }

      // Find top creative by reach (with error handling)
      const topCreative = FacebookCatalogCreativeData
        ? Object.entries(FacebookCatalogCreativeData).reduce(
            (max, [key, value]) =>
              (value?.viewRate || 0) > (max.value?.viewRate || 0)
                ? { key, value }
                : max,
            { key: "", value: { viewRate: 0 } }
          )
        : { key: "", value: { viewRate: 0 } };

      // if (topCreative.key) {
      // Fix: Added missing closing parenthesis
      // const topCreativeText = `Top Creative: **${
      //   topCreative.key
      // } (with ${topCreative.value.viewRate?.toLocaleString()} %view rate)**`;
      // summaryTextTemp += `<li>${topCreativeText}</li>`;
      // }

      const totalConversions = FacebookCatalogAudienceTotals?.Conversions;
      if (totalConversions > 0 && ENABLE_CONVERSION) {
        summaryTextTemp += `<li>Total conversion: **${totalConversions?.toLocaleString(
          undefined,
          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        )} conversions**</li>`;
      }
      prepareAdsPicture(topAudience.key);
      setTopAds(topAudience.key);
      setSummaryText(summaryTextTemp);
    } catch (error) {
      console.error("Error in summarizeData:", error);
      setSummaryText("<li>Error generating summary</li>");
    }
  }, [FacebookCatalogAudienceTotals, FacebookCatalogCreativeData]);

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
    if (!FacebookCatalogAudienceTotals || !FacebookCatalogAudienceComparison) {
      return {};
    }

    return {
      impressionData: formatDisplayData(
        FacebookCatalogAudienceTotals?.impressions,
        FacebookCatalogAudienceComparison?.impressions,
        "compact"
      ),
      clicksData: formatDisplayData(
        FacebookCatalogAudienceTotals?.clicks,
        FacebookCatalogAudienceComparison?.clicks,
        "compact"
      ),
      ctrData: formatDisplayData(
        FacebookCatalogAudienceTotals?.ctr,
        FacebookCatalogAudienceComparison?.ctr,
        "percentage"
      ),
      cpcData: formatDisplayData(
        FacebookCatalogAudienceTotals?.cpc,
        FacebookCatalogAudienceComparison?.cpc,
        "compact"
      ),
      conversionsData: formatDisplayData(
        FacebookCatalogAudienceTotals?.conversions,
        FacebookCatalogAudienceComparison?.conversions,
        "number"
      ),
      cplData: formatDisplayData(
        FacebookCatalogAudienceTotals?.cpl,
        FacebookCatalogAudienceComparison?.cpl,
        "compact"
      ),
      spentData: formatDisplayData(
        FacebookCatalogAudienceTotals?.spent,
        FacebookCatalogAudienceComparison?.spent,
        "compact"
      ),
      conRate: formatDisplayData(
        FacebookCatalogAudienceTotals?.cvr,
        FacebookCatalogAudienceComparison?.cvr,
        "percentage"
      ),
      cpmData: formatDisplayData(
        FacebookCatalogAudienceTotals?.cpm,
        FacebookCatalogAudienceComparison?.cpm,
        "compact"
      ),
      reachData: formatDisplayData(
        FacebookCatalogAudienceTotals?.reach,
        FacebookCatalogAudienceComparison?.reach,
        "compact"
      ),
      frequencyData: formatDisplayData(
        FacebookCatalogAudienceTotals?.frequency,
        FacebookCatalogAudienceComparison?.frequency,
        "compact"
      ),
      cprData: formatDisplayData(
        FacebookCatalogAudienceTotals?.cpr,
        FacebookCatalogAudienceComparison?.cpr,
        "compact"
      ),
      engagementData: formatDisplayData(
        FacebookCatalogAudienceTotals?.engagements,
        FacebookCatalogAudienceComparison?.engagements,
        "compact"
      ),
      engagementRateData: formatDisplayData(
        FacebookCatalogAudienceTotals?.engagementRate,
        FacebookCatalogAudienceComparison?.engagementRate,
        "percentage"
      ),
      cpeData: formatDisplayData(
        FacebookCatalogAudienceTotals?.cpe,
        FacebookCatalogAudienceComparison?.cpe,
        "compact"
      ),
      viewRateData: formatDisplayData(
        FacebookCatalogAudienceTotals?.viewRate,
        FacebookCatalogAudienceComparison?.viewRate,
        "percentage"
      ),
      VideoViewsData: formatDisplayData(
        FacebookCatalogAudienceTotals["views"],
        FacebookCatalogAudienceComparison["views"],
        "number"
      ),
      cpvData: formatDisplayData(
        FacebookCatalogAudienceTotals?.cpv,
        FacebookCatalogAudienceComparison?.cpv,
        "compact"
      ),
      conRateData: formatDisplayData(
        FacebookCatalogAudienceTotals?.conRate,
        FacebookCatalogAudienceComparison?.conRate,
        "percentage"
      ),
      purchaseConValueData: formatDisplayData(
        FacebookCatalogAudienceTotals?.purchaseConValue,
        FacebookCatalogAudienceComparison?.purchaseConValue,
        "compact"
      ),
      roasData: formatDisplayData(
        FacebookCatalogAudienceTotals?.roas,
        FacebookCatalogAudienceComparison?.roas,
        "compact"
      ),
      purchaseData: formatDisplayData(
        FacebookCatalogAudienceTotals?.purchase,
        FacebookCatalogAudienceComparison?.purchase,
        "number"
      ),
      addToCartData: formatDisplayData(
        FacebookCatalogAudienceTotals?.addToCart,
        FacebookCatalogAudienceComparison?.addToCart,
        "number"
      ),
    };
  }, [FacebookCatalogAudienceTotals, FacebookCatalogAudienceComparison]);

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
      id="facebook-catalog-02-component"
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
      <SlideHeader title={"Facebook Catalog Sale (2/2)"} />
      <div className="flex flex-col h-full gap-2">
        <div className="grid grid-cols-16">
          <div className="col-span-13 flex flex-col gap-2">
            <div className="grid grid-cols-8 gap-2">
              <h4 className="col-span-4 text-lg font-semibold">
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
                title={"Purchase"}
                value={formattedMetrics.purchaseData?.displayValue}
                compareValue={formattedMetrics.purchaseData?.compareValue}
                isNegative={formattedMetrics.purchaseData?.isNegative}
                isConversion={true}
              />
              <NumberDisplayBox
                title={"%Conv Rate"}
                value={formattedMetrics.conRateData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.conRateData?.compareValue}
                isNegative={formattedMetrics.conRateData?.isNegative}
              />

              <NumberDisplayBox
                title={"Spent"}
                value={formattedMetrics.spentData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.spentData?.compareValue}
                isNegative={formattedMetrics.spentData?.isNegative}
                invertCompareColor={true}
              />

              <NumberDisplayBox
                title={"Purchase Conversion Value"}
                value={formattedMetrics.purchaseConValueData?.displayValue}
                isConversion={true}
                compareValue={
                  formattedMetrics.purchaseConValueData?.compareValue
                }
                isNegative={formattedMetrics.purchaseConValueData?.isNegative}
              />

              <NumberDisplayBox
                title={"ROAS"}
                value={formattedMetrics.roasData?.displayValue}
                isConversion={true}
                compareValue={formattedMetrics.roasData?.compareValue}
                isNegative={formattedMetrics.roasData?.isNegative}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={FacebookCatalogCreativeData}
                totalData={FacebookCatalogAudienceTotals}
                metrics={[
                  "Ad name",
                  "impressions",
                  "reach",
                  "clicks",
                  "ctr",
                  "addToCart",
                  "purchase",
                  "conRate",
                  "spent",
                  "purchaseConValue",
                  "roas",
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="purchase"
                defaultSortOrder="desc"
                enableSorting={true}
              />
            </div>
          </div>
          {/* Images */}
          {/* Ads Preview */}
          {adsPicture &&
            typeof adsPicture === "string" &&
            adsPicture.startsWith("http") && (
              <div className="p-6 flex flex-col gap-2">
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

export default FacebookCatalogSlide02;
