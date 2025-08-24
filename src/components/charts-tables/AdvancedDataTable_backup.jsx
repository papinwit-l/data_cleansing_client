import React, { useState } from "react";

export const AdvancedDataTable = ({
  firstMetric,
  channelData,
  totalData,
  metrics,
  formatValue,
  maxRows = 12,
  defaultSortBy = "conversions",
  defaultSortOrder = "desc",
  enableSorting = true,
}) => {
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

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
      case "keyword":
        return "Keyword";
      case "cpm":
        return "CPM";
      case "engagements":
        return "Post Engagements";
      case "engagementrate":
        return "Engagement Rate (%)";
      case "cpe":
        return "CPE";
      default:
        return metric
          .split(/(?=[A-Z])/)
          .join(" ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const defaultFormatValue = (value, metric) => {
    if (value === null || value === undefined) return "0";

    const metricLower = metric.toLowerCase();
    switch (metricLower) {
      case "ctr":
      case "conrate":
      case "cvr":
      case "engagementrate": // ✅ ADDED: Format engagement rate as percentage
        return `${Number(value).toFixed(2)}%`;
      case "cpl":
      case "spent":
      case "cpc":
      case "cpr":
      case "cpm":
      case "cpe": // ✅ ADDED: CPE formatting
        return `${Number(value).toFixed(2)}`;
      case "impressions":
      case "clicks":
      case "conversions":
      case "reach":
      case "engagements": // ✅ ADDED: Format engagements as number
        return Number(value).toLocaleString();
      case "frequency":
        return Number(value).toFixed(2);
      default:
        return value.toString();
    }
  };

  const valueFormatter = formatValue || defaultFormatValue;

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

  const getSortValue = (data, metric) => {
    if (!metric) return 0;

    const possibleKeys = [
      metric,
      metric.toLowerCase(),
      metric.charAt(0).toUpperCase() + metric.slice(1),
    ];

    for (const key of possibleKeys) {
      if (data[key] !== undefined && data[key] !== null) {
        return Number(data[key]) || 0;
      }
    }

    return 0;
  };

  const handleSort = (metric) => {
    if (!enableSorting) return;

    if (sortBy === metric) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(metric);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ column }) => {
    if (!enableSorting) return null;

    if (sortBy !== column) {
      return (
        <svg
          className="w-3 h-3 ml-1 text-gray-400 inline"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 12l5-5 5 5H5z" />
        </svg>
      );
    }

    return (
      <svg
        className={`w-3 h-3 ml-1 inline transition-transform ${
          sortOrder === "desc" ? "rotate-180" : ""
        } text-blue-600`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 12l5-5 5 5H5z" />
      </svg>
    );
  };

  const sortedData =
    channelData && Object.keys(channelData).length > 0
      ? Object.entries(channelData).sort(([nameA, dataA], [nameB, dataB]) => {
          let aValue, bValue;

          if (sortBy === firstMetric.toLowerCase() || sortBy === "name") {
            aValue = nameA.toLowerCase();
            bValue = nameB.toLowerCase();

            if (sortOrder === "asc") {
              return aValue.localeCompare(bValue);
            } else {
              return bValue.localeCompare(aValue);
            }
          } else {
            aValue = getSortValue(dataA, sortBy);
            bValue = getSortValue(dataB, sortBy);

            if (sortOrder === "asc") {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          }
        })
      : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 text-[12px]">
        <thead>
          <tr className="bg-gray-200">
            <th
              className={`px-2 py-1 border text-left font-semibold ${
                enableSorting ? "cursor-pointer hover:bg-gray-300" : ""
              } select-none`}
              onClick={() => handleSort("name")}
            >
              {formatMetricName(firstMetric)}
              <SortIcon column="name" />
            </th>
            {displayMetrics.map((metric) => {
              return (
                <th
                  key={metric}
                  className={`px-2 py-1 border text-right font-semibold ${
                    enableSorting ? "cursor-pointer hover:bg-gray-300" : ""
                  } select-none`}
                  onClick={() => handleSort(metric)}
                >
                  {formatMetricName(metric)}
                  <SortIcon column={metric} />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData
              .slice(0, maxRows > 0 ? maxRows : sortedData.length)
              .map(([keyword, values]) => (
                <tr key={keyword} className="hover:bg-gray-100">
                  <td className="px-2 py-[2px] border font-medium">
                    {keyword}
                  </td>
                  {displayMetrics.map((metric) => (
                    <td
                      key={metric}
                      className="px-2 py-[2px] border text-right"
                    >
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
};
