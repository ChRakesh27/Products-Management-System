import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useState } from "react";

import type { DateView } from "@mui/x-date-pickers/models";

export interface BasicDatePickerProps {
  onPickDate: (date: Date | null) => void;
  value?: Date | null;
  disabled?: boolean;
  className?: string;
  views?: readonly DateView[];
  format?: string;
}

export default function BasicDatePicker({
  onPickDate,
  value,
  disabled = false,
  className = "",
  views = ["year", "month", "day"] as const,
  format = "DD/MM/YYYY",
}: BasicDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        className={"input-tag " + className}
        open={open}
        onOpen={() => setOpen(!open)}
        onClose={() => setOpen(false)}
        value={value ? dayjs(value) : null}
        format={format}
        views={views}
        onChange={(newValue) => {
          if (newValue) {
            const date = newValue.toDate();
            onPickDate(date);
          } else {
            onPickDate(null);
          }
          setOpen(false);
        }}
        disabled={disabled}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            disabled: disabled,
            inputProps: {
              placeholder: "Pick a date",
            },
            InputProps: {
              sx: {
                height: 46,
                fontSize: 14,
                "& .MuiInputBase-input": {
                  height: "24px",
                  padding: "4px 10px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
              },
            },
            onClick: () => {
              if (!disabled) setOpen(!open);
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
