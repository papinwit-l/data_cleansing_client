import React, { useMemo, useState } from "react";

const ExampleDataTable = ({
  data,
  tableTitle = "Social Media Monitoring Dashboard",
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [expandedRows, setExpandedRows] = useState(new Set());

  // Calculate pagination
  const { tableData, totalPages, startIndex, endIndex } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    const tableData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return { tableData, totalPages, startIndex, endIndex };
  }, [data, currentPage, itemsPerPage]);

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setExpandedRows(new Set()); // Clear expanded rows
  };

  // Navigate to specific page
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setExpandedRows(new Set()); // Clear expanded rows when changing pages
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Sample data for demo (replace with your actual data prop)
  const sampleData = [
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

  // Use sample data if no data prop provided
  const actualData = data || sampleData;

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text === "-") return text;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      case "neutral":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case "x":
        return "🐦";
      case "twitter":
        return "🐦";
      case "instagram":
        return "📷";
      case "facebook":
        return "👤";
      default:
        return "🌐";
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <h1 className="text-2xl font-bold text-white">{tableTitle}</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account & Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.length > 0 &&
                tableData.map((item, index) => (
                  <React.Fragment key={item._id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getSourceIcon(item.Source)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              @{item.Account}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {item.Source}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item["Follower count"]} followers
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {expandedRows.has(item._id)
                              ? item.Message
                              : truncateText(item.Message)}
                          </p>
                          {item.Message && item.Message.length > 100 && (
                            <button
                              onClick={() => toggleRow(item._id)}
                              className="text-blue-600 hover:text-blue-800 text-xs mt-1 font-medium"
                            >
                              {expandedRows.has(item._id)
                                ? "Show less"
                                : "Show more"}
                            </button>
                          )}
                          <div className="mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item["Main keyword"]}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">❤️</span>
                          <span className="font-medium">{item.Engagement}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(
                            item.Sentiment
                          )}`}
                        >
                          {item.Sentiment}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item["Post time"]).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <a
                            href={item["Post URL"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Post
                          </a>
                          <button
                            onClick={() => toggleRow(item._id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            {expandedRows.has(item._id) ? "Less" : "Details"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedRows.has(item._id) && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Recognition
                              </h4>
                              <p>
                                <span className="text-gray-500">Logo:</span>{" "}
                                {item["Logo recognition"] || "N/A"}
                              </p>
                              <p>
                                <span className="text-gray-500">Scene:</span>{" "}
                                {item["Scene recognition"] || "N/A"}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Metadata
                              </h4>
                              <p>
                                <span className="text-gray-500">Category:</span>{" "}
                                {item.Category}
                              </p>
                              <p>
                                <span className="text-gray-500">ID:</span>{" "}
                                {item._id}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Image
                              </h4>
                              {item["Image URL"] && (
                                <img
                                  src={item["Image URL"]}
                                  alt="Post content"
                                  className="w-20 h-20 object-cover rounded border"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-100 border-t">
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center space-x-1">
              {/* Previous button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                <span key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </span>
              ))}

              {/* Next button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {endIndex} of {actualData.length}{" "}
              results
            </p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>
                Total Engagement:{" "}
                {actualData.reduce(
                  (sum, item) => sum + parseInt(item.Engagement || 0),
                  0
                )}
              </span>
              <span>
                Sources:{" "}
                {[...new Set(actualData.map((item) => item.Source))].join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleDataTable;
