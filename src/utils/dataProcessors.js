import { SALE_CONFIG, SENTIMENT_CONFIG } from "@/configs/keywordConfig";

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

export const processMessagesSentiment = (data) => {
  const dataWithSentiment = data.map((item) => {
    const sentiment = analyzeSentiment(item.Message);
    return { ...item, "New Sentiment": sentiment };
  });

  return dataWithSentiment;
};

const analyzeSentiment = (text) => {
  if (!text.trim()) return null;

  // Normalize text for analysis
  const normalizedText = text.toLowerCase();

  // Define sentiment keywords for Thai
  const positiveKeywords = SENTIMENT_CONFIG.positiveKeywords;
  const negativeKeywords = SENTIMENT_CONFIG.negativeKeywords;
  const neutralKeywords = SENTIMENT_CONFIG.neutralKeywords;

  // Count keyword occurrences
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;

  positiveKeywords.forEach((keyword) => {
    const regex = new RegExp(keyword, "gi");
    const matches = normalizedText.match(regex);
    if (matches) positiveScore += matches.length;
  });

  negativeKeywords.forEach((keyword) => {
    const regex = new RegExp(keyword, "gi");
    const matches = normalizedText.match(regex);
    if (matches) negativeScore += matches.length;
  });

  neutralKeywords.forEach((keyword) => {
    const regex = new RegExp(keyword, "gi");
    const matches = normalizedText.match(regex);
    if (matches) neutralScore += matches.length * 0.5; // Lower weight for neutral
  });

  // Additional context analysis
  // Check for promotional/sales content (usually positive)
  const salesIndicators = SENTIMENT_CONFIG.salesIndicators;
  salesIndicators.forEach((indicator) => {
    if (normalizedText.includes(indicator)) positiveScore += 1;
  });

  // Check for product recommendations (usually positive)
  if (normalizedText.includes("แนะนำ") || normalizedText.includes("ขอแนะนำ")) {
    positiveScore += 2;
  }

  // Check for Thai internet slang and expressions
  const laughingPattern = text.match(/5{3,}/g); // 555+ laughing
  if (laughingPattern) {
    positiveScore += laughingPattern.length * 2; // Laughing is generally positive
  }

  // Check for multiple exclamations (can be positive or negative, context dependent)
  const excitementPattern = text.match(/[!]{2,}/g);
  if (excitementPattern) {
    // If already has positive indicators, boost positive; otherwise it might be negative
    if (positiveScore > negativeScore) {
      positiveScore += excitementPattern.length;
    } else if (negativeScore > positiveScore) {
      negativeScore += excitementPattern.length;
    }
  }

  // Check for repeated vowels (indicates excitement/emotion)
  const stretchedWords = text.match(/[าอออออ]{3,}|[ววววว]{3,}|[นุนุนุ]{3,}/g);
  if (stretchedWords) {
    // Generally indicates positive excitement in Thai social media
    positiveScore += stretchedWords.length;
  }

  // Check for emojis
  const positiveEmojis = text.match(SENTIMENT_CONFIG.positiveEmojis);
  const negativeEmojis = text.match(SENTIMENT_CONFIG.negativeEmojis);

  if (positiveEmojis) positiveScore += positiveEmojis.length;
  if (negativeEmojis) negativeScore += negativeEmojis.length;

  // Special handling for complaints/feedback posts
  const complaintIndicators = SENTIMENT_CONFIG.complaintIndicators;
  complaintIndicators.forEach((indicator) => {
    if (normalizedText.includes(indicator)) {
      negativeScore += 2; // Weight complaints heavily
    }
  });

  // Calculate final sentiment
  const totalScore = positiveScore + negativeScore + neutralScore;

  if (totalScore === 0) return "neutral";

  const positiveRatio = positiveScore / totalScore;
  const negativeRatio = negativeScore / totalScore;

  // Adjusted thresholds based on new data patterns
  if (positiveScore > negativeScore && positiveRatio > 0.25) {
    return "positive";
  } else if (negativeScore > positiveScore && negativeRatio > 0.15) {
    return "negative";
  } else {
    return "neutral";
  }
};
