import React from "react";

function SEMDataTable({ channelData, totalData, metrics, formatValue }) {
  // Helper function to format metric names for display
  const formatMetricName = (metric) => {
    switch (metric) {
      case "ctr":
        return "CTR (%)";
      case "conRate":
        return "Conv Rate (%)";
      case "cpl":
        return "CPL";
      case "Impressions":
        return "Impressions";
      case "Clicks":
        return "Clicks";
      case "cpc":
        return "CPC";
      case "Conversions":
        return "Conversions";
      case "Spent":
        return "Spent";
      case "Reach":
        return "Reach";
      case "Keyword":
        return "Keyword";
      default:
        return metric;
    }
  };

  // Helper function to format values if formatValue is not provided
  const defaultFormatValue = (value, metric) => {
    if (value === null || value === undefined) return "0";

    switch (metric) {
      case "ctr":
      case "conRate":
        return `${Number(value).toFixed(2)}%`;
      case "cpl":
      case "Spent":
        return `$${Number(value).toFixed(2)}`;
      case "Impressions":
      case "Clicks":
      case "Conversions":
      case "Reach":
        return Number(value).toLocaleString();
      default:
        return value.toString();
    }
  };

  const valueFormatter = formatValue || defaultFormatValue;

  // Filter out non-numeric metrics for the table display
  const displayMetrics = metrics.filter(
    (metric) => metric !== "Keyword" && metric !== "Channel"
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 text-[12px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-1 border text-left font-semibold">
              Keyword
            </th>
            {displayMetrics.map((metric) => (
              <th
                key={metric}
                className="px-2 py-1 border text-right font-semibold"
              >
                {formatMetricName(metric)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Check if channelData exists and has entries */}
          {channelData && Object.keys(channelData).length > 0 ? (
            Object.entries(channelData)
              .sort(
                ([, a], [, b]) =>
                  (b["Conversions"] || 0) - (a["Conversions"] || 0)
              )
              .slice(
                0,
                Object.entries(channelData).length > 12
                  ? 12
                  : Object.entries(channelData).length
              )
              .map(([keyword, values]) => (
                <tr key={keyword} className="hover:bg-gray-100">
                  <td className="px-2 py-1 border font-medium">{keyword}</td>
                  {displayMetrics.map((metric) => (
                    <td key={metric} className="px-2 py-1 border text-right">
                      {valueFormatter(values[metric] || 0, metric)}
                    </td>
                  ))}
                </tr>
              ))
          ) : (
            <tr>
              <td
                colSpan={displayMetrics.length + 1}
                className="px-2 py-4 border text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}

          {/* Total row */}
          {totalData && Object.keys(totalData).length > 0 && (
            <tr className="bg-gray-200 font-semibold border-t-2 border-gray-400">
              <td className="px-2 py-1 border font-bold">Total</td>
              {displayMetrics.map((metric) => (
                <td
                  key={metric}
                  className="px-2 py-1 border text-right font-bold"
                >
                  {valueFormatter(totalData[metric] || 0, metric)}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SEMDataTable;
