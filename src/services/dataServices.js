// services/dataServices.js - Updated to use centralized axios config

const EXAMPLE_DATA = [
  {
    Account: "Suchanuch Rairiang",
    Message:
      "แชร์ 5 สกินแคร์ที่ต้องใช้หลังจากการกดสิว การดูแลผิวหลังจากการกดสิวเป็นสิ่งสำคัญเพื่อช่วยให้ผิวฟื้นตัวและไม่เกิดจุดด่างดำ การกดสิวเป็นวิธีที่หลายคนเลือกใช้เพื่อจัดการกับสิวที่อาจไม่ยอมออกเอง แต่การกดสิวนั้นสามารถทำให้ผิวบอบบางและเกิดการระคายเคืองได้ ดังนั้น การเลือกใช้สกินแคร์ที่เหมาะสมหลังจากการกดสิวจึงเป็นสิ่งสำคัญมาก เพื่อให้ผิวฟื้นฟูและลดรอย บทความนี้โว้กบิวตี้ขอแนะนำ 5 สกินแคร์ที่ต้องใช้หลังจากการกดสิวมาฝาก เพื่อช่วยบำรุงผิวให้กลับมาสดใสและสุขภาพดีในระยะยาว เจลทำความสะอาดผิวหน้า CERAVE BLEMISH CONTROL CLEANSER การทำความสะอาดผิวหน้าหลังจากการกดสิวเป็นขั้นตอนแรกที่สำคัญที่สุด เจลทำความสะอาดผิวหน้าจาก CeraVe Blemish Control Cleanser จะช่วยทำความสะอาดผิวได้อย่างล้ำลึก พร้อมกับลดการอักเสบของสิวและสิ่งสกปรกที่ตกค้างในรูขุมขน ด้วยส่วนผสมของ Salicylic Acid ที่ช่วยขจัดเซลล์ผิวที่ตายแล้วและสิ่งสกปรกได้อย่างมีประสิทธิภาพ ทำให้ไม่เกิดการอุดตันในรูขุมขนและป้องกันการเกิดสิวใหม่ เจลทำความสะอาดผิวหน้า Allies of Skin Molecular Silk Amino Hydrating Cleanser อีกหนึ่งผลิตภัณฑ์ทำความสะอาดที่ให้ความชุ่มชื้นและไม่ทำร้ายผิวหลังการกดสิว Allies of Skin Molecular Silk Amino Hydrating Cleanser เจลทำความสะอาดนี้จะทำให้ผิวสะอาดหมดจดโดยไม่ทำให้ผิวแห้งหรือระคายเคือง ด้วย Silk Amino Acids ที่ช่วยฟื้นฟูและบำรุงผิวที่บอบบางให้กลับมามีความสมดุล พร้อมเสริมการปกป้องจากการสูญเสียความชุ่มชื้น เซรั่มบำรุงผิว Dr.PONG BARRIER X ULTIMATE DEFENSE SERUM หลังจากทำความสะอาดผิวหน้าแล้ว การบำรุงผิวด้วยเซรั่มที่ช่วยปกป้องและเสริมสร้างเกราะป้องกันให้กับผิวเป็นสิ่งที่ควรทำ Dr.Pong Barrier X Ultimate Defense Serum คือเซรั่มที่เน้นการปกป้องผิวจากการระคายเคืองและมลภาวะ ช่วยให้ผิวฟื้นฟูเร็วขึ้นหลังการกดสิว โดยการบำรุงด้วยส่วนผสมของ Ceramides และPeptides ที่ช่วยเสริมสร้างผิวให้แข็งแรงและกักเก็บความชุ่มชื้นได้ดีขึ้น มอยซ์เจอไรเซอร์ La Roche-Posay Effaclar DUO+M การเติมความชุ่มชื้นให้กับผิวหลังจากการกดสิวเป็นสิ่งสำคัญ เพราะการทำร้ายผิวอาจทำให้ผิวขาดน้ำและเกิดความแห้งกร้าน La Roche-Posay Effaclar DUO+M มอยซ์เจอไรเซอร์ที่ไม่เพียงแต่ช่วยให้ผิวชุ่มชื้น แต่ยังช่วยลดการอักเสบและบรรเทาความระคายเคืองที่อาจเกิดจากการกดสิว ด้วยส่วนผสมจาก Niacinamide และSalicylic Acid ที่ช่วยลดการเกิดสิวและปรับสีผิวให้สม่ำเสมอ Caudalie Vinoperfect Brightening Dark Spot Serum หลังจากการกดสิว ผิวอาจมีรอยดำหรือรอยแผลจากการอักเสบ Caudalie Vinoperfect Brightening Dark Spot Serum จะเป็นตัวช่วยฟื้นฟูผิวและลดรอยดำเหล่านั้นด้วยส่วนผสมของ Viniferine ซึ่งเป็นสารสกัดจากองุ่นที่มีประสิทธิภาพในการลดเลือนจุดด่างดำและปรับสีผิวให้สว่างกระจ่างใสอย่างเป็นธรรมชาติ นอกจากนี้ยังช่วยให้ผิวเนียนนุ่มและดูอ่อนเยาว์ WATCH",
    "Direct URL": "https://vogue.co.th/beauty/skin_care/article/acne-skincare",
    "Post URL": "https://vogue.co.th/beauty/skin_care/article/acne-skincare",
    "Comment URL": "",
    "Reply comment URL": "",
    Source: "news",
    "Post time": "2025-04-01 00:00:00",
    Engagement: "0",
    "Main keyword": "cerave",
    "Sub keyword": "-",
    "Follower count": "-",
    Sentiment: "Positive",
    Category: "Cerave",
    "Track post": "",
    "Track account": "",
    Note: "-",
    _id: "22dc58e93ee11dba09090066a06c40d3_",
    "Image labels": "-",
    "Image URL":
      "https://s3-ap-southeast-1.amazonaws.com/wisesight-images/saai/th/2025/03/31/original_web_22dc58e93ee11dba09090066a06c40d3__121213646.jpg",
    "Account label audience size": "",
    "Account label categories": "-",
    "Account label type": "",
    "Account label TSA": "-",
    "Logo recognition": "La Roche-Posay,Dr.Pong,CeraVe",
    "Scene recognition": "pharmacy,hospital room",
  },
  {
    Account: "metave_may",
    Message:
      "มาเปิดรับออเดอร์จ้า กดสั่งวันนี้ผ่านออนไลน์ขอคนรอของได้นะคะ ราคาตามภาพ ค่าส่ง40.- / ซื้อครบบิลในราคาเต็ม1000 ส่งฟรีค่ะ สนใจ ทัก DM ค่ะ (รับจำนวนจำกัดนะคะ) #เซราวีซัมเมอร์คลีนเซอร์สู้สิวหมอผิวแนะนำ #CeraVeCleanserxMeenPing #CeraVeSummerPlayland #CeraVeThailand #Area86 https://t.co/tWJmfSlukr",
    "Direct URL": "http://twitter.com/metave_may/status/1906766149205070004",
    "Post URL": "http://twitter.com/metave_may/status/1906766149205070004",
    "Comment URL": "",
    "Reply comment URL": "",
    Source: "x",
    "Post time": "2025-04-01 00:50:50",
    Engagement: "6",
    "Main keyword": "cerave,เซราวี",
    "Sub keyword": "-",
    "Follower count": "182",
    Sentiment: "Neutral",
    Category: "Cerave",
    "Track post": "",
    "Track account": "",
    Note: "-",
    _id: "1906766149205070004",
    "Image labels": "-",
    "Image URL":
      "https://s3-ap-southeast-1.amazonaws.com/wisesight-images/saai/th/2025/03/31/original_1906766149205070004_163183800.jpg",
    "Account label audience size": "",
    "Account label categories": "-",
    "Account label type": "",
    "Account label TSA": "-",
    "Logo recognition": "CeraVe",
    "Scene recognition": "pharmacy",
  },
];

