// OverallSlide2.jsx

import { useData } from "@/contexts/DataContext";
import { prepareData } from "@/utils/slideDataPrepare";
import React, { useMemo } from "react";

const SlideHeader = ({ title }) => (
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
  </div>
);

// Inline HorizontalStackedBar component
const HorizontalStackedBar = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data
    .sort((a, b) => {
      if (a.name > b.name) return -1;
      if (a.name < b.name) return 1;
      return 0;
    })
    .map((item) => ({
      ...item,
      percentage: (item.value / total) * 100,
    }));
  // console.log("dataWithPercentages", dataWithPercentages);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-bold mb-4">
          {title} ({total.toLocaleString()} posts)
        </h3>
      )}

      {/* Main stacked bar */}
      <div className="flex h-12 rounded-lg overflow-hidden shadow-lg">
        {dataWithPercentages.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-center text-white 
                       font-bold text-sm transition-all duration-300 
                       hover:brightness-110 cursor-pointer"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            title={`${item.name}: ${item.value.toLocaleString()} 
               (${item.percentage.toFixed(1)}%)`}
          >
            {item.percentage > 8 && `${item.percentage.toFixed(1)}%`}
          </div>
        ))}
      </div>

      {/* Small segment labels */}
      <div className="flex mt-2">
        {dataWithPercentages.map((item) => (
          <div
            key={`label-${item.name}`}
            className="flex justify-center text-xs text-gray-600"
            style={{ width: `${item.percentage}%` }}
          >
            {item.percentage <= 8 && (
              <span className="font-bold">{item.percentage.toFixed(1)}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {dataWithPercentages.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className="text-sm font-semibold">
              {item.value} ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function OverallSlide3() {
  const { loading, error, refetch, AllData, UniqueDataWithSentiment } =
    useData();

  const { isDataAvailable, chartData } = useMemo(() => {
    try {
      if (!AllData || AllData.length === 0) {
        return {
          chartData: {},
          isDataAvailable: false,
        };
      }

      const preparedData = prepareData(AllData);
      // console.log("preparedData", preparedData);

      const sentimentColors = {
        Positive: "#22c55e",
        Negative: "#ef4444",
        Neutral: "#6b7280",
        Unknown: "#94a3b8",
      };

      // Prepare overall sentiment data
      const aggregatedSentiment = preparedData.sentimentData.reduce(
        (acc, sourceData) => {
          Object.entries(sourceData.summarySentiment).forEach(
            ([sentiment, count]) => {
              acc[sentiment] = (acc[sentiment] || 0) + count;
            }
          );
          return acc;
        },
        {}
      );

      const overallSentimentData = Object.entries(aggregatedSentiment).map(
        ([sentiment, count]) => ({
          name: sentiment,
          value: count,
          color: sentimentColors[sentiment] || "#94a3b8",
        })
      );

      // Prepare sentiment by source
      const sentimentBySourceData = preparedData.sentimentData.map(
        (sourceData) => ({
          source: sourceData.source,
          data: Object.entries(sourceData.summarySentiment).map(
            ([sentiment, count]) => ({
              name: sentiment,
              value: count,
              color: sentimentColors[sentiment] || "#94a3b8",
            })
          ),
        })
      );

      // Generate dynamic colors for sources
      const generateColor = (index, total) => {
        const hue = (index * 360) / total;
        return `hsl(${hue}, 70%, 55%)`;
      };

      // Prepare source distribution with dynamic colors
      const sourceEntries = Object.entries(preparedData.groupedBySource);
      const sourceData = sourceEntries.map(([source, posts], index) => ({
        name: source,
        value: posts.length,
        color: generateColor(index, sourceEntries.length),
      }));

      return {
        chartData: {
          overallSentiment: overallSentimentData,
          sentimentBySource: sentimentBySourceData,
          sourceDistribution: sourceData,
        },
        isDataAvailable: true,
      };
    } catch (error) {
      console.error("Error processing data:", error);
      return {
        chartData: {},
        isDataAvailable: false,
      };
    }
  }, [AllData, UniqueDataWithSentiment]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-4 items-center justify-center">
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

  if (!isDataAvailable) {
    return (
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div id="overall-slide-3" className="w-[1280px] h-[720px]">
      <div className="flex flex-col w-full h-full bg-white border">
        {/* Header */}
        <div className="px-8 py-4 border-b">
          <SlideHeader title={"Overall 3"} />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4">
          {/* Right Column - Sentiment by Source */}
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Sentiment by Source
          </h3>
          <div className="grid grid-cols-3">
            {chartData.sentimentBySource.map((sourceData) => (
              <div
                key={sourceData.source}
                className="bg-white px-2 py-2 rounded border"
              >
                <h4 className="text-md font-semibold text-gray-700 capitalize mb-2">
                  {sourceData.source}
                </h4>
                <HorizontalStackedBar data={sourceData.data} title="" />
              </div>
            ))}
            <div className="bg-white px-2 py-2 rounded border">
              <h4 className="text-md font-semibold text-gray-700 capitalize mb-2">
                Summary
              </h4>
              <p className="indent-8">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Deleniti iure in ab deserunt aspernatur nihil? Unde praesentium
                porro iure molestias?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverallSlide3;
