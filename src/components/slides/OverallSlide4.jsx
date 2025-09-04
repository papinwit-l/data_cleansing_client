// OverallSlide4.jsx

import { useData } from "@/contexts/DataContext";
import { prepareData } from "@/utils/slideDataPrepare";
import React, { useMemo } from "react";
import HorizontalBrandChart from "../charts-tables/HorizontalBrandChart";
import { Card } from "../ui/card";

const SlideHeader = ({ title }) => (
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
  </div>
);

function OverallSlide4() {
  const { loading, error, refetch, AllData, UniqueDataWithSentiment } =
    useData();

  function processBrandData(chartData) {
    // Create a map to aggregate individual brand values
    const brandMap = new Map();

    chartData.forEach((item) => {
      const brands = item.name.split(",").map((brand) => brand.trim());
      const valuePerBrand = item.value / brands.length; // Distribute value across brands

      brands.forEach((brand) => {
        if (brandMap.has(brand)) {
          brandMap.set(brand, brandMap.get(brand) + valuePerBrand);
        } else {
          brandMap.set(brand, valuePerBrand);
        }
      });
    });

    // Convert map to array format expected by HorizontalBrandChart
    return Array.from(brandMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value), // Round to nearest integer
    }));
  }

  const { isDataAvailable, chartData } = useMemo(() => {
    try {
      if (!AllData || AllData.length === 0) {
        return {
          chartData: {},
          isDataAvailable: false,
        };
      }

      const preparedData = prepareData(AllData);
      // console.log("preparedData", preparedData);
      const { groupedByCategory, categoryData } = preparedData;
      // console.log("categoryData", categoryData);

      const combinationData = categoryData.map((item) => ({
        name: item.category,
        value: item.categoryData.length,
      }));
      console.log("combinationData", combinationData);

      const individualData = processBrandData(combinationData);
      console.log("individualData", individualData);

      return {
        chartData: { combinationData, individualData },
        isDataAvailable: true,
      };
    } catch (error) {
      console.error("Error processing data:", error);
      return {
        chartData: {},
        isDataAvailable: false,
      };
    }
  }, [AllData, UniqueDataWithSentiment]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isDataAvailable) {
    return (
      <div className="flex flex-col py-7 px-10 border w-full max-w-7xl h-[720px] gap-4 items-center justify-center">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div id="overall-slide-4" className="w-[1280px] h-[720px]">
      <div className="flex flex-col w-full h-full bg-white border">
        {/* Header */}
        <div className="px-8 py-4 border-b">
          <SlideHeader title={"Overall 4"} />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Brand Performance Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* CHART */}
            {chartData && chartData.combinationData.length > 0 && (
              <Card className="py-2 px-4">
                <HorizontalBrandChart
                  data={chartData.combinationData}
                  title="Brand Combination Performance"
                />
              </Card>
            )}
            {/* CHART */}
            {chartData && chartData.individualData.length > 0 && (
              <Card className="py-2 px-4">
                <HorizontalBrandChart
                  data={chartData.individualData}
                  title="Individual Brand Performance"
                />
              </Card>
            )}
          </div>
          {/* Summary */}
          <Card className="py-4 px-4 mt-4 gap-0">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Summary</h3>
            <p className="indent-8">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci
              blanditiis magnam sunt, amet obcaecati nemo non inventore iste
              molestias laudantium nostrum, omnis quaerat. Vero nobis expedita
              illo reiciendis tempore in?
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OverallSlide4;
