// utils/dataProcessors.js - Clean version without debug logs
import { NON_NUMERIC_COLUMNS } from "../configs/dataConfigs";

// Enhanced processor for advertising platforms (SEM, GDN, Disc, Youtube)
export const processAdvertisingData = (
  cleanedData,
  metrics,
  finalMetrics,
  groupBy = "Keyword",
  platform = "default"
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

  // Group by the specified field
  const summaryByField = cleanedData.reduce((acc, item) => {
    const fieldValue = item[groupBy] || "Unknown";

    if (!acc[fieldValue]) {
      // Initialize all metrics
      acc[fieldValue] = Object.fromEntries(metrics.map((m) => [m, 0]));

      // Initialize non-numeric fields
      NON_NUMERIC_COLUMNS.forEach((field) => {
        if (metrics.includes(field)) {
          acc[fieldValue][field] = "";
        }
      });
    }

    for (const key of metrics) {
      if (NON_NUMERIC_COLUMNS.includes(key)) {
        // Handle non-numeric fields - store the value directly
        if (
          item[key] &&
          (!acc[fieldValue][key] || acc[fieldValue][key] === "")
        ) {
          acc[fieldValue][key] = item[key];
        }
      } else {
        // Handle numeric fields - sum them up
        const numValue = Number(item[key]) || 0;
        acc[fieldValue][key] += numValue;
      }
    }

    return acc;
  }, {});

  if (groupBy === "Updated Date") {
    // console.log("🎯 summaryByField:", summaryByField);
  }

  // Add calculations for each field value
  const enhancedFieldData = {};
  Object.entries(summaryByField).forEach(([fieldValue, data]) => {
    const enhanced = { ...data };

    // Standard calculations
    const ctr =
      data.Impressions > 0 ? (data.Clicks / data.Impressions) * 100 : 0;
    const conRate =
      data.Clicks > 0 ? (data.Conversions / data.Clicks) * 100 : 0;

    // Use appropriate cost field based on platform
    const costField =
      platform === "Youtube" ? data.Spent || 0 : data.Spent || 0;

    const cpl = data.Conversions > 0 ? costField / data.Conversions : 0;
    const cpc = data.Clicks > 0 ? costField / data.Clicks : 0;
    const cpm =
      data.Impressions > 0 ? (costField * 1000) / data.Impressions : 0;
    const cpa = data.Conversions > 0 ? costField / data.Conversions : 0;
    const cpe = data.Engagements > 0 ? costField / data.Engagements : 0;
    const engagementRate =
      data.Reach > 0 ? (data.Engagements / data.Reach) * 100 : 0;

    // YouTube-specific calculations
    let cpv = 0;
    let viewRate = 0;

    if (platform === "Youtube") {
      // CPV calculation using "Video views" field
      const videoViews = data["Video views"] || 0;
      cpv = videoViews > 0 ? costField / videoViews : 0;

      // View Rate calculation (Video views / Impressions * 100)
      viewRate =
        data.Impressions > 0 ? (videoViews / data.Impressions) * 100 : 0;
    } else {
      // For other platforms, use VideoViews if available
      cpv = data.VideoViews > 0 ? costField / data.VideoViews : 0;
    }

    // Add all calculated metrics
    enhanced.ctr = Number(ctr.toFixed(2));
    enhanced.conRate = Number(conRate.toFixed(2));
    enhanced.cpl = Number(cpl.toFixed(2));
    enhanced.cpc = Number(cpc.toFixed(2));
    enhanced.cpm = Number(cpm.toFixed(2));
    enhanced.cpv = Number(cpv.toFixed(2));
    enhanced.cpe = Number(cpe.toFixed(2));
    enhanced.cpa = Number(cpa.toFixed(2));
    enhanced.engagementRate = Number(engagementRate.toFixed(2));

    // Add viewRate for YouTube
    if (platform === "Youtube") {
      enhanced.viewRate = Number(viewRate.toFixed(2));
    }

    enhancedFieldData[fieldValue] = enhanced;
  });

  // Calculate totals
  const totals = Object.fromEntries(metrics.map((m) => [m, 0]));
  Object.values(summaryByField).forEach((fieldValues) => {
    for (const key of metrics) {
      totals[key] += fieldValues[key];
    }
  });

  // Add calculated totals
  const totalCtr =
    totals.Impressions > 0 ? (totals.Clicks / totals.Impressions) * 100 : 0;
  const totalConRate =
    totals.Clicks > 0 ? (totals.Conversions / totals.Clicks) * 100 : 0;

  // Use appropriate cost field for totals
  const totalCostField =
    platform === "Youtube" ? totals.Spent || 0 : totals.Spent || 0;

  const totalCpl =
    totals.Conversions > 0 ? totalCostField / totals.Conversions : 0;
  const totalCpc = totals.Clicks > 0 ? totalCostField / totals.Clicks : 0;
  const totalCpm =
    totals.Impressions > 0 ? (totalCostField * 1000) / totals.Impressions : 0;
  const totalCpe =
    totals.Engagements > 0 ? totalCostField / totals.Engagements : 0;
  const totalCpa =
    totals.Conversions > 0 ? totalCostField / totals.Conversions : 0;
  const totalEngagementRate =
    totals.Reach > 0 ? (totals.Engagements / totals.Reach) * 100 : 0;

  // YouTube-specific total calculations
  let totalCpv = 0;
  let totalViewRate = 0;

  if (platform === "Youtube") {
    const totalVideoViews = totals["Video views"] || 0;
    totalCpv = totalVideoViews > 0 ? totalCostField / totalVideoViews : 0;
    totalViewRate =
      totals.Impressions > 0 ? (totalVideoViews / totals.Impressions) * 100 : 0;
  } else {
    totalCpv = totals.VideoViews > 0 ? totalCostField / totals.VideoViews : 0;
  }

  const enhancedTotals = {
    ...totals,
    ctr: Number(totalCtr.toFixed(2)),
    conRate: Number(totalConRate.toFixed(2)),
    cpl: Number(totalCpl.toFixed(2)),
    cpc: Number(totalCpc.toFixed(2)),
    cpm: Number(totalCpm.toFixed(2)),
    cpv: Number(totalCpv.toFixed(2)),
    cpe: Number(totalCpe.toFixed(2)),
    cpa: Number(totalCpa.toFixed(2)),
    engagementRate: Number(totalEngagementRate.toFixed(2)),
  };

  // Add viewRate for YouTube totals
  if (platform === "Youtube") {
    enhancedTotals.viewRate = Number(totalViewRate.toFixed(2));
  }

  return {
    enhancedFieldData,
    enhancedTotals,
    allMetrics: finalMetrics,
  };
};

