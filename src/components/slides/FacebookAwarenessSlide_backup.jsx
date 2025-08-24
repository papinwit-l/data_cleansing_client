import React, { useEffect, useState } from "react";
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

function FacebookAwarenessSlide() {
  const {
    loading,
    error,
    refetch,
    GGDemographicData,
    FacebookAudienceData,
    FacebookAudienceTotals,
    FacebookAudienceMetrics,
    FacebookAudienceComparison,
    FacebookCreativeData,
    FacebookCreativeTotals,
    FacebookAdsPicture,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [clicksByGender, setClicksByGender] = useState({});
  const [clicksByDevice, setClicksByDevice] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([5, 5]);
  const [adsPicture, setAdsPicture] = useState(null);
  const [topAds, setTopAds] = useState(null);

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

  const prepareChartData = () => {
    if (!GGDemographicData || GGDemographicData.length === 0) {
      setClicksByGender({});
      setClicksByDevice({});
      return;
    }

    const GDNDemographicData = GGDemographicData.filter((item) => {
      return item.Channel.trim() === "Discovery";
    });

    if (GDNDemographicData.length === 0) {
      setClicksByGender({});
      setClicksByDevice({});
      return;
    }

    const sumClicksByGender = GDNDemographicData.reduce((acc, item) => {
      if (item.Gender) {
        acc[item.Gender] = (acc[item.Gender] || 0) + item.Clicks;
      }
      return acc;
    }, {});

    const totalClicks = Object.values(sumClicksByGender).reduce(
      (a, b) => a + b,
      0
    );

    if (totalClicks === 0) {
      setClicksByGender({});
      setClicksByDevice({});
      return;
    }

    const genderPercentages = Object.entries(sumClicksByGender).reduce(
      (acc, [gender, clicks]) => {
        acc[gender] = ((clicks / totalClicks) * 100).toFixed(2) + "%";
        return acc;
      },
      {}
    );
    setClicksByGender(genderPercentages);

    const sumClicksByDevice = GDNDemographicData.reduce((acc, item) => {
      if (item.Device) {
        acc[item.Device] = (acc[item.Device] || 0) + item.Clicks;
      }
      return acc;
    }, {});

    const devicePercentages = Object.entries(sumClicksByDevice).reduce(
      (acc, [device, clicks]) => {
        acc[device] = ((clicks / totalClicks) * 100).toFixed(2) + "%";
        return acc;
      },
      {}
    );
    setClicksByDevice(devicePercentages);
  };

  useEffect(() => {
    summarizeData();
    prepareChartData();
  }, [FacebookAudienceTotals, FacebookAudienceData, GGDemographicData]);

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

  // Alternative: Batch formatting approach (safer for useState data)
  // const formattedMetrics = formatMetricsData(DiscTotals, DiscComparison, METRIC_CONFIGS);
  // console.log("facebookMEtrics", FacebookAudienceMetrics);
  return (
    <div
      id="facebook-awareness-component"
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
      <SlideHeader title={"Facebook Awareness"} />
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-16">
          <div className="col-span-8 flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-2">
              <h4 className="col-span-4 text-lg font-semibold">
                Awareness & Considerations
              </h4>

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
                title={"Spent"}
                value={spentData.displayValue}
                compareValue={spentData.compareValue}
                isNegative={spentData.isNegative}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Audience</h4>

              <AdvancedDataTable
                firstMetric="Ad set name"
                channelData={FacebookAudienceData}
                totalData={FacebookAudienceTotals}
                metrics={[
                  "Ad set name",
                  "impressions", // lowercase
                  "cpm",
                  "reach", // lowercase
                  "spent", // lowercase
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="impressions"
                defaultSortOrder="desc"
                enableSorting={true} // Can disable sorting if needed
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Performance by Creative</h4>

              <AdvancedDataTable
                firstMetric="Ad name"
                channelData={FacebookCreativeData}
                totalData={FacebookCreativeTotals}
                metrics={[
                  "Ad name",
                  "impressions", // lowercase
                  "cpm",
                  "reach", // lowercase
                  "spent", // lowercase
                ]}
                formatValue={formatTableValue}
                maxRows={maxTableRows[1]}
                defaultSortBy="impressions"
                defaultSortOrder="desc"
                enableSorting={true} // Can disable sorting if needed
              />
            </div>
            <div className="grid grid-cols-2">
              <div className="col-span-1">
                {/* Summary */}
                {/* <div className="px-4">
                  <h4 className="text-lg font-semibold">Summary</h4>
                  <ul className="list-disc pl-6">
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: renderFormattedText(summaryText),
                      }}
                    />
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
          <div className="col-span-8 flex flex-col ml-2 mt-8 justify-between items-center">
            {/* Ads Preview */}
            <div className="p-6 flex flex-col gap-2">
              <img
                src={adsPicture}
                alt="ads preview"
                className="max-h-[300px] max-w-full object-contain w-auto"
              />
              <p className="mx-auto">{topAds}</p>
            </div>
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

export default FacebookAwarenessSlide;
