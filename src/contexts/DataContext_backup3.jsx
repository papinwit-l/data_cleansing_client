// contexts/DataContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchDataSheet } from "../services/dataServices";
import { createStateSettersMap } from "../utils/dataUtils";
import { DEFAULT_METRICS } from "../configs/dataConfigs";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Global state
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
  const [SEMMetrics, setSEMMetrics] = useState(DEFAULT_METRICS.SEM);
  const [SEMComparison, setSEMComparison] = useState({});

  // GG Demographic Data
  const [GGDemographicData, setGGDemographicData] = useState({});
  const [GGDemographicTotals, setGGDemographicTotals] = useState({});
  const [GGDemographicMetrics, setGGDemographicMetrics] = useState(
    DEFAULT_METRICS.GGDemographic
  );

  // GDN Data
  const [GDNData, setGDNData] = useState({});
  const [GDNTotals, setGDNTotals] = useState({});
  const [GDNMetrics, setGDNMetrics] = useState(DEFAULT_METRICS.GDN);
  const [GDNComparison, setGDNComparison] = useState({});

  // Disc Data
  const [DiscData, setDiscData] = useState({});
  const [DiscTotals, setDiscTotals] = useState({});
  const [DiscMetrics, setDiscMetrics] = useState(DEFAULT_METRICS.Disc);
  const [DiscComparison, setDiscComparison] = useState({});

  // Facebook Data
  const [FacebookAudienceData, setFacebookAudienceData] = useState({});
  const [FacebookAudienceTotals, setFacebookAudienceTotals] = useState({});
  const [FacebookCreativeData, setFacebookCreativeData] = useState({});
  const [FacebookCreativeTotals, setFacebookCreativeTotals] = useState({});
  const [FacebookAudienceMetrics, setFacebookAudienceMetrics] = useState(
    DEFAULT_METRICS.FacebookAudience
  );
  const [FacebookAudienceComparison, setFacebookAudienceComparison] = useState(
    {}
  );

  // TikTok Data
  const [TikTokAudienceData, setTikTokAudienceData] = useState({});
  const [TikTokAudienceTotals, setTikTokAudienceTotals] = useState({});
  const [TikTokCreativeData, setTikTokCreativeData] = useState({});
  const [TikTokCreativeTotals, setTikTokCreativeTotals] = useState({});
  const [TikTokAudienceMetrics, setTikTokAudienceMetrics] = useState(
    DEFAULT_METRICS.TikTokAudience
  );
  const [TikTokAudienceComparison, setTikTokAudienceComparison] = useState({});

  // Instagram Data
  const [InstagramAudienceData, setInstagramAudienceData] = useState({});
  const [InstagramAudienceTotals, setInstagramAudienceTotals] = useState({});
  const [InstagramCreativeData, setInstagramCreativeData] = useState({});
  const [InstagramCreativeTotals, setInstagramCreativeTotals] = useState({});
  const [InstagramAudienceMetrics, setInstagramAudienceMetrics] = useState(
    DEFAULT_METRICS.InstagramAudience
  );
  const [InstagramAudienceComparison, setInstagramAudienceComparison] =
    useState({});

  // Create metrics map
  const metricsMap = {
    SEM: SEMMetrics,
    GGDemographic: GGDemographicMetrics,
    GDN: GDNMetrics,
    Disc: DiscMetrics,
    FacebookAudience: FacebookAudienceMetrics,
    TikTokAudience: TikTokAudienceMetrics,
    InstagramAudience: InstagramAudienceMetrics,
  };

  // Create setters map
  const settersMap = createStateSettersMap({
    setSEMData,
    setSEMTotals,
    setSEMMetrics,
    setSEMComparison,
    setGGDemographicData,
    setGGDemographicTotals,
    setGGDemographicMetrics,
    setGDNData,
    setGDNTotals,
    setGDNMetrics,
    setGDNComparison,
    setDiscData,
    setDiscTotals,
    setDiscMetrics,
    setDiscComparison,
    setFacebookAudienceData,
    setFacebookAudienceTotals,
    setFacebookCreativeData,
    setFacebookCreativeTotals,
    setFacebookAudienceMetrics,
    setFacebookAudienceComparison,
    setTikTokAudienceData,
    setTikTokAudienceTotals,
    setTikTokCreativeData,
    setTikTokCreativeTotals,
    setTikTokAudienceMetrics,
    setTikTokAudienceComparison,
    setInstagramAudienceData,
    setInstagramAudienceTotals,
    setInstagramCreativeData,
    setInstagramCreativeTotals,
    setInstagramAudienceMetrics,
    setInstagramAudienceComparison,
  });

  // Individual data fetching functions
  const getSEMData = async (id) => {
    return await fetchDataSheet("SEM", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  const getGGDemographic = async (id) => {
    return await fetchDataSheet("GGDemographic", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  const getGDNData = async (id) => {
    return await fetchDataSheet("GDN", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  const getDiscData = async (id) => {
    return await fetchDataSheet("Disc", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  const getFacebookData = async (id) => {
    return await fetchDataSheet("FacebookAudience", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  const getTikTokData = async (id) => {
    return await fetchDataSheet("TikTokAudience", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  const getInstagramData = async (id) => {
    return await fetchDataSheet("InstagramAudience", id, {
      enableDateRange,
      dateRange,
      metricsMap,
      settersMap,
    });
  };

  // Main fetch function
  const fetchData = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data types in parallel for better performance
        const promises = [
          getSEMData(id),
          getGGDemographic(id),
          getGDNData(id),
          getDiscData(id),
          getFacebookData(id),
          // getTikTokData(id),
          // getInstagramData(id),
        ];

        await Promise.all(promises);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err?.response?.data?.message ||
          "Failed to fetch data. Please try again.";
        alert(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [enableDateRange, dateRange, metricsMap]
  );

  // Fetch individual data type
  const fetchDataType = useCallback(
    async (dataType, id) => {
      try {
        setLoading(true);
        setError(null);

        const fetchFunction = {
          SEM: getSEMData,
          GGDemographic: getGGDemographic,
          GDN: getGDNData,
          Disc: getDiscData,
          FacebookAudience: getFacebookData,
          TikTokAudience: getTikTokData,
          InstagramAudience: getInstagramData,
        }[dataType];

        if (!fetchFunction) {
          throw new Error(`Unknown data type: ${dataType}`);
        }

        return await fetchFunction(id);
      } catch (err) {
        console.error(`Error fetching ${dataType} data:`, err);
        const errorMessage =
          err?.response?.data?.message ||
          `Failed to fetch ${dataType} data. Please try again.`;
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enableDateRange, dateRange, metricsMap]
  );

  const value = {
    // Global state
    loading,
    error,
    enableDateRange,
    setEnableDateRange,
    dateRange,
    setDateRange,

    // Fetch functions
    fetchData,
    fetchDataType,

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

    // Facebook
    FacebookAudienceData,
    FacebookAudienceTotals,
    FacebookCreativeData,
    FacebookCreativeTotals,
    FacebookAudienceMetrics,
    FacebookAudienceComparison,

    // TikTok
    TikTokAudienceData,
    TikTokAudienceTotals,
    TikTokCreativeData,
    TikTokCreativeTotals,
    TikTokAudienceMetrics,
    TikTokAudienceComparison,

    // Instagram
    InstagramAudienceData,
    InstagramAudienceTotals,
    InstagramCreativeData,
    InstagramCreativeTotals,
    InstagramAudienceMetrics,
    InstagramAudienceComparison,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
