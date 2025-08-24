import React, { useEffect, useState, useMemo } from "react";
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

function GDNSlide() {
  const {
    loading,
    error,
    refetch,
    GGDemographicData,
    GDNData,
    GDNTotals,
    GDNMetrics,
    GDNComparison,
  } = useData();

  const [summaryText, setSummaryText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [maxTableRows, setMaxTableRows] = useState([0]);

  // Memoize the chart data calculations to prevent unnecessary re-renders
  const { clicksByGender, clicksByDevice } = useMemo(() => {
    if (!GGDemographicData || !Array.isArray(GGDemographicData)) {
      return { clicksByGender: {}, clicksByDevice: {} };
    }

    const GDNDemographicData = GGDemographicData.filter((item) => {
      return item.Channel.trim() === "GDN";
    });

    if (GDNDemographicData.length === 0) {
      return { clicksByGender: {}, clicksByDevice: {} };
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
      return { clicksByGender: {}, clicksByDevice: {} };
    }

    const genderPercentages = Object.entries(sumClicksByGender).reduce(
      (acc, [gender, clicks]) => {
        acc[gender] = ((clicks / totalClicks) * 100).toFixed(2) + "%";
        return acc;
      },
      {}
    );

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

    return {
      clicksByGender: genderPercentages,
      clicksByDevice: devicePercentages,
    };
  }, [GGDemographicData]);

  const summarizeData = () => {
    // Handle "No Data" case
    if (
      GDNTotals?.Clicks === "No Data" ||
      !GDNTotals ||
      Object.keys(GDNTotals).length === 0
    ) {
      setSummaryText("<li>No data available for the selected period</li>");
      return;
    }

    let summaryTextTemp = "";
    const averageCPC = GDNTotals?.cpc?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const overallText = `Overall clicks: ** ${parseFloat(
      GDNTotals?.Clicks?.toFixed(2) || 0
    )?.toLocaleString()} clicks with average CPC ${averageCPC} THB**`;
    summaryTextTemp = `<li>${overallText}</li>`;

    let highestConversionChannelText = ``;
    let highestConversionRateChannelText = ``;

    const channelEntries = Object.entries(GDNData || {});
    if (channelEntries.length === 0) {
      setSummaryText(summaryTextTemp);
      return;
    }

    const topConversionChannel = channelEntries.reduce((max, current) =>
      current[1].Clicks > max[1].Clicks ? current : max
    );

    const topConversionRateChannel = channelEntries.reduce((max, current) =>
      current[1].ctr > max[1].ctr ? current : max
    );

    if (channelEntries.length > 1) {
      highestConversionChannelText = `Best perform Ad: **${
        topConversionChannel[0]
      } with ${topConversionChannel[1].Clicks?.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} clicks**`;
      summaryTextTemp += `<li>${highestConversionChannelText}</li>`;
    }

    // if (topConversionChannel[0] != topConversionRateChannel[0]) {
    highestConversionRateChannelText = `Potential Ad: **${
      topConversionRateChannel[0]
    } with ${topConversionRateChannel[1].ctr.toFixed(2)} %CTR**`;
    summaryTextTemp += `<li>${highestConversionRateChannelText}</li>`;
    // }

    //Total conversions
    const totalConversions = GDNTotals?.Conversions;
    if (totalConversions > 0) {
      summaryTextTemp += `<li>Total conversion: **${totalConversions?.toLocaleString(
        undefined,
        { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      )} conversions**</li>`;
    }
    setSummaryText(summaryTextTemp);
  };

  useEffect(() => {
    summarizeData();
  }, [GDNTotals, GDNData]);

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
    GDNTotals?.Impressions,
    GDNComparison?.Impressions,
    "compact"
  );
  const clicksData = formatDisplayData(
    GDNTotals?.Clicks,
    GDNComparison?.Clicks,
    "compact"
  );
  const ctrData = formatDisplayData(
    GDNTotals?.ctr,
    GDNComparison?.ctr,
    "percentage"
  );
  const cpcData = formatDisplayData(
    GDNTotals?.cpc,
    GDNComparison?.cpc,
    "compact"
  );
  const conversionsData = formatDisplayData(
    GDNTotals?.Conversions,
    GDNComparison?.Conversions,
    "number"
  );
  const cplData = formatDisplayData(
    GDNTotals?.cpl,
    GDNComparison?.cpl,
    "compact"
  );
  const spentData = formatDisplayData(
    GDNTotals?.Spent,
    GDNComparison?.Spent,
    "compact"
  );

  // Alternative: Batch formatting approach (safer for useState data)
  // const formattedMetrics = formatMetricsData(GDNTotals, GDNComparison, METRIC_CONFIGS);

  return (
    <div
      id="gdn-component"
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
      <SlideHeader title={"Google Display Network"} />
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-16">
          <div className="col-span-12 flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-2">
              <h4 className="col-span-4 text-lg font-semibold">
                Awareness & Considerations
              </h4>
              <h4 className="col-span-3 text-lg font-semibold">Conversions</h4>

              <NumberDisplayBox
                title={"Impression"}
                value={impressionData.displayValue}
                compareValue={impressionData.compareValue}
                isNegative={impressionData.isNegative}
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
                title={"CPC"}
                value={cpcData.displayValue}
                compareValue={cpcData.compareValue}
                isNegative={cpcData.isNegative}
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
                title={"CPL"}
                value={cplData.displayValue}
                isConversion={true}
                compareValue={cplData.compareValue}
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
              <h4 className="text-lg font-semibold">
                Performance by Ad Group Name
              </h4>
              <AdvancedDataTable
                firstMetric={"Ad group name"}
                channelData={GDNData}
                totalData={GDNTotals}
                metrics={GDNMetrics}
                formatValue={formatTableValue}
                maxRows={maxTableRows[0]}
                defaultSortBy="Clicks"
              />
            </div>
          </div>
          <div className="col-span-4 flex flex-col">
            {/* AD Preview Picture */}
            {clicksByGender && Object.keys(clicksByGender).length > 0 && (
              <DonutChart
                data={clicksByGender}
                title="Clicks by Gender"
                width={220}
                height={160}
                innerRadius={30}
                outerRadius={60}
                isPercentage={true}
              />
            )}
            {clicksByDevice && Object.keys(clicksByDevice).length > 0 && (
              <DonutChart
                data={clicksByDevice}
                title="Clicks by Device"
                width={220}
                height={140}
                innerRadius={30}
                outerRadius={60}
                isPercentage={true}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-3">
          <div className="col-span-1 flex flex-col">
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
          {/* <div className="col-span-2 flex">
            {clicksByGender && Object.keys(clicksByGender).length > 0 && (
              <DonutChart
                data={clicksByGender}
                title="Clicks by Gender"
                width={220}
                height={160}
                innerRadius={30}
                outerRadius={60}
                isPercentage={true}
              />
            )}
            {clicksByDevice && Object.keys(clicksByDevice).length > 0 && (
              <DonutChart
                data={clicksByDevice}
                title="Clicks by Device"
                width={220}
                height={140}
                innerRadius={30}
                outerRadius={60}
                isPercentage={true}
              />
            )}
          </div> */}
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

export default GDNSlide;
