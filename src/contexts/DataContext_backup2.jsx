import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const DataContext = createContext();

const NON_NUMERIC_COLUMNS = [
  "Ad group name",
  "Updated Date",
  "Project",
  "Channel",
  "Gender",
  "Year & month",
  "Year & week (Mon-Sun)",
  "Date",
  "Updated Month",
  "Updated Week",
  "Updated Date",
  "Campaign name",
  "Keyword",
  "Device",
  "Ad set name",
  "Ad name",
  "Campaign objective",
  "Campaign Type",
  "Ad Format",
];

// Data type configurations
const DATA_CONFIGS = {
  SEM: {
    endpoint: "sem-data",
    processFields: [
      "Keyword",
      "Impressions",
      "Clicks",
      "ctr",
      "cpc",
      "Conversions",
      "conRate",
      "cpl",
      "Spent",
    ],
    groupBy: "Keyword",
    hasComparison: true,
    processData: true,
  },
  GGDemographic: {
    endpoint: "gg-demographic",
    processFields: [
      "Channel",
      "Conversions",
      "Campaign name",
      "Gender",
      "Device",
      "Impressions",
      "Clicks",
    ],
    groupBy: "Channel",
    hasComparison: false,
    processData: false, // This one doesn't use processData
  },
  GDN: {
    endpoint: "gdn-data",
    processFields: [
      "Ad group name",
      "Impressions",
      "Clicks",
      "ctr",
      "Conversions",
      "cpl",
      "Spent",
    ],
    groupBy: "Ad group name",
    hasComparison: true,
    processData: true,
  },
  Disc: {
    endpoint: "disc-data",
    processFields: [
      "Ad group name",
      "Impressions",
      "Clicks",
      "ctr",
      "cpc",
      "Conversions",
      "conRate",
      "cpl",
      "Spent",
    ],
    groupBy: "Ad group name",
    hasComparison: true,
    processData: true,
  },
  FacebookAudience: {
    endpoint: "facebook-data",
    processFields: [
      "Ad set name",
      "Impressions",
      "Reach",
      "Clicks",
      "ctr",
      "cpc",
      "Conversions",
      "conRate",
      "cpl",
      "Spent",
    ],
    groupBy: "Ad set name",
    hasComparison: true,
    processData: true,
  },
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [enableDateRange, setEnableDateRange] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SEM Data
  const [SEMData, setSEMData] = useState({});
  const [SEMTotals, setSEMTotals] = useState({});
  const [SEMMetrics, setSEMMetrics] = useState([
    "Keyword",
    "Impressions",
    "Clicks",
    "Conversions",
    "Spent",
  ]);
  const [SEMComparison, setSEMComparison] = useState({});

  // GG Demographic Data
  const [GGDemographicData, setGGDemographicData] = useState({});
  const [GGDemographicTotals, setGGDemographicTotals] = useState({});
  const [GGDemographicMetrics, setGGDemographicMetrics] = useState([
    "Channel",
    "Conversions",
    "Campaign name",
    "Gender",
    "Device",
    "Impressions",
    "Clicks",
  ]);

  // GDN Data
  const [GDNData, setGDNData] = useState({});
  const [GDNTotals, setGDNTotals] = useState({});
  const [GDNMetrics, setGDNMetrics] = useState([
    "Ad group name",
    "Impressions",
    "Clicks",
    "Conversions",
    "Spent",
  ]);
  const [GDNComparison, setGDNComparison] = useState({});

  // Disc Data
  const [DiscData, setDiscData] = useState({});
  const [DiscTotals, setDiscTotals] = useState({});
  const [DiscMetrics, setDiscMetrics] = useState([
    "Ad group name",
    "Impressions",
    "Clicks",
    "Conversions",
    "Spent",
  ]);
  const [DiscComparison, setDiscComparison] = useState({});

  // FacebookAudience Data
  const [FacebookAudienceData, setFacebookAudienceData] = useState({});
  const [FacebookAudienceTotals, setFacebookAudienceTotals] = useState({});
  const [FacebookAudienceMetrics, setFacebookAudienceMetrics] = useState([
    "Ad set name",
    "Impressions",
    "Reach",
    "Clicks",
    "Conversions",
    "Spent",
  ]);
  const [FacebookAudienceComparison, setFacebookAudienceComparison] = useState(
    {}
  );

  // Keep your existing helper functions
  const getDateDifference = (from, to) => {
    const fromDate = from instanceof Date ? from : new Date(from);
    const toDate = to instanceof Date ? to : new Date(to);
    return Math.abs(toDate - fromDate) / (1000 * 60 * 60 * 24);
  };

  const getPreviousPeriodDates = (from, to) => {
    const fromDate = from instanceof Date ? from : new Date(from);
    const toDate = to instanceof Date ? to : new Date(to);

    const daysDifference = getDateDifference(fromDate, toDate);

    const previousTo = new Date(fromDate);
    previousTo.setDate(previousTo.getDate() - 1);

    const previousFrom = new Date(previousTo);
    previousFrom.setDate(previousFrom.getDate() - daysDifference);

    const formatDateLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      from: formatDateLocal(previousFrom),
      to: formatDateLocal(previousTo),
    };
  };

  const filterDataByDateRange = (data, from, to) => {
    if (!from || !to) return data;

    const formatDateLocal = (date) => {
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return date;
    };

    const fromStr = formatDateLocal(from);
    const toStr = formatDateLocal(to);

    const filtered = data.filter((item) => {
      const itemDate = item["Updated Date"];
      if (!itemDate) return false;

      const itemDateStr = itemDate.toString().trim();
      return itemDateStr >= fromStr && itemDateStr <= toStr;
    });

    return filtered;
  };

  const calculateComparison = (current, previous) => {
    const comparison = {};

    Object.keys(current).forEach((key) => {
      const currentValue = current[key];
      const previousValue = previous[key] || 0;

      if (
        typeof currentValue === "number" &&
        typeof previousValue === "number"
      ) {
        if (previousValue === 0) {
          comparison[key] = currentValue > 0 ? 100 : 0;
        } else {
          const percentChange =
            ((currentValue - previousValue) / previousValue) * 100;
          comparison[key] = Number(percentChange.toFixed(2));
        }
      }
    });

    return comparison;
  };

  const processData = (
    cleanedData,
    metrics,
    finalMetrics,
    groupBy = "Keyword"
  ) => {
    if (!cleanedData || cleanedData.length === 0) {
      return {
        enhancedFieldData: {},
        enhancedTotals: Object.fromEntries(
          finalMetrics.map((m) => [m, "No Data"])
        ),
        allMetrics: finalMetrics,
      };
    }

    const summaryByField = cleanedData.reduce((acc, item) => {
      const fieldValue = item[groupBy] || "Unknown";

      if (!acc[fieldValue]) {
        acc[fieldValue] = Object.fromEntries(metrics.map((m) => [m, 0]));
      }
      for (const key of metrics) {
        acc[fieldValue][key] += item[key];
      }
      return acc;
    }, {});

    const enhancedFieldData = {};
    Object.entries(summaryByField).forEach(([fieldValue, data]) => {
      const ctr =
        data.Impressions > 0 ? (data.Clicks / data.Impressions) * 100 : 0;
      const conRate =
        data.Clicks > 0 ? (data.Conversions / data.Clicks) * 100 : 0;
      const cpl = data.Conversions > 0 ? data.Spent / data.Conversions : 0;
      const cpc = data.Clicks > 0 ? data.Spent / data.Clicks : 0;

      enhancedFieldData[fieldValue] = {
        ...data,
        ctr: Number(ctr.toFixed(2)),
        conRate: Number(conRate.toFixed(2)),
        cpl: Number(cpl.toFixed(2)),
        cpc: Number(cpc.toFixed(2)),
      };
    });

    const totals = Object.fromEntries(metrics.map((m) => [m, 0]));
    Object.values(summaryByField).forEach((fieldValues) => {
      for (const key of metrics) {
        totals[key] += fieldValues[key];
      }
    });

    const totalCtr =
      totals.Impressions > 0 ? (totals.Clicks / totals.Impressions) * 100 : 0;
    const totalConRate =
      totals.Clicks > 0 ? (totals.Conversions / totals.Clicks) * 100 : 0;
    const totalCpl =
      totals.Conversions > 0 ? totals.Spent / totals.Conversions : 0;
    const totalCpc = totals.Clicks > 0 ? totals.Spent / totals.Clicks : 0;

    const enhancedTotals = {
      ...totals,
      ctr: Number(totalCtr.toFixed(2)),
      conRate: Number(totalConRate.toFixed(2)),
      cpl: Number(totalCpl.toFixed(2)),
      cpc: Number(totalCpc.toFixed(2)),
    };

    return {
      enhancedFieldData,
      enhancedTotals,
      allMetrics: finalMetrics,
    };
  };

  const cleanObjectData = (object, metrics) => {
    return object.map((entry) => {
      const cleaned = { ...entry };

      for (const key of metrics) {
        if (NON_NUMERIC_COLUMNS.includes(key)) continue;
        cleaned[key] =
          parseFloat(cleaned[key]?.toString().replace(/,/g, "")) || 0;
      }

      Object.keys(cleaned).forEach((key) => {
        if (!metrics.includes(key) && key !== "Updated Date") {
          if (cleaned[key] && typeof cleaned[key] === "string") {
            cleaned[key] = cleaned[key].trim();
          } else if (cleaned[key]) {
            cleaned[key] = cleaned[key].toString().trim();
          }
        }
      });

      cleaned["Updated Date"] = entry["Updated Date"];

      return cleaned;
    });
  };

  // Generic data fetching function
  const fetchDataSheet = async (dataType, id) => {
    try {
      const config = DATA_CONFIGS[dataType];
      const response = await axios.get(
        `http://localhost:8000/data-sheets/${config.endpoint}/${id}`
      );

      const rawData = response.data.data;
      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      const dataObjects = dataRows.map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, row[index]]))
      );

      // Get the metrics for this data type
      const metrics = eval(`${dataType}Metrics`);
      const cleanedData = cleanObjectData(dataObjects, metrics);

      let currentPeriodData = cleanedData;
      let previousPeriodData = [];
      let comparison = {};

      // Apply date range filtering if enabled
      if (enableDateRange && dateRange.from && dateRange.to) {
        currentPeriodData = filterDataByDateRange(
          cleanedData,
          dateRange.from,
          dateRange.to
        );

        // Get previous period data for comparison if this data type supports it
        if (config.hasComparison) {
          const previousPeriodDates = getPreviousPeriodDates(
            dateRange.from,
            dateRange.to
          );

          previousPeriodData = filterDataByDateRange(
            cleanedData,
            previousPeriodDates.from,
            previousPeriodDates.to
          );
        }
      }

      // Handle data processing based on configuration
      if (config.processData) {
        const currentPeriodResults = processData(
          currentPeriodData,
          metrics,
          config.processFields,
          config.groupBy
        );

        // Process previous period data if applicable
        if (
          config.hasComparison &&
          enableDateRange &&
          dateRange.from &&
          dateRange.to &&
          previousPeriodData.length > 0
        ) {
          const previousPeriodResults = processData(
            previousPeriodData,
            metrics,
            config.processFields,
            config.groupBy
          );

          comparison = calculateComparison(
            currentPeriodResults.enhancedTotals,
            previousPeriodResults.enhancedTotals
          );
        }

        // Update state using dynamic setters
        eval(`set${dataType}Data`)(currentPeriodResults.enhancedFieldData);
        eval(`set${dataType}Totals`)(currentPeriodResults.enhancedTotals);
        eval(`set${dataType}Metrics`)(currentPeriodResults.allMetrics);

        if (config.hasComparison) {
          eval(`set${dataType}Comparison`)(comparison);
        }
      } else {
        // For data types that don't use processData (like GGDemographic)
        eval(`set${dataType}Data`)(currentPeriodData);
      }
    } catch (error) {
      console.error(`Error fetching ${dataType} data:`, error);
    }
  };

  // Individual data fetching functions
  const getSEMData = async (id) => await fetchDataSheet("SEM", id);
  const getGGDemographic = async (id) =>
    await fetchDataSheet("GGDemographic", id);
  const getGDNData = async (id) => await fetchDataSheet("GDN", id);
  const getDiscData = async (id) => await fetchDataSheet("Disc", id);
  const getFacebookAudienceData = async (id) =>
    await fetchDataSheet("FacebookAudience", id);

  const fetchData = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data types
        await getSEMData(id);
        await getGGDemographic(id);
        await getGDNData(id);
        await getDiscData(id);
        await getFacebookAudienceData(id);
      } catch (err) {
        console.error(err);
        const ErrMsg = err?.response?.data?.message;
        alert(ErrMsg || "Failed to fetch data. Please try again.");
        setError(ErrMsg || "Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      enableDateRange,
      dateRange,
      SEMMetrics,
      GGDemographicMetrics,
      GDNMetrics,
      DiscMetrics,
      FacebookAudienceMetrics,
    ]
  );

  const value = {
    loading,
    error,
    fetchData,
    // SEM
    SEMData,
    SEMTotals,
    SEMMetrics,
    SEMComparison,
    // GG Demographic
    GGDemographicData,
    GGDemographicTotals,
    GGDemographicMetrics,
    // GDN
    GDNData,
    GDNTotals,
    GDNMetrics,
    GDNComparison,
    // Disc
    DiscData,
    DiscTotals,
    DiscMetrics,
    DiscComparison,
    // FacebookAudience
    FacebookAudienceData,
    FacebookAudienceTotals,
    FacebookAudienceMetrics,
    FacebookAudienceComparison,
    // Date range
    dateRange,
    setDateRange,
    enableDateRange,
    setEnableDateRange,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
