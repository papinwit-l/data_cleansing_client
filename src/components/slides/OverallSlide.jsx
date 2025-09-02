import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Mock data context hook for demo
const useData = () => {
  const mockData = [
    {
      Account: "metave_may",
      Message:
        "มาเปิดรับออเดอร์จ้า กดสั่งวันนี้ผ่านออนไลน์ขอคนรอของได้นะคะ ราคาตามภาพ",
      Source: "x",
      "Post time": "2025-04-01 00:50:50",
      Engagement: "6",
      "Follower count": "182",
      Sentiment: "Neutral",
      Category: "Cerave",
    },
    {
      Account: "after_shipping",
      Message: "มาค่ะ♻️ ชุดเหยือกน้ำน่ารักมากจาก Pillowfort",
      Source: "instagram",
      "Post time": "2025-04-01 01:08:15",
      Engagement: "0",
      "Follower count": "0",
      Sentiment: "Positive",
      Category: "Cerave",
    },
    {
      Account: "beauty_lover",
      Source: "instagram",
      "Post time": "2025-04-01 02:15:30",
      Engagement: "15",
      "Follower count": "1250",
      Sentiment: "Positive",
      Category: "Cerave",
    },
    {
      Account: "skincare_tips",
      Source: "x",
      "Post time": "2025-04-01 03:22:45",
      Engagement: "8",
      "Follower count": "890",
      Sentiment: "Neutral",
      Category: "Cerave",
    },
  ];

  return {
    loading: false,
    error: null,
    refetch: () => {},
    AllData: mockData,
    UniqueDataWithSentiment: mockData,
  };
};

// Analytics functions
const groupDataBySource = (data) => {
  return data.reduce((acc, item) => {
    const { Source } = item;
    if (!acc[Source]) {
      acc[Source] = [];
    }
    acc[Source].push(item);
    return acc;
  }, {});
};

const calculateTotalEngagementBySource = (data) => {
  const engagementBySource = data.reduce((acc, post) => {
    const source = post.Source;
    const engagement = parseInt(post.Engagement) || 0;

    if (!acc[source]) {
      acc[source] = {
        source: source,
        totalEngagement: 0,
        postCount: 0,
        averageEngagement: 0,
        percentage: 0,
      };
    }

    acc[source].totalEngagement += engagement;
    acc[source].postCount += 1;

    return acc;
  }, {});

  const grandTotal = Object.values(engagementBySource).reduce(
    (sum, sourceData) => sum + sourceData.totalEngagement,
    0
  );

  Object.keys(engagementBySource).forEach((source) => {
    const sourceData = engagementBySource[source];
    sourceData.averageEngagement =
      sourceData.postCount > 0
        ? (sourceData.totalEngagement / sourceData.postCount).toFixed(2)
        : 0;
    sourceData.percentage =
      grandTotal > 0
        ? ((sourceData.totalEngagement / grandTotal) * 100).toFixed(1)
        : 0;
  });

  return engagementBySource;
};

const getSentimentData = (data) => {
  return data.reduce((acc, post) => {
    const sentiment = post.Sentiment || "Unknown";
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});
};

const summarizeEngagementData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      groupedBySource: {},
      totalEngagementBySource: {},
      sentimentData: {},
    };
  }

  const groupedBySource = groupDataBySource(data);
  const totalEngagementBySource = calculateTotalEngagementBySource(data);
  const sentimentData = getSentimentData(data);

  return {
    groupedBySource,
    totalEngagementBySource,
    sentimentData,
  };
};

const SlideHeader = ({ title }) => (
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
  </div>
);

// Chart components
const EngagementBySourceChart = ({ data }) => {
  const chartData = Object.entries(data).map(([source, info]) => ({
    source: source.charAt(0).toUpperCase() + source.slice(1),
    engagement: info.totalEngagement,
    posts: info.postCount,
    avgEngagement: parseFloat(info.averageEngagement),
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Engagement by Source
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="source" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="engagement" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SentimentDistributionChart = ({ data }) => {
  const chartData = Object.entries(data).map(([sentiment, count]) => ({
    name: sentiment,
    value: count,
  }));

  const COLORS = {
    Positive: "#10B981",
    Neutral: "#F59E0B",
    Negative: "#EF4444",
    Unknown: "#6B7280",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Sentiment Distribution
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || "#6B7280"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS[entry.name] || "#6B7280" }}
            />
            <span>
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PostCountBySourceChart = ({ data }) => {
  const chartData = Object.entries(data).map(([source, info]) => ({
    source: source.charAt(0).toUpperCase() + source.slice(1),
    posts: info.postCount,
    percentage: parseFloat(info.percentage),
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Posts by Source
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            paddingAngle={3}
            dataKey="posts"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? "#8B5CF6" : "#EC4899"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {chartData.map((entry, index) => (
          <div key={entry.source} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: index % 2 === 0 ? "#8B5CF6" : "#EC4899",
              }}
            />
            <span>
              {entry.source}: {entry.posts}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SummaryMetrics = ({ data }) => {
  const totalEngagement = Object.values(data.totalEngagementBySource).reduce(
    (sum, source) => sum + source.totalEngagement,
    0
  );
  const totalPosts = Object.values(data.totalEngagementBySource).reduce(
    (sum, source) => sum + source.postCount,
    0
  );
  const avgEngagement =
    totalPosts > 0 ? (totalEngagement / totalPosts).toFixed(1) : 0;
  const sourcesCount = Object.keys(data.totalEngagementBySource).length;

  const metrics = [
    { label: "Total Posts", value: totalPosts, color: "bg-blue-500" },
    {
      label: "Total Engagement",
      value: totalEngagement,
      color: "bg-green-500",
    },
    { label: "Avg Engagement", value: avgEngagement, color: "bg-purple-500" },
    { label: "Sources", value: sourcesCount, color: "bg-orange-500" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Key Metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className={`${metric.color} text-white rounded-lg p-3`}>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm opacity-90">{metric.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function OverallSlide() {
  const { loading, error, refetch, AllData, UniqueDataWithSentiment } =
    useData();

  const { isDataAvailable, preparedData } = useMemo(() => {
    try {
      if (!AllData || AllData.length === 0) {
        return {
          preparedData: {},
          isDataAvailable: false,
        };
      }
      const preparedData = summarizeEngagementData(AllData);

      return {
        preparedData,
        isDataAvailable: true,
      };
    } catch (error) {
      console.error("Error processing data:", error);
      return {
        preparedData: {},
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
    <div id="overall-slide">
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-2 relative group bg-white">
        <SlideHeader title={"Overall"} />
        <div className="flex flex-col justify-between h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Summary Metrics - Takes 1 column */}
            <div className="lg:col-span-1">
              <SummaryMetrics data={preparedData} />
            </div>

            {/* Engagement by Source Chart - Takes 1 column */}
            <div className="lg:col-span-1">
              <EngagementBySourceChart
                data={preparedData.totalEngagementBySource}
              />
            </div>

            {/* Sentiment Distribution - Takes 1 column */}
            <div className="lg:col-span-1">
              <SentimentDistributionChart data={preparedData.sentimentData} />
            </div>

            {/* Posts by Source Chart - Takes full width on smaller screens, 2 columns on large */}
            <div className="md:col-span-2 lg:col-span-2">
              <PostCountBySourceChart
                data={preparedData.totalEngagementBySource}
              />
            </div>

            {/* Additional space for future charts */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border h-full flex items-center justify-center">
                <span className="text-gray-500">Additional Chart Space</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverallSlide;
