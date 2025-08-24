import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts";

const DailyPerformanceChart = ({ dailyData }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate interval based on data length
  const getTickInterval = (dataLength) => {
    if (dataLength <= 7) return 0; // Show all dates for 7 days or less
    if (dataLength <= 14) return 1; // Show every 2nd date
    if (dataLength <= 30) return Math.floor(dataLength / 7); // Show ~7 dates
    return Math.floor(dataLength / 10); // Show ~10 dates for longer periods
  };

  const tickInterval = getTickInterval(dailyData.length);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Daily Performance</h2>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={dailyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={tickInterval}
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(value) => `Date: ${formatDate(value)}`}
              formatter={(value, name) => [
                name === "ctr"
                  ? `${value.toFixed(2)}%`
                  : value.toLocaleString(),
                name === "ctr" ? "%CTR" : "Conversions",
              ]}
            />
            <Legend vertocalAlign="bottom" />
            <Bar
              yAxisId="left"
              dataKey="conversions"
              fill="#F97316"
              name="Conversions"
              opacity={0.8}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ctr"
              stroke="#2563EB"
              strokeWidth={1.5}
              name="%CTR"
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyPerformanceChart;