import { processMessages, removeDuplicates } from "@/utils/dataProcessors";
import axiosInstance from "../configs/axiosConfigs";
import { DATA_CONFIGS } from "../configs/dataConfigs";

export const fetchDataSheet = async (id, endpoint) => {
  try {
    const response = await axiosInstance.get(`/data-sheets/${endpoint}/${id}`);
    const rawData = response.data.data;
    // const rawData = EXAMPLE_DATA;
    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    // Transform raw data to objects
    const dataObjects = dataRows.map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index]]))
    );

    // remove duplicates by message and account and platform
    const uniqueValues = removeDuplicates(dataObjects);
    // console.log("🎯 uniqueValues result:", uniqueValues);

    // remove sales messages from dataObjects
    const rawFilteredSales = [];
    const rawFilteredSalesOnly = dataObjects.filter((item, index) => {
      const messages = processMessages(item.Message);
      const { results } = messages;
      const { isSales } = results[0];
      const resultItem = { ...item, isSales };
      rawFilteredSales.push(resultItem);
      return isSales;
    });
    // console.log("🎯 rawFilteredSales result:", rawFilteredSales);

    // remove sales messages
    const filteredSales = [];
    const filteredSalesOnly = uniqueValues.filter((item) => {
      const messages = processMessages(item.Message);
      const { results } = messages;
      const { isSales } = results[0];
      const resultItem = { ...item, isSales };
      filteredSales.push(resultItem);
      return isSales;
    });
    // console.log("🎯 filteredSales result:", filteredSales);

    return {
      rawData: dataObjects,
      uniqueData: uniqueValues,
      filteredSales: rawFilteredSales,
      uniqueFilteredSales: filteredSales,
      rawFilteredSalesOnly,
      filteredSalesOnly,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Main data fetching service
/*
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
};*/

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