// Helper function to calculate enhanced metrics for social media
const calculateEnhancedMetrics = (data, calculatedFields) => {
  const enhanced = {};

  calculatedFields.forEach((field) => {
    switch (field.type) {
      case "cpv":
        // Ensure both values are properly converted to numbers
        let views = data.views;
        let cost = data.spent;

        // Convert views to number if it's a string
        if (typeof views === "string") {
          // Remove leading zeros and convert to number
          views = parseFloat(views.replace(/^0+/, "") || "0") || 0;
        } else {
          views = Number(views) || 0;
        }

        // Ensure cost is a number
        cost = Number(cost) || 0;

        const cpvResult = views > 0 ? Number((cost / views).toFixed(6)) : 0;
        enhanced[field.key] = cpvResult;
        break;

      case "frequency":
        enhanced[field.key] =
          data.impressions > 0 && data.reach > 0
            ? Number((data.impressions / data.reach).toFixed(2))
            : 0;
        break;

      case "ctr":
        enhanced[field.key] =
          data.impressions > 0
            ? Number(((data.clicks / data.impressions) * 100).toFixed(2))
            : 0;
        break;

      case "cpc":
        enhanced[field.key] =
          data.clicks > 0 ? Number((data.spent / data.clicks).toFixed(2)) : 0;
        break;

      case "cvr":
        enhanced[field.key] =
          data.clicks > 0
            ? Number(((data.conversions / data.clicks) * 100).toFixed(2))
            : 0;
        break;

      case "cpa":
        enhanced[field.key] =
          data.conversions > 0
            ? Number((data.spent / data.conversions).toFixed(2))
            : 0;
        break;

      case "cpr":
        enhanced[field.key] =
          data.reach > 0
            ? Number(((data.spent * 1000) / data.reach).toFixed(2))
            : 0;
        break;

      case "cpl":
        enhanced[field.key] =
          data.conversions > 0
            ? Number((data.spent / data.conversions).toFixed(2))
            : 0;
        break;

      case "cpm":
        enhanced[field.key] =
          data.impressions > 0
            ? Number(((data.spent * 1000) / data.impressions).toFixed(2))
            : 0;
        break;

      case "cpe":
        enhanced[field.key] =
          data.engagements > 0
            ? Number((data.spent / data.engagements).toFixed(2))
            : 0;
        break;

      case "engagementRate":
        enhanced[field.key] =
          data.reach > 0
            ? Number(((data.engagements / data.reach) * 100).toFixed(2))
            : 0;
        break;

      case "viewRate":
        enhanced[field.key] =
          data.impressions > 0
            ? Number(((data.views / data.impressions) * 100).toFixed(2))
            : 0;
        break;

      case "roas":
        // ROAS = Website purchases conversion value / cost
        enhanced[field.key] =
          data.spent > 0
            ? Number((data.purchaseConValue / data.spent).toFixed(2))
            : 0;
        break;

      case "custom":
        enhanced[field.key] = field.calculate(data);
        break;
    }
  });

  return enhanced;
};

// Helper function to filter data by specific field and value
const filterDataByField = (data, filterBy, filterValue) => {
  if (!filterBy || !filterValue) return data;

  return data.filter((item) => {
    const itemValue = item[filterBy];
    return (
      itemValue &&
      itemValue.toString().toLowerCase() === filterValue.toLowerCase()
    );
  });
};

