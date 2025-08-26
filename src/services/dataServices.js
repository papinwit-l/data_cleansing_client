// services/dataServices.js - Updated to use centralized axios config

import axiosInstance from "../configs/axiosConfigs";
import { DATA_CONFIGS } from "../configs/dataConfigs";
import {
  processAdvertisingData,
  processSocialMediaData,
  cleanObjectData,
} from "../utils/dataProcessors";
import {
  filterDataByDateRange,
  getPreviousPeriodDates,
  calculateComparison,
} from "../utils/dataUtils";

export const fetchData = async (id, endpoint) => {
  try {
    const response = await axiosInstance.get(`/data-sheets/${endpoint}/${id}`);
    const rawData = response.data.data;
    return rawData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Main data fetching service
export const fetchDataSheet = async (dataType, id, options = {}) => {
  const {
    enableDateRange = false,
    dateRange = { from: null, to: null },
    metricsMap = {},
    settersMap = {},
    filterBy = null,
    filterValue = null,
  } = options;

  try {
    const config = DATA_CONFIGS[dataType];
    if (!config) {
      throw new Error(`Configuration for ${dataType} not found`);
    }

    // Fetch data from API using centralized axios instance
    const response = await axiosInstance.get(
      `/data-sheets/${config.endpoint}/${id}`
    );

    const rawData = response.data.data;
    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    // Transform raw data to objects
    const dataObjects = dataRows.map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index]]))
    );

    // Get metrics for processing and display
    const displayMetrics = metricsMap[dataType] || []; // For final display
    const processMetrics = config.processFields || displayMetrics; // For data cleaning

    // ✅ FIX: Use processMetrics (source field names) for cleaning
    const cleanedData = cleanObjectData(dataObjects, processMetrics);

    // For debugging
    if (config.endpoint === "taboola-data") {
      // console.log("🎯 cleanedData result:", cleanedData);
    }

    // Apply date range filtering
    let currentPeriodData = cleanedData;
    let previousPeriodData = [];
    let comparison = {};

    if (enableDateRange && dateRange.from && dateRange.to) {
      currentPeriodData = filterDataByDateRange(
        cleanedData,
        dateRange.from,
        dateRange.to
      );

      //for debugging
      if (config.endpoint === "taboola-data") {
        // console.log("🎯 currentPeriodData result:", currentPeriodData);
      }

      // Get previous period data for comparison
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

    // Process data based on processor type
    if (config.processData) {
      let currentPeriodResults;
      let previousPeriodResults;

      // Prepare filter options for processing
      const filterOptions = {};
      if (filterBy && filterValue) {
        filterOptions.filterBy = filterBy;
        filterOptions.filterValue = filterValue;
      }

      // Choose processor based on type
      if (config.processorType === "social") {
        currentPeriodResults = processSocialMediaData(
          currentPeriodData,
          processMetrics, // ✅ Use source field names for processing
          displayMetrics, // ✅ Use display field names for final result
          config.socialConfig,
          filterOptions
        );

        if (config.hasComparison && previousPeriodData.length > 0) {
          previousPeriodResults = processSocialMediaData(
            previousPeriodData,
            processMetrics, // ✅ Use source field names for processing
            displayMetrics, // ✅ Use display field names for final result
            config.socialConfig,
            filterOptions
          );
          comparison = calculateComparison(
            currentPeriodResults.enhancedTotals,
            previousPeriodResults.enhancedTotals
          );
        }
      } else if (config.processorType === "advertising") {
        const platform = dataType === "Youtube" ? "Youtube" : "default";

        currentPeriodResults = processAdvertisingData(
          currentPeriodData,
          processMetrics, // ✅ Use source field names
          displayMetrics, // ✅ Use display field names
          config.groupBy,
          platform
        );

        if (config.hasComparison && previousPeriodData.length > 0) {
          previousPeriodResults = processAdvertisingData(
            previousPeriodData,
            processMetrics, // ✅ Use source field names
            displayMetrics, // ✅ Use display field names
            config.groupBy,
            platform
          );
          comparison = calculateComparison(
            currentPeriodResults.enhancedTotals,
            previousPeriodResults.enhancedTotals
          );
        }
      }

      // for debugging
      if (dataType === "Taboola") {
        // console.log("🎯 currentPeriodResults:", currentPeriodResults);
      }

      // Update state based on processor type
      const setters = settersMap[dataType];
      if (setters) {
        if (config.processorType === "social") {
          // Social media platform state updates
          setters.setAudienceData?.(currentPeriodResults.audienceData);
          setters.setAudienceTotals?.(currentPeriodResults.audienceTotals);
          setters.setCreativeData?.(currentPeriodResults.creativeData);
          setters.setCreativeTotals?.(currentPeriodResults.creativeTotals);
          setters.setMetrics?.(currentPeriodResults.allMetrics);
          setters.setComparison?.(comparison);
        } else if (config.processorType === "advertising") {
          // Advertising platform state updates
          setters.setData?.(currentPeriodResults.enhancedFieldData);
          setters.setTotals?.(currentPeriodResults.enhancedTotals);
          setters.setMetrics?.(currentPeriodResults.allMetrics);
          setters.setComparison?.(comparison);
        }
      }

      return currentPeriodResults;
    } else {
      // For data types that don't use processing (like GGDemographic)
      const setters = settersMap[dataType];
      if (setters) {
        setters.setData?.(currentPeriodData);
      }
      return { data: currentPeriodData };
    }
  } catch (error) {
    console.error(`Error fetching ${dataType} data:`, error);
    throw error;
  }
};

// Helper function - updated to use centralized axios config
export const getFilterValues = async (dataType, id, filterField) => {
  try {
    const config = DATA_CONFIGS[dataType];
    if (!config) {
      throw new Error(`Configuration for ${dataType} not found`);
    }

    // Use centralized axios instance with relative URL
    const response = await axiosInstance.get(
      `/data-sheets/${config.endpoint}/${id}`
    );

    const rawData = response.data.data;
    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    const dataObjects = dataRows.map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index]]))
    );

    const uniqueValues = [
      ...new Set(
        dataObjects
          .map((item) => item[filterField])
          .filter((value) => value && value.toString().trim() !== "")
          .map((value) => value.toString().trim())
      ),
    ].sort();

    if (config.endpoint === "line-data") {
      console.log("🎯 getFilterValues result:", uniqueValues);
    }

    return uniqueValues;
  } catch (error) {
    console.error(`Error fetching filter values for ${dataType}:`, error);
    throw error;
  }
};
