import React, { useEffect, useCallback } from "react";
import SlideHeader from "./SlideHeader";
import PerformanceDataTable from "../charts-tables/PerformanceDataTable";
import axios from "axios";
import NumberDisplayBox from "./utils/NumberDisplayBox";
import TextEditorModal from "./utils/TextEditorModal";

function Overall({ isOverallEditModalOpen, setIsOverallEditModalOpen }) {
  const [totalData, setTotalData] = React.useState({});
  const [channelData, setChannelData] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [metrics, setMetrics] = React.useState([
    "Impressions",
    "Reach",
    "Clicks",
    "Conversions",
    "Spent",
    "Post Engagement",
    "Value",
  ]);

  const [summaryOverallText, setSummaryOverallText] = React.useState("");
  const [highestConversionChannelText, setHighestConversionChannelText] =
    React.useState("");
  const [hasPotentialChannel, setHasPotentialChannel] = React.useState(false);
  const [potentialChannelText, setPotentialChannelText] = React.useState("");

  const [summaryText, setSummaryText] = React.useState("");

  const handleGetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall data
      const response = await axios.get(
        "http://localhost:8000/data-sheets/overall-data"
      );
      const rawData = response.data.data;
      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      const dataObjects = dataRows.map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, row[index]]))
      );

      const cleanedData = dataObjects.map((entry) => {
        const cleaned = { ...entry };
        for (const key of metrics) {
          cleaned[key] =
            parseFloat(cleaned[key]?.toString().replace(/,/g, "")) || 0;
        }
        // Also clean the "Updated Date" for daily processing
        cleaned["Updated Date"] = entry["Updated Date"];
        return cleaned;
      });

      // Process channel data
      const { enhancedChannelData, enhancedTotals, allMetrics } =
        processChannelData(cleanedData, metrics);

      setMetrics(allMetrics);
      setChannelData(enhancedChannelData);
      setTotalData(enhancedTotals);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [metrics]);

  const processChannelData = (cleanedData, metrics) => {
    // Group by channel
    const summaryByChannel = cleanedData.reduce((acc, item) => {
      const channel = item.Channel || "Unknown";
      if (!acc[channel]) {
        acc[channel] = Object.fromEntries(metrics.map((m) => [m, 0]));
      }
      for (const key of metrics) {
        acc[channel][key] += item[key];
      }
      return acc;
    }, {});

    // Add calculations for each channel
    const enhancedChannelData = {};
    Object.entries(summaryByChannel).forEach(([channel, data]) => {
      const ctr =
        data.Impressions > 0 ? (data.Clicks / data.Impressions) * 100 : 0;
      const conRate =
        data.Clicks > 0 ? (data.Conversions / data.Clicks) * 100 : 0;
      const cpl = data.Conversions > 0 ? data.Spent / data.Conversions : 0;

      enhancedChannelData[channel] = {
        ...data,
        ctr,
        conRate,
        cpl,
      };
    });

    // Calculate totals
    const totals = Object.fromEntries(metrics.map((m) => [m, 0]));
    Object.values(summaryByChannel).forEach((channelValues) => {
      for (const key of metrics) {
        totals[key] += channelValues[key];
      }
    });

    // Add calculated totals
    const totalCtr =
      totals.Impressions > 0 ? (totals.Clicks / totals.Impressions) * 100 : 0;
    const totalConRate =
      totals.Clicks > 0 ? (totals.Conversions / totals.Clicks) * 100 : 0;
    const totalCpl =
      totals.Conversions > 0 ? totals.Spent / totals.Conversions : 0;

    const enhancedTotals = {
      ...totals,
      ctr: totalCtr,
      conRate: totalConRate,
      cpl: totalCpl,
    };

    // Update metrics to include calculated fields in desired order
    const allMetrics = [
      "Impressions",
      "Reach",
      "Clicks",
      "ctr",
      "Conversions",
      "conRate",
      "cpl",
      "Spent",
    ];

    return { enhancedChannelData, enhancedTotals, allMetrics };
  };

  const formatValue = (value, metric) => {
    if (metric === "ctr" || metric === "conRate") {
      return `${value.toFixed(2)}%`;
    }
    if (metric === "cpl") {
      return parseFloat(value.toFixed(2)).toLocaleString();
    }
    return value.toLocaleString();
  };

  const convertToBMK = (value) => {
    if (!value || value === 0) return "0";
    const suffixes = ["", "K", "M", "B", "T"];
    let suffixIndex = 0;
    while (value >= 1000 && suffixIndex < suffixes.length - 1) {
      value /= 1000;
      suffixIndex++;
    }
    return `${value?.toFixed(1)}${suffixes[suffixIndex]}`;
  };

  // Helper function to get channel statistics
  const getChannelStats = () => {
    const channelEntries = Object.entries(channelData);

    if (channelEntries.length === 0) return null;

    const topConversionChannel = channelEntries.reduce((max, current) =>
      current[1].Conversions > max[1].Conversions ? current : max
    );

    const topConversionRateChannel = channelEntries.reduce((max, current) =>
      current[1].conRate > max[1].conRate ? current : max
    );

    return {
      topConversionChannel,
      topConversionRateChannel,
      isTopConversionAlsoTopRate:
        topConversionChannel[0] === topConversionRateChannel[0],
    };
  };

  const summarizeData = () => {
    let summaryTextTemp = "";
    const overallText = `Overall: **CPL ${parseFloat(
      totalData?.cpl?.toFixed(2) || 0
    )?.toLocaleString()} THB with ${totalData.Conversions || 0} conversions**`;
    summaryTextTemp = `<li>${overallText}</li>`;

    let highestConversionChannelText = ``;
    let highestConversionRateChannelText = ``;

    setSummaryOverallText(overallText);

    const channelEntries = Object.entries(channelData);

    if (channelEntries.length === 0) return null;

    const topConversionChannel = channelEntries.reduce((max, current) =>
      current[1].Conversions > max[1].Conversions ? current : max
    );

    const topConversionRateChannel = channelEntries.reduce((max, current) =>
      current[1].conRate > max[1].conRate ? current : max
    );

    if (channelEntries.length > 1) {
      highestConversionChannelText = `Highest conversion channel: **${
        topConversionChannel[0]
      } with ${topConversionChannel[1].Conversions} conversions (${(
        (topConversionChannel[1].Conversions / totalData.Conversions) *
        100
      ).toFixed(2)}% of total conversions)**`;
      setHighestConversionChannelText(highestConversionChannelText);
      summaryTextTemp += `<li>${highestConversionChannelText}</li>`;
    }
    if (topConversionChannel[0] != topConversionRateChannel[0]) {
      highestConversionRateChannelText = `Highest conversion rate channel: **${
        topConversionRateChannel[0]
      } with ${topConversionRateChannel[1].conRate.toFixed(
        2
      )}% conversion rate**`;
      setHasPotentialChannel(true);
      setPotentialChannelText(highestConversionRateChannelText);
      summaryTextTemp += `<li>${highestConversionRateChannelText}</li>`;
    }
    setSummaryText(summaryTextTemp);
  };

  useEffect(() => {
    handleGetData();
    summarizeData();
  }, []);

  useEffect(() => {
    if (totalData && Object.keys(totalData).length > 0) {
      summarizeData();
    }
  }, [totalData]);

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
          onClick={handleGetData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const channelStats = getChannelStats();

  const renderFormattedText = (text) => {
    // Simple HTML parsing for basic formatting
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
        '<span class="text-sm text-gray-600">$1</span>'
      );
  };

  return (
    <div className="flex flex-col py-7 px-10 border w-7xl h-[720px] gap-4">
      <SlideHeader title={"Overall"} />
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-8 gap-2">
          <h4 className="col-span-4 text-lg font-semibold">
            Awareness & Considerations
          </h4>
          <h4 className="col-span-4 text-lg font-semibold">Conversions</h4>
          <NumberDisplayBox
            title={"Impression"}
            value={convertToBMK(totalData.Impressions)}
          />
          <NumberDisplayBox
            title={"Reach"}
            value={convertToBMK(totalData.Reach)}
          />
          <NumberDisplayBox
            title={"Clicks"}
            value={convertToBMK(totalData.Clicks)}
          />
          <NumberDisplayBox
            title={"%CTR"}
            value={`${totalData.ctr?.toFixed(2)}%`}
          />

          {/* Conversion */}
          <NumberDisplayBox
            title={"Conversions"}
            value={totalData.Conversions?.toLocaleString() || "0"}
            isConversion={true}
          />
          <NumberDisplayBox
            title={"%Con Rate"}
            value={`${totalData.conRate?.toFixed(2)}%`}
            isConversion={true}
          />
          <NumberDisplayBox
            title={"CPL"}
            value={convertToBMK(totalData.cpl)}
            isConversion={true}
          />
          <NumberDisplayBox
            title={"Spent"}
            value={convertToBMK(totalData.Spent)}
            isConversion={true}
          />
        </div>

        {/* Performance by Channel Table */}
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-semibold">Performance by Channel</h4>
          <PerformanceDataTable
            channelData={channelData}
            totalData={totalData}
            metrics={metrics}
            formatValue={formatValue}
          />
        </div>

        {/* Summary */}
        <div className="mt-4 border-1 rounded-xl shadow-lg p-4">
          <h4 className="text-lg font-semibold">Summary</h4>
          <ul className="list-disc pl-6">
            <li>
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: renderFormattedText(summaryOverallText),
                }}
              />
              {/* Overall:{" "}
              <span className="font-semibold">
                CPL{" "}
                {`${parseFloat(
                  totalData?.cpl?.toFixed(2) || 0
                )?.toLocaleString()}`}{" "}
                THB with {totalData.Conversions || 0} conversions
              </span> */}
            </li>
            {highestConversionChannelText.length > 0 &&
              Object.keys(channelData).length > 1 && (
                <li>
                  <div
                    className="flex-1"
                    dangerouslySetInnerHTML={{
                      __html: renderFormattedText(highestConversionChannelText),
                    }}
                  />
                  {/* Highest conversion channel:{" "}
                  <span className="font-semibold">
                    {channelStats.topConversionChannel[0]} with{" "}
                    {channelStats.topConversionChannel[1].Conversions}{" "}
                    conversions (
                    {(
                      (channelStats.topConversionChannel[1].Conversions /
                        totalData.Conversions) *
                      100
                    ).toFixed(2)}
                    % of all conversions)
                  </span> */}
                </li>
              )}
            {hasPotentialChannel && (
              <li>
                <div
                  className="flex-1"
                  dangerouslySetInnerHTML={{
                    __html: renderFormattedText(potentialChannelText),
                  }}
                />
              </li>
            )}
            {/* {channelStats && !channelStats.isTopConversionAlsoTopRate && (
              <li>
                Potential channel:{" "}
                <span className="font-semibold">
                  {channelStats.topConversionRateChannel[0]} with{" "}
                  {channelStats.topConversionRateChannel[1].conRate.toFixed(2)}%
                  conversion rate
                </span>
              </li>
            )} */}
          </ul>
        </div>
      </div>
      {/* <TextEditorModal
        isOpen={isOverallEditModalOpen}
        onClose={() => setIsOverallEditModalOpen(false)}
        onSave={(newText) => setSummaryOverallText(newText)}
        initialText={summaryOverallText}
        revertText={summarizeData}
        title="Edit Summary Text"
        placeholder="Enter your summary text..."
      /> */}
      <TextEditorModal
        isOpen={isOverallEditModalOpen}
        onClose={() => setIsOverallEditModalOpen(false)}
        onSave={(newText) => setSummaryText(newText)}
        initialText={summaryText}
        revertText={summarizeData}
        title="Edit Summary Text"
        placeholder="Enter your summary text..."
      />
    </div>
  );
}

export default Overall;
