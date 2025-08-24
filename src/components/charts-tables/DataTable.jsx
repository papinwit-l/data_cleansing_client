import React from "react";

function DataTable({
  firstMetric,
  channelData,
  totalData,
  metrics,
  formatValue,
  maxRows = 12,
}) {
  // Helper function to format metric names for display
  const formatMetricName = (metric) => {
    switch (metric.toLowerCase()) {
      case "ad group name":
        return "Ad group name";
      case "ad set name":
        return "Ad set name";
      case "channel":
        return "Channel";
      case "ctr":
        return "CTR (%)";
      case "conrate":
      case "cvr":
        return "Conv Rate (%)";
      case "cpl":
        return "CPL";
      case "impressions":
        return "Impressions";
      case "clicks":
        return "Clicks";
      case "cpc":
        return "CPC";
      case "conversions":
        return "Conversions";
      case "spent":
        return "Spent";
      case "reach":
        return "Reach";
      case "frequency":
        return "Frequency";
      case "cpr":
        return "CPR";
      case "views":
        return "Video views";
      case "keyword":
        return "Keyword";
      default:
        // Capitalize first letter of each word
        return metric
          .split(/(?=[A-Z])/)
          .join(" ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  // Helper function to format values if formatValue is not provided
  const defaultFormatValue = (value, metric) => {
    if (value === null || value === undefined) return "0";

    const metricLower = metric.toLowerCase();
    switch (metricLower) {
      case "ctr":
      case "conrate":
      case "cvr":
        return `${Number(value).toFixed(2)}%`;
      case "cpl":
      case "spent":
      case "cpc":
      case "cpr":
        return `${Number(value).toFixed(2)}`;
      case "impressions":
      case "clicks":
      case "conversions":
      case "reach":
        return Number(value).toLocaleString();
      case "frequency":
        return Number(value).toFixed(2);
      default:
        return value.toString();
    }
  };

  const valueFormatter = formatValue || defaultFormatValue;

  // Filter out non-numeric metrics for the table display
  const displayMetrics = metrics.filter((metric) => {
    const metricLower = metric.toLowerCase();
    return (
      metricLower !== "keyword" &&
      metricLower !== "channel" &&
      metricLower !== "ad group name" &&
      metricLower !== "ad set name" &&
      metricLower !== "ad name"
    );
  });

  // Helper function to get the sort key (handle both uppercase and lowercase)
  const getSortKey = (data) => {
    // Try different possible conversion keys
    return (
      data["conversions"] ||
      data["Conversions"] ||
      data["clicks"] ||
      data["Clicks"] ||
      data["impressions"] ||
      data["Impressions"] ||
      0
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 text-[12px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-1 border text-left font-semibold">
              {formatMetricName(firstMetric)}
            </th>
            {displayMetrics.map((metric) => {
              return (
                <th
                  key={metric}
                  className="px-2 py-1 border text-right font-semibold"
                >
                  {formatMetricName(metric)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Check if channelData exists and has entries */}
          {channelData && Object.keys(channelData).length > 0 ? (
            Object.entries(channelData)
              .sort(([, a], [, b]) => {
                // Sort by conversions first, then clicks, then impressions
                const aSort = getSortKey(a);
                const bSort = getSortKey(b);
                return bSort - aSort;
              })
              .slice(
                0,
                Object.entries(channelData).length > maxRows && maxRows > 0
                  ? maxRows
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

export default DataTable;
