// HorizontalStackedBar.jsx

import React from "react";

function HorizontalStackedBar({ data, title }) {
  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map((item) => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-bold mb-4">
          {total.toLocaleString()} {title}
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
            <span className="text-sm text-gray-600">
              {item.name.toLowerCase()}
            </span>
            <span className="text-sm font-semibold">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HorizontalStackedBar;
