import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

function DateRangePicker() {
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const formatDateRange = (range) => {
    if (range.from && range.to) {
      return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    } else if (range.from) {
      return `${range.from.toLocaleDateString()} - Select end date`;
    }
    return "Select date range";
  };

  const clearSelection = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const confirmSelection = () => {
    if (dateRange.from && dateRange.to) {
      alert(
        `Selected range: ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`
      );
    } else {
      alert("Please select both start and end dates");
    }
  };

  const calculateDuration = () => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to - dateRange.from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return 0;
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Date Range Picker</h2>
        <p className="text-gray-600">
          Select a start and end date for your range
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {dateRange.from && dateRange.to && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Selected Range:</h3>
          <div className="space-y-1 text-sm">
            <div>Start: {dateRange.from.toLocaleDateString()}</div>
            <div>End: {dateRange.to.toLocaleDateString()}</div>
            <div className="text-gray-600">
              Duration: {calculateDuration()} days
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={clearSelection}
          disabled={!dateRange.from && !dateRange.to}
        >
          Clear
        </Button>
        <Button
          onClick={confirmSelection}
          disabled={!dateRange.from || !dateRange.to}
        >
          Confirm Selection
        </Button>
      </div>
    </div>
  );
}

export default DateRangePicker;
