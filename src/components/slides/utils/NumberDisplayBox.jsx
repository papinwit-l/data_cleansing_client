import { MoveDown, MoveUp } from "lucide-react";
import React from "react";

function NumberDisplayBox({
  title,
  value,
  isConversion = false,
  compareValue = "No data",
  isNegative = false,
  invertCompareColor = false, // ✅ NEW: Option to invert comparison colors
}) {
  // ✅ NEW: Determine color based on isNegative and invertCompareColor
  const getCompareColor = () => {
    if (compareValue === "No data") return "";

    if (invertCompareColor) {
      // Inverted logic: negative is good (green), positive is bad (red)
      return isNegative ? "text-green-500" : "text-red-500";
    } else {
      // Normal logic: negative is bad (red), positive is good (green)
      return isNegative ? "text-red-500" : "text-green-500";
    }
  };

  // ✅ NEW: Determine icon based on isNegative and invertCompareColor
  const getCompareIcon = () => {
    if (compareValue === "No data") return null;

    return isNegative ? (
      <MoveDown className="h-3 w-3" />
    ) : (
      <MoveUp className="h-3 w-3" />
    );
  };

  return (
    <div
      className={`flex flex-col py-3 px-3 justify-between rounded-lg ${
        isConversion ? "bg-red-300" : "bg-gray-300"
      }`}
    >
      <p className="text-xs">{title}</p>
      <div>
        <h2 className="text-2xl">{value}</h2>
        <p className={`text-xs flex items-center ${getCompareColor()}`}>
          {getCompareIcon()}
          {compareValue !== "No data" && getCompareIcon() && " "}
          {compareValue}
        </p>
      </div>
    </div>
  );
}

export default NumberDisplayBox;
