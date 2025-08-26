"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DatePicker({
  date = undefined,
  setDate,
  className = "",
}: {
  date?: Timestamp;
  setDate: (d: Timestamp) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  function timestampDate(): Date | undefined {
    if (!date?.seconds) return;
    const milliseconds = date.seconds * 1000 + date.nanoseconds / 1_000_000;
    return new Date(milliseconds);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className={`w-full justify-between font-normal p-5 ${className}`}
        >
          {timestampDate() ? format(timestampDate()!, "PPP") : "Select date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={timestampDate()}
          captionLayout="dropdown"
          onSelect={(d) => {
            if (!d) return;
            setDate(Timestamp.fromDate(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
