import { useData } from "@/contexts/DataContext";
import React, { useMemo } from "react";
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
  LabelList,
} from "recharts";

// Mock data context hook for demo

// Utility function to format numbers with commas
const formatNumber = (num) => {
  if (num >= 1000) {
    return num.toLocaleString();
  }
  return num.toString();
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
  const sentimentCounts = data.reduce((acc, post) => {
    const sentiment = post.Sentiment || "Unknown";
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  // Calculate total for percentage calculation
  const total = Object.values(sentimentCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Add percentage to each sentiment
  const sentimentWithPercentages = {};
  Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
    sentimentWithPercentages[sentiment] = {
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
    };
  });

  return sentimentWithPercentages;
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

// Custom label function for external positioning
const renderExternalLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  value,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30; // Position outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="11"
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// Custom tooltip that shows both count and percentage with formatted numbers
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="font-medium">{data.name || label}</p>
        <p className="text-sm">
          Count:{" "}
          <span className="font-semibold">
            {formatNumber(data.value || data.posts)}
          </span>
        </p>
        <p className="text-sm">
          Percentage: <span className="font-semibold">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

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
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
            formatter={(value) => [formatNumber(value), "Engagement"]}
          />
          <Bar dataKey="engagement" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SentimentDistributionChart = ({ data }) => {
  const chartData = Object.entries(data).map(([sentiment, info]) => ({
    name: sentiment,
    value: info.count,
    percentage: parseFloat(info.percentage),
  }));

  const COLORS = {
    Positive: "#10B981",
    Neutral: "#F59E0B",
    Negative: "#EF4444",
    Unknown: "#6B7280",
  };

  // Custom label function for the pie chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }) => {
    if (percentage < 5) return null; // Don't show labels for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Sentiment Distribution
      </h3>
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={30}
              outerRadius={60}
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
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS[entry.name] || "#6B7280" }}
            />
            <span className="text-gray-700">
              {entry.name}: {formatNumber(entry.value)} ({entry.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PostCountBySourceChart = ({ data }) => {
  // Calculate total posts for percentage calculation
  const totalPosts = Object.values(data).reduce(
    (sum, info) => sum + info.postCount,
    0
  );

  const chartData = Object.entries(data).map(([source, info]) => ({
    source: source.charAt(0).toUpperCase() + source.slice(1),
    posts: info.postCount,
    percentage:
      totalPosts > 0 ? ((info.postCount / totalPosts) * 100).toFixed(1) : 0,
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: info.postCount,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Posts by Source
      </h3>
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderExternalLabel}
              outerRadius={65}
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
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {chartData.map((entry, index) => (
          <div key={entry.source} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: index % 2 === 0 ? "#8B5CF6" : "#EC4899",
              }}
            />
            <span>
              {entry.source}: {formatNumber(entry.posts)} ({entry.percentage}%)
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
    {
      label: "Total Posts",
      value: formatNumber(totalPosts),
      color: "bg-blue-500",
    },
    {
      label: "Total Engagement",
      value: formatNumber(totalEngagement),
      color: "bg-green-500",
    },
    {
      label: "Avg Engagement",
      value: formatNumber(avgEngagement),
      color: "bg-purple-500",
    },
    {
      label: "Sources",
      value: formatNumber(sourcesCount),
      color: "bg-orange-500",
    },
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

export default function OverallSlide() {
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
    <div id="overall-slide" className="w-[1280px] h-[720px]">
      <div className="flex flex-col w-full h-full bg-white border">
        {/* Header */}
        <div className="px-8 py-4 border-b">
          <SlideHeader title={"Overall"} />
        </div>
        <div className="flex flex-col justify-between h-full p-4">
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
              <div className="bg-white p-6 rounded-lg shadow-sm border h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Summary
                </h3>
                <p className="indent-8">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure,
                  a suscipit? Nostrum veniam iste quibusdam temporibus minus
                  nulla animi veritatis, rerum sequi. Quidem vero voluptate nemo
                  officiis doloremque repellendus adipisci quos nihil explicabo
                  ipsum eligendi harum, amet, alias cum mollitia!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
