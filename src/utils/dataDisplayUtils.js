// utils/dataDisplayUtils.js

/**
 * Converts numbers to readable format with K, M, B, T suffixes
 * Handles edge cases and "No Data" strings
 */
export const convertToBMK = (value, decimals = 1) => {
  // Handle "No Data" case
  if (value === "No Data") return "No Data";

  // Handle null, undefined, empty string, or 0
  if (!value || value === 0) return "0";

  // Handle non-numeric values
  const numValue = Number(value);
  if (isNaN(numValue)) return "0";

  const suffixes = ["", "K", "M", "B", "T"];
  let suffixIndex = 0;
  let convertedValue = Math.abs(numValue);

  while (convertedValue >= 1000 && suffixIndex < suffixes.length - 1) {
    convertedValue /= 1000;
    suffixIndex++;
  }

  // ✅ FIXED: Use toLocaleString for proper comma formatting
  const formatted = convertedValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = numValue < 0 ? "-" : "";

  return `${sign}${formatted}${suffixes[suffixIndex]}`;
};

/**
 * Formats percentage values with proper decimal places
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === "No Data") return "No Data";
  if (!value && value !== 0) return "0.00%";

  const numValue = Number(value);
  if (isNaN(numValue)) return "0.00%";

  // ✅ FIXED: Use toLocaleString for consistent formatting
  return `${numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};

/**
 * Formats decimal values with specified decimal places
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === "No Data") return "No Data";
  if (!value && value !== 0) return "0.00";

  const numValue = Number(value);
  if (isNaN(numValue)) return "0.00";

  // ✅ FIXED: Use toLocaleString for proper comma formatting
  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (value, decimals = 0, currency = "$") => {
  if (value === "No Data") return "No Data";
  if (!value && value !== 0) return `${currency}0`;

  const numValue = Number(value);
  if (isNaN(numValue)) return `${currency}0`;

  // ✅ FIXED: Use toLocaleString for proper comma formatting
  return `${currency}${numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/**
 * Formats display data for NumberDisplayBox component
 * Handles all edge cases and provides consistent formatting
 */
export const formatDisplayData = (
  value,
  comparisonValue,
  valueType = "compact"
) => {
  // Handle "No Data" case or undefined/null values
  if (value === "No Data" || value === undefined || value === null) {
    return {
      displayValue: "No Data",
      compareValue: "No data",
      isNegative: false,
    };
  }

  // Format main value based on type
  let displayValue;
  switch (valueType) {
    case "compact":
      displayValue = convertToBMK(value, 1); // 1 decimal places for compact
      break;
    case "percentage":
      displayValue = formatPercentage(value, 2);
      break;
    case "currency":
      displayValue = formatCurrency(value, 0); // 0 decimal places for currency
      break;
    case "decimal":
      displayValue = formatDecimal(value, 2); // Decimal format with 2 decimal places
      break;
    case "number":
      // ✅ FIXED: Ensure proper number formatting with commas
      const numValue = Number(value);
      displayValue = isNaN(numValue) ? "0" : numValue.toLocaleString();
      break;
    default:
      // ✅ FIXED: Ensure default case has proper comma formatting
      const defaultNumValue = Number(value);
      displayValue = isNaN(defaultNumValue)
        ? "0"
        : defaultNumValue.toLocaleString();
  }

  // Format comparison value
  let compareValue = "No data";
  let isNegative = false;

  if (
    comparisonValue !== undefined &&
    comparisonValue !== null &&
    comparisonValue !== "No Data"
  ) {
    const numComparison = Number(comparisonValue);
    if (!isNaN(numComparison)) {
      compareValue = formatPercentage(Math.abs(numComparison), 2);
      isNegative = numComparison < 0;
    }
  }

  return {
    displayValue,
    compareValue,
    isNegative,
  };
};

/**
 * Batch formatter for multiple metrics
 * Useful for processing multiple NumberDisplayBox components at once
 */
