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

function DateRangePickerV2() {
  const { dateRange, setDateRange } = useData();

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

  const calculateDuration = () => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to - dateRange.from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return 0;
  };

  const handleFromDateSelect = (date) => {
    setDateRange((prev) => {
      const newRange = { ...prev, from: date };
      // If "to" date is before "from" date, clear it
      if (newRange.to && date && newRange.to < date) {
        newRange.to = undefined;
      }
      return newRange;
    });
  };

  const handleToDateSelect = (date) => {
    setDateRange((prev) => {
      const newRange = { ...prev, to: date };
      // If "from" date is after "to" date, clear it
      if (newRange.from && date && newRange.from > date) {
        newRange.from = undefined;
      }
      return newRange;
    });
  };

  // Calculate default months for each calendar
  const fromMonth = dateRange?.from || new Date();
  const toMonth =
    dateRange?.to ||
    new Date(fromMonth.getFullYear(), fromMonth.getMonth() + 1, 1);

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* From Calendar */}
            <div className="border-r">
              <div className="p-3 text-center border-b bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground">
                  From Date
                </h4>
              </div>
              <div className="h-[280px] overflow-hidden">
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={handleFromDateSelect}
                  defaultMonth={fromMonth}
                  fixedWeeks={true}
                  showOutsideDays={true}
                  className="h-full"
                  disabled={(date) => {
                    // Disable dates after "to" date if it exists
                    return dateRange?.to ? date > dateRange.to : false;
                  }}
                />
              </div>
            </div>

            {/* To Calendar */}
            <div>
              <div className="p-3 text-center border-b bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground">
                  To Date
                </h4>
              </div>
              <div className="h-[280px] overflow-hidden">
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={handleToDateSelect}
                  defaultMonth={toMonth}
                  fixedWeeks={true}
                  showOutsideDays={true}
                  className="h-full"
                  disabled={(date) => {
                    // Disable dates before "from" date if it exists
                    return dateRange?.from ? date < dateRange.from : false;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 p-3 border-t bg-muted/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                setDateRange({ from: weekAgo, to: today });
              }}
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                setDateRange({ from: monthAgo, to: today });
              }}
            >
              Last 30 days
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {dateRange.from && dateRange.to && (
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

export default DateRangePickerV2;