// Universal processor for social media platforms
export const processSocialMediaData = (
  cleanedData,
  metrics,
  finalMetrics,
  config,
  filterOptions = {}
) => {
  if (!cleanedData || cleanedData.length === 0) {
    return {
      enhancedFieldData: {},
      enhancedTotals: Object.fromEntries(
        finalMetrics.map((m) => [m, "No Data"])
      ),
      allMetrics: finalMetrics,
      audienceData: {},
      creativeData: {},
    };
  }

  // Apply filtering if specified
  let processedData = cleanedData;
  if (filterOptions.filterBy && filterOptions.filterValue) {
    processedData = filterDataByField(
      cleanedData,
      filterOptions.filterBy,
      filterOptions.filterValue
    );
  }

  // Process data for Performance by Audiences table
  const audienceData = processedData.reduce((acc, item) => {
    const audienceKey = item[config.audienceGroupBy] || "Unknown";

    if (!acc[audienceKey]) {
      acc[audienceKey] = {};
      config.fields.forEach((field) => {
        acc[audienceKey][field.key] = 0;
      });
    }

    config.fields.forEach((field) => {
      const sourceValue = item[field.sourceField];
      acc[audienceKey][field.key] += sourceValue || 0;
    });

    return acc;
  }, {});

  // Process data for Performance by Creatives table
  const creativeData = processedData.reduce((acc, item) => {
    const creativeKey = item[config.creativeGroupBy] || "Unknown";

    if (!acc[creativeKey]) {
      acc[creativeKey] = {};
      config.fields.forEach((field) => {
        acc[creativeKey][field.key] = 0;
      });
    }

    config.fields.forEach((field) => {
      acc[creativeKey][field.key] += item[field.sourceField] || 0;
    });

    return acc;
  }, {});

  // Calculate enhanced metrics for audience data
  const enhancedAudienceData = {};
  Object.entries(audienceData).forEach(([key, data]) => {
    enhancedAudienceData[key] = {
      ...data,
      ...calculateEnhancedMetrics(data, config.calculatedFields),
    };
  });

  // Calculate enhanced metrics for creative data
  const enhancedCreativeData = {};
  Object.entries(creativeData).forEach(([key, data]) => {
    enhancedCreativeData[key] = {
      ...data,
      ...calculateEnhancedMetrics(data, config.calculatedFields),
    };
  });

  // Calculate totals for audience data
  const audienceTotals = Object.values(audienceData).reduce((acc, item) => {
    config.fields.forEach((field) => {
      acc[field.key] = (acc[field.key] || 0) + item[field.key];
    });
    return acc;
  }, {});

  const enhancedAudienceTotals = {
    ...audienceTotals,
    ...calculateEnhancedMetrics(audienceTotals, config.calculatedFields),
  };

  // Calculate totals for creative data
  const creativeTotals = Object.values(creativeData).reduce((acc, item) => {
    config.fields.forEach((field) => {
      acc[field.key] = (acc[field.key] || 0) + item[field.key];
    });
    return acc;
  }, {});

  const enhancedCreativeTotals = {
    ...creativeTotals,
    ...calculateEnhancedMetrics(creativeTotals, config.calculatedFields),
  };

  return {
    enhancedFieldData: enhancedAudienceData,
    enhancedTotals: enhancedAudienceTotals,
    allMetrics: finalMetrics,
    audienceData: enhancedAudienceData,
    audienceTotals: enhancedAudienceTotals,
    creativeData: enhancedCreativeData,
    creativeTotals: enhancedCreativeTotals,
  };
};

// Data cleaning utility
export const cleanObjectData = (object, metrics) => {
  return object.map((entry) => {
    const cleaned = { ...entry };

    // Clean numeric fields
    for (const key of metrics) {
      if (NON_NUMERIC_COLUMNS.includes(key)) continue;

      let value = cleaned[key];

      // Convert to string first, handle null/undefined
      if (value === null || value === undefined) {
        value = "0";
      } else {
        value = value.toString().replace(/,/g, "");
      }

      // Remove leading zeros for problematic fields
      if (typeof value === "string" && value.match(/^0+\d/)) {
        value = value.replace(/^0+/, "") || "0";
      }

      // Parse to number
      const numericValue = parseFloat(value) || 0;
      cleaned[key] = numericValue;
    }

    // Clean all text fields that could be used for grouping
    Object.keys(cleaned).forEach((key) => {
      if (!metrics.includes(key) && key !== "Updated Date") {
        if (cleaned[key] && typeof cleaned[key] === "string") {
          cleaned[key] = cleaned[key].trim();
        } else if (cleaned[key]) {
          cleaned[key] = cleaned[key].toString().trim();
        }
      }
    });

    // Keep the Updated Date as is
    cleaned["Updated Date"] = entry["Updated Date"];

    return cleaned;
  });
};
