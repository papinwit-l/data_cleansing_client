export const SALE_CONFIG = {
  thresold: 5.0,
  keywords: {
    // Direct sales actions (high weight)
    ออเดอร์: 3,
    สั่ง: 3,
    order: 3,
    ซื้อ: 3,
    จอง: 3,
    เปิดรับ: 3,
    สั่งมา: 3,
    สั่งได้: 3,
    ติดต่อ: 2,

    // Price/discount terms (high weight)
    ลดราคา: 4,
    ลด: 2,
    โปรโมชั่น: 3,
    พิเศษ: 2,
    ฟรี: 3,
    แถม: 3,
    ส่วนลด: 3,

    // Shipping/delivery (medium weight)
    ส่งฟรี: 3,
    จัดส่ง: 2,
    ค่าส่ง: 2,
    ส่งถึงบ้าน: 2,
    delivery: 2,
    ship: 2,

    // Urgency/scarcity (medium weight)
    จำกัด: 2,
    ด่วน: 2,
    รีบ: 2,
    เหลือ: 2,
    ของแถม: 2,
    พร้อมส่ง: 2,

    // Contact/inquiry (low-medium weight)
    สนใจ: 1,
    ทัก: 1,
    DM: 2,
    inbox: 2,
    สอบถาม: 1,
    Line: 1,

    // Product listing indicators (NEW - high weight)
    พิกัด: 3,
    ลิงค์: 2,
    link: 2,

    // Commercial indicators
    ราคา: 1,
    บาท: 1,
    มีของแถม: 2,
    ครบ: 1,
    บิล: 1,
  },

  contactPatterns: ["line:", "dm", "inbox", "ทัก", "สอบถาม"],

  urgencyWords: ["ด่วน", "รีบ", "จำกัด", "เหลือ", "limited"],

  // emojiPattern: /[✨🤟❤️🔥💥⭐🎉🛒💰🎁]/g,

  salesHashtagPatterns: [
    /ตลาดนัด/i,
    /พรีออเดอร์/i,
    /นำเข้า/i,
    /ส่งฟรี/i,
    /preorder/i,
  ],
};