export const formatMetricsData = (
  totalsData,
  comparisonData,
  metricConfigs
) => {
  const formatted = {};

  // Handle case where totalsData is undefined/null
  if (!totalsData) {
    Object.keys(metricConfigs).forEach((key) => {
      formatted[key] = {
        displayValue: "No Data",
        compareValue: "No data",
        isNegative: false,
      };
    });
    return formatted;
  }

  Object.entries(metricConfigs).forEach(([key, config]) => {
    formatted[key] = formatDisplayData(
      totalsData[key],
      comparisonData?.[key],
      config.valueType || "compact"
    );
  });

  return formatted;
};

/**
 * Configuration for different metric types
 * Define how each metric should be formatted
 */
export const METRIC_CONFIGS = {
  Impressions: { valueType: "number" },
  Clicks: { valueType: "number" },
  Conversions: { valueType: "number" },
  Spent: { valueType: "currency" }, // Currency - no decimal places
  Cost: { valueType: "currency" }, // Currency - no decimal places
  ctr: { valueType: "percentage" },
  conRate: { valueType: "percentage" },
  cpc: { valueType: "decimal" },
  cpl: { valueType: "decimal" },
  cpm: { valueType: "decimal" },
  cpe: { valueType: "decimal" },
  cpr: { valueType: "decimal" },
  cpa: { valueType: "decimal" },
  cpv: { valueType: "decimal" },
  viewRate: { valueType: "percentage" }, // ✅ YouTube specific
  // ✅ YouTube specific metrics
  "Video views": { valueType: "number" },
  "Watch 25% views": { valueType: "number" },
  "Watch 50% views": { valueType: "number" },
  "Watch 75% views": { valueType: "number" },
  "Watch 100% views": { valueType: "number" },
  VideoViews: { valueType: "number" }, // Alternative naming
  Watch25: { valueType: "number" }, // Alternative naming
  Watch50: { valueType: "number" }, // Alternative naming
  Watch75: { valueType: "number" }, // Alternative naming
  Watch100: { valueType: "number" }, // Alternative naming
  Engagements: { valueType: "number" },
  Reach: { valueType: "number" },
  engagementRate: { valueType: "percentage" },
  frequency: { valueType: "decimal" },
  engagements: { valueType: "number" },
};

/**
 * Table value formatter function
 * Used specifically for DataTable component
 */
export const formatTableValue = (value, metric) => {
  if (value === "No Data") return "No Data";

  const metricLower = metric.toLowerCase();

  // ✅ YouTube-enhanced percentage cases
  if (
    metricLower === "ctr" ||
    metricLower === "conrate" ||
    metricLower === "engagementrate" ||
    metricLower === "cvr" ||
    metricLower === "viewrate" // ✅ Added viewRate
  ) {
    const numValue = Number(value);
    return `${numValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }

  // Currency cases - no decimal places (only Spent and Cost)
  if (metricLower === "spent" || metricLower === "cost") {
    const numValue = Number(value);
    return Math.round(numValue).toLocaleString();
  }

  // Metrics starting with "cp" and frequency - decimal format
  if (metricLower.startsWith("cp") || metricLower === "frequency") {
    return formatDecimal(value, 2);
  }

  // ✅ YouTube-enhanced number format for impressions, clicks, reach, etc.
  if (
    metricLower === "impressions" ||
    metricLower === "clicks" ||
    metricLower === "reach" ||
    metricLower === "conversions" ||
    metricLower === "engagements" ||
    metricLower === "videoviews" ||
    metricLower === "video views" || // ✅ YouTube field name
    metricLower === "watch25" ||
    metricLower === "watch50" ||
    metricLower === "watch75" ||
    metricLower === "watch100" ||
    metricLower === "watch 25% views" || // ✅ YouTube field names
    metricLower === "watch 50% views" ||
    metricLower === "watch 75% views" ||
    metricLower === "watch 100% views"
  ) {
    const numValue = Number(value);
    return isNaN(numValue) ? "0" : numValue.toLocaleString();
  }

  // ✅ FIXED: Default case with proper comma formatting
  const numValue = Number(value);
  return isNaN(numValue) ? "0" : numValue.toLocaleString();
};
