// tiktokDataConfigs.js

export const LINE_FIELDS = [
  { key: "impressions", sourceField: "Impressions" },
  { key: "reach", sourceField: "Reach (estimated)" },
  { key: "clicks", sourceField: "Clicks" },
  { key: "conversions", sourceField: "Conversions" },
  { key: "spent", sourceField: "Spent" },
];

export const LINE_CALCULATED_FIELDS = [
  { key: "frequency", type: "frequency" },
  { key: "cpr", type: "cpr" },
  { key: "ctr", type: "ctr" },
  { key: "cpc", type: "cpc" },
  { key: "cvr", type: "cvr" },
  { key: "cpl", type: "cpl" },
  { key: "cpm", type: "cpm" },
  { key: "cpv", type: "cpv" },
  { key: "cpe", type: "cpe" },
  { key: "cpa", type: "cpa" },
  { key: "roas", type: "roas" },
  { key: "engagementRate", type: "engagementRate" },
  { key: "viewRate", type: "viewRate" },
];

export const LINE_PROCESSED_FIELDS = [
  "Channel", // For filtering
  "Ad group name",
  "Impressions",
  "Reach (estimated)",
  "Clicks",
  "Conversions",
  "Spent",
];

export const LINE_METRICS = [
  "Ad group name",
  "Ad name",
  "Impressions",
  "Reach (estimated)",
  "Clicks",
  "Conversions",
  "Spent",
];
