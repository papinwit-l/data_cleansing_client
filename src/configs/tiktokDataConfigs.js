// tiktokDataConfigs.js

export const TIKTOK_FIELDS = [
  { key: "impressions", sourceField: "Impressions" },
  { key: "reach", sourceField: "Reach" },
  { key: "clicks", sourceField: "Clicks" },
  { key: "conversions", sourceField: "Website conversions" },
  { key: "spent", sourceField: "Spent" },
  { key: "engagements", sourceField: "Post engagements" },
  { key: "videoWatchesAt25", sourceField: "Video watches at 25%" },
  { key: "views", sourceField: "Video views" },
  {
    key: "messages",
    sourceField: "New messaging conversations within 7 days",
  },
  { key: "addToCart", sourceField: "Website adds to cart" },
  { key: "purchase", sourceField: "Website purchases" },
  {
    key: "purchaseConValue",
    sourceField: "Website purchases conversion value",
  },
  { key: "view6sec", sourceField: "6-second video views" },
];

export const TIKTOK_CALCULATED_FIELDS = [
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

export const TIKTOK_PROCESSED_FIELDS = [
  "Channel", // For filtering
  "Ad set name",
  "Impressions",
  "Reach",
  "Clicks",
  "Website conversions",
  "Spent",
  "Video watches at 25%",
  "Video views",
  "Post engagements",
  "New messaging conversations within 7 days", // Original field
  "Website adds to cart",
  "Website purchases",
  "Website purchases conversion value",
  "6-second video views",
];

export const TIKTOK_METRICS = [
  "Ad set name",
  "Ad name",
  "Impressions",
  "Reach",
  "Clicks",
  "Website conversions",
  "Spent",
  "Video watches at 25%",
  "views",
  "Post engagements",
  "Channel", // From FacebookReach & FacebookEngagement
  "New messaging conversations within 7 days", // From FacebookMessage
  "Website adds to cart",
  "Website purchases",
  "Website purchases conversion value",
  "6-second video views",
];
