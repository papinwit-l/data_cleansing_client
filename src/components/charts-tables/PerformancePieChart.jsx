import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const PerformancePieChart = ({ channelData }) => {
  const COLORS = [
    "#60A5FA", // FB Lead - blue
    "#F97316", // TikTok Lead - orange
    "#EC4899", // FB Messages - pink
    "#8B5CF6", // FB Conversions - purple
    "#EF4444", // SEM - red
    "#F59E0B", // GDN - amber
    "#06B6D4", // Taboola - cyan
    "#10B981", // Discovery - emerald
    "#F472B6", // YouTube - pink-400
    "#94A3B8", // Others - slate
  ];

  const chartData = Object.entries(channelData)
    .map(([channel, data], index) => ({
      name: channel,
      value: data.Conversions,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null;

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
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Performance by Channels</h2>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value.toLocaleString(), "Conversions"]}
            />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconSize={12}
              wrapperStyle={{ paddingLeft: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformancePieChart;
