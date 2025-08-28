// Prepare data for export - convert objects to arrays with consistent order
const prepareDataForExport = (rawData) => {
  if (!rawData || rawData.length === 0) return { headers: [], rows: [] };

  // Get all unique keys from all objects to create comprehensive headers
  const allKeys = new Set();
  rawData.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach((key) => allKeys.add(key));
    }
  });

  const headers = Array.from(allKeys);

  // Convert each row to array maintaining header order
  const rows = rawData.map((item) => {
    if (typeof item === "object" && item !== null) {
      return headers.map((header) => {
        const value = item[header];
        return value !== undefined && value !== null ? String(value) : "";
      });
    }
    return Array.isArray(item) ? item.map((v) => String(v)) : [String(item)];
  });

  return { headers, rows };
};

const exportToSheets = async () => {
  setIsExporting(true);
  setExportStatus({ type: "info", message: "Preparing data for export..." });

  try {
    const { headers, rows } = prepareDataForExport(actualData);

    // Prepare payload based on export options
    const payload = {
      title: exportOptions.sheetTitle || "Exported Data",
      sheetName: exportOptions.sheetName || "Sheet1",
    };

    if (exportOptions.createNew) {
      // Create new sheet
      const tableData = rows;
      payload.tableData = tableData;

      if (exportOptions.includeHeaders) {
        payload.headers = headers;
      }

      setExportStatus({
        type: "info",
        message: "Creating new Google Sheet...",
      });

      const response = await fetch("/api/data-sheets/create-sheet-with-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setExportStatus({
        type: "success",
        message: "Export successful!",
        url: result.spreadsheetUrl,
        details: `Created sheet with ${result.totalRows} rows`,
      });
    } else {
      // Export to existing sheet
      if (!exportOptions.existingSheetId.trim()) {
        throw new Error("Please provide an existing sheet ID");
      }

      const exportData = exportOptions.includeHeaders
        ? [headers, ...rows]
        : rows;

      payload.spreadsheetId = exportOptions.existingSheetId.trim();
      payload.data = exportData;
      payload.clearExisting = true;

      setExportStatus({
        type: "info",
        message: "Exporting to existing sheet...",
      });

      const response = await fetch(
        "/api/data-sheets/export-to-existing-sheet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setExportStatus({
        type: "success",
        message: "Export successful!",
        url: result.spreadsheetUrl,
        details: `Exported ${result.rowsInserted} rows`,
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    setExportStatus({
      type: "error",
      message: "Export failed",
      details: error.message,
    });
  } finally {
    setIsExporting(false);
  }
};

const resetStatus = () => {
  setExportStatus(null);
};
