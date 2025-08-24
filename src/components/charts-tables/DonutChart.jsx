import React, { useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DonutChart = ({
  data,
  title,
  width = 300,
  height = 300,
  innerRadius = 60,
  outerRadius = 120,
  showLabels = true,
  showLegend = true,
  paddingAngle = 2,
  labelDistance = 140,
  isPercentage = false,
  isLegendWrap = true,
}) => {
  // Transform percentage string data to chart format
  const transformDataForChart = (dataObj, defaultColors = {}) => {
    // Add safety checks
    if (
      !dataObj ||
      typeof dataObj !== "object" ||
      Object.keys(dataObj).length === 0
    ) {
      return [];
    }

    // Filter out "No Data" values and convert percentages
    const validEntries = Object.entries(dataObj).filter(([key, value]) => {
      // Skip if value is "No Data" or similar
      if (
        value === "No Data" ||
        value === "No data" ||
        value === null ||
        value === undefined
      ) {
        return false;
      }

      // For percentage strings, check if it's a valid number
      if (typeof value === "string" && value.includes("%")) {
        const numValue = parseFloat(value.replace("%", ""));
        return !isNaN(numValue) && numValue > 0;
      }

      // For regular numbers
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0;
    });

    return validEntries.map(([key, percentage], index) => ({
      name: key,
      value: parseFloat(percentage.toString().replace("%", "")),
      color: defaultColors[key] || getDefaultColor(index),
    }));
  };

  // Default color generator
  const getDefaultColor = (index) => {
    const colors = [
      "#3B82F6",
      "#EC4899",
      "#F97316",
      "#06B6D4",
      "#8B5CF6",
      "#EF4444",
      "#10B981",
    ];
    return colors[index % colors.length];
  };

  // Check if data contains only "No Data" values
  const hasValidData = (dataObj) => {
    if (
      !dataObj ||
      typeof dataObj !== "object" ||
      Object.keys(dataObj).length === 0
    ) {
      return false;
    }

    return Object.values(dataObj).some((value) => {
      if (
        value === "No Data" ||
        value === "No data" ||
        value === null ||
        value === undefined
      ) {
        return false;
      }

      if (typeof value === "string" && value.includes("%")) {
        const numValue = parseFloat(value.replace("%", ""));
        return !isNaN(numValue) && numValue > 0;
      }

      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0;
    });
  };

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!hasValidData(data)) {
      return [];
    }

    // Handle different data formats
    if (Array.isArray(data)) {
      // Already formatted chart data
      return data.filter((item) => item.value > 0);
    } else if (typeof data === "object") {
      // Object with percentage strings (your format)
      return transformDataForChart(data);
    }

    return [];
  }, [data]);

  // Your original CustomLabel with stability improvements
  const CustomLabel = useCallback(
    ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      name,
      value,
      fill,
    }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      // Adjustable label line length
      const lineLength1 = 7; // First segment length (shortened)
      const lineLength2 = 7; // Second segment length (shortened)

      // Calculate label position (outside the pie)
      const labelRadius = outerRadius + lineLength1 + lineLength2;
      const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
      const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);

      // Calculate line points
      const lineRadius = outerRadius + lineLength1;
      const lineX = cx + lineRadius * Math.cos(-midAngle * RADIAN);
      const lineY = cy + lineRadius * Math.sin(-midAngle * RADIAN);

      return (
        <g key={`label-${name}-${value}`}>
          {/* Custom label line - first segment */}
          <line
            x1={x}
            y1={y}
            x2={lineX}
            y2={lineY}
            stroke={fill} // Use the same color as the chart segment
            strokeWidth={1}
          />

          {/* Label text */}
          <text
            x={labelX}
            y={labelY}
            fill={fill}
            textAnchor={labelX > cx ? "start" : "end"}
            dominantBaseline="central"
            fontSize="10"
            fontWeight="500"
          >
            {`${value}${isPercentage ? "%" : ""}`}
          </text>
        </g>
      );
    },
    [isPercentage]
  );

  // Early return if no valid data
  // if (!hasValidData(data)) {
  //   return (
  //     <div className="w-full flex flex-col items-center">
  //       {title && (
  //         <h3 className="text-lg font-semibold text-center">{title}</h3>
  //       )}
  //       <div
  //         className="flex items-center justify-center text-gray-500 text-sm"
  //         style={{ width, height }}
  //       >
  //         No data available
  //       </div>
  //     </div>
  //   );
  // }
  if (!hasValidData(data)) {
    return <div className="w-full flex flex-col items-center"></div>;
  }

  // Final check - if no valid chart data after processing
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        {title && (
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        )}
        <div
          className="flex items-center justify-center text-gray-500 text-sm"
          style={{ width, height }}
        >
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center ">
      {title && <h3 className="text-lg font-semibold text-center">{title}</h3>}

      <div className="flex w-full items-center gap-4">
        {/* Chart */}
        <div className="relative">
          <PieChart width={width} height={height}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={paddingAngle}
              dataKey="value"
              label={CustomLabel}
              labelLine={false}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col justify-center gap-2 text-[10px]">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`text-gray-700 leading-tight ${
                    isLegendWrap ? "" : "text-nowrap"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonutChart;
