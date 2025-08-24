"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";

function DateRangePicker() {
  const { dateRange, setDateRange } = useData();

  const formatDateRange = (range) => {
    if (range?.from && range?.to) {
      return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    } else if (range?.from) {
      return `${range.from.toLocaleDateString()} - Select end date`;
    }
    return "Select date range";
  };

  const clearSelection = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const calculateDuration = () => {
    if (dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(dateRange.to - dateRange.from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return 0;
  };

  // Safe handler for date range selection
  const handleDateRangeSelect = (range) => {
    // Ensure we always have a valid object
    if (!range) {
      setDateRange({ from: undefined, to: undefined });
      return;
    }

    // Handle the case where range might be just a date instead of an object
    if (range instanceof Date) {
      setDateRange({ from: range, to: undefined });
      return;
    }

    // Normal case - range is an object with from/to properties
    setDateRange({
      from: range.from || undefined,
      to: range.to || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="h-[340px] overflow-hidden">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              fixedWeeks={true}
              showOutsideDays={true}
              className="h-full"
            />
          </div>
        </PopoverContent>
      </Popover>

      {dateRange?.from && dateRange?.to && (
        <div className="bg-muted/50 p-3 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Selected Range</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Start: {dateRange.from.toLocaleDateString()}</div>
            <div>End: {dateRange.to.toLocaleDateString()}</div>
            <div className="font-medium text-foreground">
              Duration: {calculateDuration()} days
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
