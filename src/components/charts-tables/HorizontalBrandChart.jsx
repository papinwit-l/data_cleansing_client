// HorizontalBrandChart.jsx

import React from "react";

function HorizontalBrandChart({ data, title = "Brand Performance" }) {
  // Calculate total impressions for proportions
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Add proportions to data
  const dataWithProportions = data.map((item, index) => ({
    ...item,
    proportion: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    rank: index + 1,
  }));

  // Sort by impressions (descending) to match the visual hierarchy
  const sortedData = [...dataWithProportions].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full bg-white">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}

      {/* Header Row */}
      <div className="grid grid-cols-9 gap-2 mb-2 text-sm font-medium text-gray-600 border-b border-gray-200 pb-2">
        <div className="col-span-2">Brand</div>
        <div className="col-span-2 text-right">Proportion</div>
        <div className="col-span-5 text-center">Posts</div>
        {/* <div className="col-span-3 text-right">top brand</div> */}
      </div>

      {/* Data Rows */}
      {sortedData.map((item, index) => {
        const maxValue = Math.max(...sortedData.map((d) => d.value));
        const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div
            key={item.name || index}
            className="grid grid-cols-9 gap-2 py-2 items-center border-b border-gray-100 last:border-b-0"
          >
            {/* Brand Name */}
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-800 lowercase">
                {item.name || `Brand ${index + 1}`}
              </span>
            </div>

            {/* Proportion */}
            <div className="col-span-2 text-right">
              <span className="text-sm font-semibold text-gray-700">
                {item.proportion.toFixed(0)}%
              </span>
            </div>

            {/* Impressions with Bar */}
            <div className="col-span-5 relative">
              {/* Background bar area */}
              <div className="relative h-6 bg-gray-100 rounded">
                {/* Colored bar */}
                <div
                  className="h-full rounded transition-all duration-500 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: getChannelColor(item.name, index),
                  }}
                />
                {/* Impressions text overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white mix-blend-difference">
                    {item.value?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Brand Ranking */}
            {/* <div className="col-span-3 text-right">
              <span className="text-sm text-gray-500">
                Brand {String.fromCharCode(65 + index)} 
              </span>
            </div> */}
          </div>
        );
      })}
    </div>
  );
}

// Helper function to get colors for different channels
function getChannelColor(channelName, index) {
  const defaultColors = [
    "#22C55E",
    "#3B82F6",
    "#EF4444",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
    "#10B981",
    "#F97316",
    "#6366F1",
  ];

  // If we have more items than predefined colors, generate colors dynamically
  if (index >= defaultColors.length) {
    return generateDynamicColor(index);
  }

  // Use index-based color from predefined palette
  return defaultColors[index % defaultColors.length];
}

// Function to generate colors dynamically using HSL
function generateDynamicColor(index) {
  // Use golden ratio for better color distribution
  const goldenRatio = 0.618033988749895;

  // Start after our predefined colors count to avoid conflicts
  const adjustedIndex = index;

  // Generate hue using golden ratio for even distribution
  const hue = (adjustedIndex * goldenRatio * 360) % 360;

  // Vary saturation and lightness for better distinction
  const saturation = 65 + (adjustedIndex % 3) * 10; // 65%, 75%, 85%
  const lightness = 45 + (adjustedIndex % 4) * 5; // 45%, 50%, 55%, 60%

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

export default HorizontalBrandChart;
