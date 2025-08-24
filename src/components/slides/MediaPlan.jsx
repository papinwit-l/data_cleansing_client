import { detectSpans } from "@/utils/mediaPlanProcessing";
import React, { useEffect, useMemo, useState, useCallback } from "react";

function MediaPlan({ mediaPlanData }) {
  const [spans, setSpans] = useState([]);
  useEffect(() => {
    if (mediaPlanData) {
      const { topTable, middleTable, bottomTable } = mediaPlanData;
      if (topTable && middleTable && bottomTable) {
        const findSpans = detectSpans(middleTable);
        setSpans(findSpans);
        console.log("🎯 spans | mediaplan:", spans);
      }
    }
  }, [mediaPlanData]);

  // Create table with spans
  function renderTable() {
    const processedCells = new Set();

    return (
      <table className="border-collapse w-full text-xs">
        <tbody>
          {mediaPlanData.middleTable.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const cellKey = `${i}-${j}`;

                // Skip if this cell is part of a span from another cell
                if (processedCells.has(cellKey)) {
                  return null;
                }

                // Find span info for this cell
                const spanInfo = spans.find((s) => s.row === i && s.col === j);

                if (spanInfo) {
                  // Mark all cells covered by this span as processed
                  for (let r = i; r < i + spanInfo.rowSpan; r++) {
                    for (let c = j; c < j + spanInfo.colSpan; c++) {
                      processedCells.add(`${r}-${c}`);
                    }
                  }

                  const hasRowSpan = spanInfo.rowSpan > 1;
                  const hasColSpan = spanInfo.colSpan > 1;
                  const bgColor =
                    hasRowSpan && hasColSpan
                      ? "bg-purple-100"
                      : hasRowSpan
                      ? "bg-red-100"
                      : hasColSpan
                      ? "bg-green-100"
                      : "bg-white";

                  return (
                    <td
                      key={j}
                      rowSpan={spanInfo.rowSpan}
                      colSpan={spanInfo.colSpan}
                      className={`border border-gray-400 p-1 ${bgColor} relative`}
                    >
                      <div className="whitespace-pre-wrap text-xs">
                        {spanInfo.value}
                      </div>
                      {(hasRowSpan || hasColSpan) && (
                        <div className="absolute top-0 right-0 text-xs text-gray-500 bg-yellow-200 px-1 rounded">
                          {hasColSpan && `c${spanInfo.colSpan}`}
                          {hasColSpan && hasRowSpan && ","}
                          {hasRowSpan && `r${spanInfo.rowSpan}`}
                        </div>
                      )}
                    </td>
                  );
                } else {
                  // This is an empty cell that should be rendered
                  return (
                    <td
                      key={j}
                      className="border border-gray-400 p-1 bg-gray-100"
                    >
                      <span className="text-gray-400 text-xs">empty</span>
                    </td>
                  );
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div
      id="tiktok-lead-01-component"
      className="flex flex-col py-7 px-10 border w-7xl h-[720px] gap-2 relative group bg-white"
    >
      {mediaPlanData && mediaPlanData?.middleTable && renderTable()}
    </div>
  );
}

export default MediaPlan;
