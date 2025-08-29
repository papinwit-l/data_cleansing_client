// contexts/DataContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchDataSheet } from "../services/dataServices";
import axiosInstance from "../configs/axiosConfigs"; // ✅ Updated: Use centralized axios
import { processMessagesSentiment } from "@/utils/dataProcessors";

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

  const [AllData, setAllData] = useState([]);
  const [UniqueData, setUniqueData] = useState([]);
  const [FilteredSales, setFilteredSales] = useState([]);
  const [UniqueFilteredSales, setUniqueFilteredSales] = useState([]);
  const [RawFilteredSalesOnly, setRawFilteredSalesOnly] = useState([]);
  const [FilteredSalesOnly, setFilteredSalesOnly] = useState([]);
  const [UniqueDataWithSentiment, setUniqueDataWithSentiment] = useState([]);

  const [exportSheetsURL, setExportSheetsURL] = useState("");

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
      const result = await fetchDataSheet(id, "get-all-data");
      console.log("getAllData result:", result);
      const {
        rawData,
        uniqueData,
        filteredSales,
        uniqueFilteredSales,
        rawFilteredSalesOnly,
        filteredSalesOnly,
      } = result;

      // Set the state variables
      setAllData(rawData);
      setUniqueData(uniqueData);
      setFilteredSales(filteredSales);
      setUniqueFilteredSales(uniqueFilteredSales);
      setRawFilteredSalesOnly(rawFilteredSalesOnly);
      setFilteredSalesOnly(filteredSalesOnly);

      // Process sentiment for unique data with no sales messages
      const uniqueDataWithSentiment =
        processMessagesSentiment(uniqueFilteredSales);
      setUniqueDataWithSentiment(uniqueDataWithSentiment);

      // Export to sheets using fresh data
      const exportData = { ...result, uniqueDataWithSentiment };
      await exportToSheets(exportData);
    } catch (error) {
      console.error("Error fetching all data:", error);
      throw error;
    }
  };

  const exportToSheets = async (dataResult) => {
    try {
      if (!dataResult?.rawData || dataResult.rawData.length === 0) {
        throw new Error("No raw data available for export");
      }

      const headers = Object.keys(dataResult.rawData[0]);

      // Create main sheet
      const payload = {
        title: "Social Media Monitoring Report",
        tableData: dataResult.rawData,
        headers: headers,
        sheetName: "RAW_DATA",
      };

      const response = await axiosInstance.post(
        "/data-sheets/create-sheet-with-table",
        payload
      );

      const spreadsheetId = response.data.spreadsheetId;

      // Add other sheets
      // finding sheets to add to the spreadsheet
      const remainingSheets = Object.keys(dataResult).filter(
        (key) => key !== "rawData"
      );

      const additionalSheets = remainingSheets.map((sheetName) => {
        return {
          data: dataResult[sheetName],
          name: sheetName,
        };
      });

      // const additionalSheets = [
      //   { data: dataResult.uniqueData, name: "UNIQUE_DATA" },
      //   { data: dataResult.filteredSales, name: "FILTERED_SALES" },
      //   { data: dataResult.uniqueFilteredSales, name: "UNIQUE_FILTERED_SALES" },
      //   {
      //     data: dataResult.rawFilteredSalesOnly,
      //     name: "RAW_FILTERED_SALES_ONLY",
      //   },
      //   { data: dataResult.filteredSalesOnly, name: "FILTERED_SALES_ONLY" },
      // ];

      for (const sheet of additionalSheets) {
        if (sheet.data && sheet.data.length > 0) {
          await handleAddSheetTab(spreadsheetId, sheet.data, sheet.name);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setExportSheetsURL(response.data.spreadsheetUrl);
      window.open(response.data.spreadsheetUrl, "_blank");
    } catch (error) {
      console.error("Export error:", error);
      setError(error.response?.data?.error || error.message);
    }
  };

  const handleAddSheetTab = async (spreadsheetId, data, sheetName) => {
    const headers = Object.keys(data[0]);
    await axiosInstance.post("/data-sheets/export-data-to-existing-sheet", {
      spreadsheetId,
      data: [
        headers,
        ...data.map((item) => headers.map((header) => item[header] || "")),
      ],
      sheetName,
      startCell: "A1",
      clearExisting: true,
    });
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
    UniqueData,
    setUniqueData,
    FilteredSales,
    setFilteredSales,
    UniqueFilteredSales,
    setUniqueFilteredSales,
    RawFilteredSalesOnly,
    setRawFilteredSalesOnly,
    FilteredSalesOnly,
    setFilteredSalesOnly,
    UniqueDataWithSentiment,
    setUniqueDataWithSentiment,

    // Export to sheets
    exportSheetsURL,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
