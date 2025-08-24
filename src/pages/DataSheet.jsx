import BudgetDataTable from "@/components/charts-tables/BudgetDataTable";
import DailyPerformanceChart from "@/components/charts-tables/DailyPerformanceChart";
import PerformanceDataTable from "@/components/charts-tables/PerformanceDataTable";
import PerformancePieChart from "@/components/charts-tables/PerformancePieChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import React, { useEffect } from "react";

function DataSheet() {
  const [totalData, setTotalData] = React.useState({});
  const [channelData, setChannelData] = React.useState({});
  const [dailyData, setDailyData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [metrics, setMetrics] = React.useState([
    "Impressions",
    "Reach",
    "Clicks",
    "Conversions",
    "Spent",
    "Post Engagement",
    "Value",
    "Count Lead",
    "Count Walk",
    "Count Book",
  ]);
  const [budgetData, setBudgetData] = React.useState({});
  const [totalBudgetData, setTotalBudgetData] = React.useState({});
  const [budgetMetrics, setBudgetMetrics] = React.useState([
    "Conversion",
    "Budget",
    "Spent",
  ]);

  const getBudgetData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/data-sheets/overall-budget"
      );
      const rawData = response.data.data;
      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      const dataObjects = dataRows.map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, row[index]]))
      );

      const cleanedData = dataObjects.map((entry) => {
        const cleaned = { ...entry };
        for (const key of budgetMetrics) {
          cleaned[key] =
            parseFloat(cleaned[key]?.toString().replace(/,/g, "")) || 0;
        }
        return cleaned;
      });

      const { enhancedChannelData, enhancedTotals, allMetrics } =
        processBudgetData(cleanedData, budgetMetrics);

      setBudgetData(enhancedChannelData);
      setTotalBudgetData(enhancedTotals);
      setBudgetMetrics(allMetrics);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const BudgetFormatValue = (value, metric) => {
    if (metric === "SpentPercent") {
      return `${value.toFixed(2)}%`;
    }
    if (metric === "RemainingBudget") {
      return parseFloat(value.toFixed(2)).toLocaleString();
    }
    return value.toLocaleString();
  };

  const processBudgetData = (cleanedData, metrics) => {
    // Group by channel
    const summaryByChannel = cleanedData.reduce((acc, item) => {
      const channel = item.Channel || "Unknown";
      if (!acc[channel]) {
        acc[channel] = Object.fromEntries(metrics.map((m) => [m, 0]));
      }
      for (const key of metrics) {
        acc[channel][key] += item[key];
      }
      return acc;
    }, {});

    // Add calculations for each channel
    const enhancedChannelData = {};
    Object.entries(summaryByChannel).forEach(([channel, data]) => {
      const SpentPercent =
        data.Budget > 0 ? (data.Spent / data.Budget) * 100 : 0;
      const RemainingBudget = data.Budget - data.Spent;

      enhancedChannelData[channel] = {
        ...data,
        SpentPercent: SpentPercent,
        RemainingBudget: RemainingBudget,
      };
    });

    // Calculate totals
    const totals = Object.fromEntries(metrics.map((m) => [m, 0]));
    Object.values(summaryByChannel).forEach((channelValues) => {
      for (const key of metrics) {
        totals[key] += channelValues[key];
      }
    });

    // Add calculated totals
    const totalSpentPercent =
      totals.Budget > 0 ? (totals.Spent / totals.Budget) * 100 : 0;
    const totalRemainingBudget = totals.Budget - totals.Spent;

    const enhancedTotals = {
      ...totals,
      SpentPercent: totalSpentPercent,
      RemainingBudget: totalRemainingBudget,
    };

    // Update metrics to include calculated fields in desired order
    const allMetrics = [
      "Conversion",
      "Budget",
      "Spent",
      "SpentPercent",
      "RemainingBudget",
    ];

    return { enhancedChannelData, enhancedTotals, allMetrics };
  };

  const handleGetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall data
      const response = await axios.get(
        "http://localhost:8000/data-sheets/overall-data"
      );
      const rawData = response.data.data;
      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      const dataObjects = dataRows.map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, row[index]]))
      );

      const cleanedData = dataObjects.map((entry) => {
        const cleaned = { ...entry };
        for (const key of metrics) {
          cleaned[key] =
            parseFloat(cleaned[key]?.toString().replace(/,/g, "")) || 0;
        }
        // Also clean the "Updated Date" for daily processing
        cleaned["Updated Date"] = entry["Updated Date"];
        return cleaned;
      });

      // Process channel data
      const { enhancedChannelData, enhancedTotals, allMetrics } =
        processChannelData(cleanedData, metrics);

      setMetrics(allMetrics);
      setChannelData(enhancedChannelData);
      setTotalData(enhancedTotals);

      // Process daily performance data from the same dataset
      processDailyData(cleanedData);

      getBudgetData();
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const processDailyData = (cleanedData) => {
    // Group data by "Updated Date"
    const dailyGrouped = cleanedData.reduce((acc, item) => {
      const date = item["Updated Date"];
      if (!date) return acc;

      if (!acc[date]) {
        acc[date] = {
          date: date,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spent: 0,
        };
      }

      acc[date].impressions += item.Impressions || 0;
      acc[date].clicks += item.Clicks || 0;
      acc[date].conversions += item.Conversions || 0;
      acc[date].spent += item.Spent || 0;

      return acc;
    }, {});

    // Convert to array and calculate CTR
    const dailyArray = Object.values(dailyGrouped)
      .map((day) => ({
        ...day,
        ctr: day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

    setDailyData(dailyArray);
  };

  const processChannelData = (cleanedData, metrics) => {
    // Group by channel
    const summaryByChannel = cleanedData.reduce((acc, item) => {
      const channel = item.Channel || "Unknown";
      if (!acc[channel]) {
        acc[channel] = Object.fromEntries(metrics.map((m) => [m, 0]));
      }
      for (const key of metrics) {
        acc[channel][key] += item[key];
      }
      return acc;
    }, {});

    // Add calculations for each channel
    const enhancedChannelData = {};
    Object.entries(summaryByChannel).forEach(([channel, data]) => {
      const ctr =
        data.Impressions > 0 ? (data.Clicks / data.Impressions) * 100 : 0;
      const conRate =
        data.Clicks > 0 ? (data.Conversions / data.Clicks) * 100 : 0;
      const cpl = data.Conversions > 0 ? data.Spent / data.Conversions : 0;

      enhancedChannelData[channel] = {
        ...data,
        ctr,
        conRate,
        cpl,
      };
    });

    // Calculate totals
    const totals = Object.fromEntries(metrics.map((m) => [m, 0]));
    Object.values(summaryByChannel).forEach((channelValues) => {
      for (const key of metrics) {
        totals[key] += channelValues[key];
      }
    });

    // Add calculated totals
    const totalCtr =
      totals.Impressions > 0 ? (totals.Clicks / totals.Impressions) * 100 : 0;
    const totalConRate =
      totals.Clicks > 0 ? (totals.Conversions / totals.Clicks) * 100 : 0;
    const totalCpl =
      totals.Conversions > 0 ? totals.Spent / totals.Conversions : 0;

    const enhancedTotals = {
      ...totals,
      ctr: totalCtr,
      conRate: totalConRate,
      cpl: totalCpl,
    };

    // Update metrics to include calculated fields in desired order
    const allMetrics = [
      "Impressions",
      "Reach",
      "Clicks",
      "ctr",
      "Conversions",
      "conRate",
      "cpl",
      "Spent",
    ];

    return { enhancedChannelData, enhancedTotals, allMetrics };
  };

  const formatValue = (value, metric) => {
    if (metric === "ctr" || metric === "conRate") {
      return `${value.toFixed(2)}%`;
    }
    if (metric === "cpl") {
      return parseFloat(value.toFixed(2)).toLocaleString();
    }
    return value.toLocaleString();
  };

  useEffect(() => {
    handleGetData();
  }, []);

  console.log(channelData);

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-4">DATA SHEET</h1>

      {error && <p className="text-red-500">{error}</p>}

      {Object.keys(channelData).length > 0 && (
        <div className="flex flex-col gap-4">
          <PerformanceDataTable
            channelData={channelData}
            totalData={totalData}
            metrics={metrics}
            formatValue={formatValue}
          />
          <div className="flex gap-4 w-full items-center">
            <Card className="w-full pt-4 pl-4 shadow-md">
              <PerformancePieChart channelData={channelData} />
            </Card>
            <Card className="w-full pt-4 pl-4 shadow-md">
              {dailyData.length > 0 && (
                <DailyPerformanceChart dailyData={dailyData} />
              )}
            </Card>
          </div>
          <div className="mx-auto">
            <BudgetDataTable
              channelData={budgetData}
              totalData={totalBudgetData}
              metrics={budgetMetrics}
              formatValue={BudgetFormatValue}
            />
          </div>
        </div>
      )}
      <div className="mx-auto">
        <Card className="mt-4 shadow-md gap-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && (
              <div>
                <p>
                  Overall: CPL{" "}
                  <span className="font-semibold">
                    {parseFloat(totalData.cpl?.toFixed(2))?.toLocaleString()}{" "}
                    THB with{" "}
                    {parseFloat(totalData.Conversions)?.toLocaleString()}{" "}
                    conversions
                  </span>
                </p>
                <p>
                  Highest conversion channel:{" "}
                  <span className="font-semibold">
                    {(() => {
                      const top = Object.entries(channelData).sort(
                        ([, a], [, b]) => b["Conversions"] - a["Conversions"]
                      )[0];
                      return top
                        ? `${top[0]} with ${
                            top[1].Conversions
                          } conversions (${parseFloat(
                            (top[1].Conversions / totalData.Conversions) * 100
                          ).toFixed(2)}% of all conversions)`
                        : "";
                    })()}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DataSheet;
