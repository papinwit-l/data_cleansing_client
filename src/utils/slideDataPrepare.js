const ExpampleData = [
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
  {
    Account: "after_shipping",
    Message:
      "มาค่ะ♻️ ชุดเหยือกน้ำน่ารักมากจาก Pillowfort  3,990.- Line: aftershipping   #cerave  #เมลาโทนิน #พรีออเดอร์ญี่ปุ่น #พรีออเดอร์อเมริกา #วิตามินอเมริกา #Preorderuk  #นำเข้าจากอเมริกา #แก้วStanleyนำเข้า #แก้วเก็บความเย็นนำเข้า #สินค้าเกาหลี #ผ้าห่มนำเข้า #เครื่องนวด #เครื่องนวดตา #นวดคอ #stanley #newbalance #Lifevac",
    "Direct URL": "https://instagram.com/p/DH34toCyclN",
    "Post URL": "https://instagram.com/p/DH34toCyclN",
    "Comment URL": "",
    "Reply comment URL": "",
    Source: "instagram",
    "Post time": "2025-04-01 01:08:15",
    Engagement: "0",
    "Main keyword": "cerave",
    "Sub keyword": "-",
    "Follower count": "0",
    Sentiment: "Positive",
    Category: "Cerave",
    "Track post": "",
    "Track account": "",
    Note: "-",
    _id: "47297180383_DH34toCyclN",
    "Image labels": "-",
    "Image URL":
      "https://s3-ap-southeast-1.amazonaws.com/wisesight-images/saai/th/2025/03/31/original_instagram_47297180383_DH34toCyclN_174044703.jpg",
    "Account label audience size": "",
    "Account label categories": "-",
    "Account label type": "",
    "Account label TSA": "-",
    "Logo recognition": "-",
    "Scene recognition": "pantry",
  },
];

export const groupDataBySource = (data) => {
  return data.reduce((acc, item) => {
    const { Source } = item;
    if (!acc[Source]) {
      acc[Source] = [];
    }
    acc[Source].push(item);
    return acc;
  }, {});
};

// Find top engagement message and account from each source
export const getTopEngagementBySource = (data) => {
  const groupedBySource = groupDataBySource(data);
  const topBySource = {};

  Object.keys(groupedBySource).forEach((source) => {
    const posts = groupedBySource[source];

    // Find post with highest engagement
    const topPost = posts.reduce((max, current) => {
      const currentEngagement = parseInt(current.Engagement) || 0;
      const maxEngagement = parseInt(max.Engagement) || 0;
      return currentEngagement > maxEngagement ? current : max;
    });

    // Find account with highest total engagement
    const accountEngagements = posts.reduce((acc, post) => {
      const account = post.Account;
      const engagement = parseInt(post.Engagement) || 0;

      if (!acc[account]) {
        acc[account] = {
          account: account,
          totalEngagement: 0,
          postCount: 0,
          posts: [],
        };
      }

      acc[account].totalEngagement += engagement;
      acc[account].postCount += 1;
      acc[account].posts.push({
        engagement: engagement,
        message: post.Message,
        postTime: post["Post time"],
        sentiment: post.Sentiment,
      });

      return acc;
    }, {});

    const topAccount = Object.values(accountEngagements).reduce(
      (max, current) => {
        return current.totalEngagement > max.totalEngagement ? current : max;
      }
    );

    topBySource[source] = {
      topPost: {
        account: topPost.Account,
        message: topPost.Message,
        engagement: parseInt(topPost.Engagement) || 0,
        postTime: topPost["Post time"],
        sentiment: topPost.Sentiment,
        postUrl: topPost["Post URL"],
        followerCount: parseInt(topPost["Follower count"]) || 0,
      },
      topAccount: {
        account: topAccount.account,
        totalEngagement: topAccount.totalEngagement,
        postCount: topAccount.postCount,
        averageEngagement: (
          topAccount.totalEngagement / topAccount.postCount
        ).toFixed(2),
        posts: topAccount.posts,
      },
    };
  });

  return topBySource;
};

export const calculateTotalEngagementBySource = (data) => {
  const engagementBySource = data.reduce((acc, post) => {
    const source = post.Source;
    const engagement = parseInt(post.Engagement) || 0;

    if (!acc[source]) {
      acc[source] = {
        source: source,
        totalEngagement: 0,
        postCount: 0,
        averageEngagement: 0,
        percentage: 0,
      };
    }

    acc[source].totalEngagement += engagement;
    acc[source].postCount += 1;

    return acc;
  }, {});

  // Calculate total engagement across all sources for percentage calculation
  const grandTotal = Object.values(engagementBySource).reduce(
    (sum, sourceData) => {
      return sum + sourceData.totalEngagement;
    },
    0
  );

  // Calculate averages and percentages
  Object.keys(engagementBySource).forEach((source) => {
    const sourceData = engagementBySource[source];
    sourceData.averageEngagement =
      sourceData.postCount > 0
        ? (sourceData.totalEngagement / sourceData.postCount).toFixed(2)
        : 0;
    sourceData.percentage =
      grandTotal > 0
        ? ((sourceData.totalEngagement / grandTotal) * 100).toFixed(1)
        : 0;
  });

  return engagementBySource;
};

export const summarizeEngagementData = (data) => {
  // group data by source
  const groupedBySource = groupDataBySource(data);

  // Find top engagement message and account from each source
  const topBySource = getTopEngagementBySource(data);

  // Calculate total engagement for each source
  const totalEngagementBySource = calculateTotalEngagementBySource(data);

  const preparedData = {
    groupedBySource,
    topBySource,
    totalEngagementBySource,
  };
  return preparedData;
};
