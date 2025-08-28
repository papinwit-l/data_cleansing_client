import { SALE_CONFIG } from "@/configs/keywordConfig";

export const removeDuplicates = (items) => {
  let existingKey = [];
  return items.reduce((acc, item) => {
    const key = `${item.Message}-${item.Account}-${item.Platform}`;
    if (!existingKey.includes(key)) {
      existingKey.push(key);
      acc.push(item);
    }
    return acc;
  }, []);
};

export const processMessages = (messages) => {
  const messageList = messages.split("\n").filter((msg) => msg.trim());

  const results = messageList.map((message, index) => {
    const { isSales, score, features } = classifyMessage(message);
    return {
      index,
      message:
        message.length > 100 ? message.substring(0, 100) + "..." : message,
      fullMessage: message,
      isSales,
      confidenceScore: score,
      features,
    };
  });

  const salesCount = results.filter((r) => r.isSales).length;
  const analysis = {
    totalMessages: messageList.length,
    salesMessages: salesCount,
    nonSalesMessages: messageList.length - salesCount,
    salesPercentage:
      Math.round((salesCount / messageList.length) * 100 * 100) / 100,
  };

  // Create cleaned data (non-sales messages)
  const cleaned = results.filter((r) => !r.isSales).map((r) => r.fullMessage);

  const removed = results
    .filter((r) => r.isSales)
    .map((r) => ({
      message: r.fullMessage,
      confidenceScore: r.confidenceScore,
    }));

  return { results, analysis, cleaned, removed };
};

const classifyMessage = (text, thresholdValue = SALE_CONFIG.thresold) => {
  const features = extractFeatures(text);

  let score = 0;

  // Keyword score (primary indicator)
  score += features.keywordScore;

  // Price mentions
  if (features.hasPrice) score += 2;

  // URL presence
  if (features.hasUrl) score += 1.5;

  // E-commerce platform URLs (strong indicator)
  if (features.hasEcommerceUrl) score += 3;

  // Excessive emojis
  if (features.emojiCount > 3) score += 2;
  else if (features.emojiCount > 1) score += 1;

  // Sales hashtags
  score += features.hashtagScore;

  // Contact info
  if (features.hasContactInfo) score += 1.5;

  // Urgency indicators
  score += features.urgencyIndicators * 0.5;

  // Length penalty for very short messages
  if (features.length < 50) score *= 0.8;

  const isSales = score >= thresholdValue;

  return { isSales, score: Math.round(score * 100) / 100, features };
};

const extractFeatures = (text) => {
  const features = {
    keywordScore: 0,
    hasPrice: false,
    hasUrl: false,
    emojiCount: 0,
    hashtagScore: 0,
    hasContactInfo: false,
    urgencyIndicators: 0,
    length: text.length,
    hasEcommerceUrl: false,
  };

  const textLower = text.toLowerCase();

  // Keyword scoring
  Object.entries(SALE_CONFIG.keywords).forEach(([keyword, weight]) => {
    if (textLower.includes(keyword)) {
      features.keywordScore += weight;
    }
  });

  // Price indicators
  features.hasPrice = /\d+\.-|\d+บาท|\d+%/.test(text);

  // URL detection
  features.hasUrl = /https?:\/\/\S+/.test(text);

  // E-commerce platform detection (high weight for sales)
  features.hasEcommerceUrl = /shopee|lazada|amazon|alibaba/.test(textLower);

  // Emoji count
  const emojiMatches = text.match(SALE_CONFIG.emojiPattern);
  features.emojiCount = emojiMatches ? emojiMatches.length : 0;

  // Hashtag analysis
  SALE_CONFIG.salesHashtagPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      features.hashtagScore += 2;
    }
  });

  // Contact information detection
  const contactPatterns = SALE_CONFIG.contactPatterns;
  features.hasContactInfo = contactPatterns.some((pattern) =>
    textLower.includes(pattern)
  );

  // Urgency indicators
  const urgencyWords = SALE_CONFIG.urgencyWords;
  features.urgencyIndicators = urgencyWords.filter((word) =>
    textLower.includes(word)
  ).length;

  return features;
};

// Prepare data for export - convert objects to arrays with consistent order
export const prepareDataForExport = (rawData) => {
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
