// contexts/DataContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchDataSheet } from "../services/dataServices";
import { createStateSettersMap } from "../utils/dataUtils";
import { DEFAULT_METRICS } from "../configs/dataConfigs";
import axiosInstance from "../configs/axiosConfigs"; // ✅ Updated: Use centralized axios

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

  const [AllData, setAllData] = useState(null);

  const getFBDemographicData = async (
    id,
    filterBy = null,
    filterValue = null
  ) => {
    const result = await fetchDataSheet(
      "FBDemographic",
      id,
      buildFetchOptions(filterBy, filterValue)
    );
    // console.log("FB Demo", result);
    return result;
  };

  const getAllData = async (id) => {
    try {
      const result = await fetchData(id, "get-all-data");
      setAllData(result);
    } catch (error) {
      console.error("Error fetching all data:", error);
      throw error;
    }
  };

  // Main fetch function
  const fetchData = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data types in parallel for better performance
      const promises = [getAllData(id)];

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
  }, []);

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

    // All Data
    AllData,
    setAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
