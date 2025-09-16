import { Check, ChevronsUpDown, Mail } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import type { PartnerModel } from "../../Model/VendorModel";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function PartiesSelection({
  parties,
  value,
  onChange,
  placeholder = "Select buyer…",
  className,
  disabled,
}: {
  parties: PartnerModel[];
  value: string;
  onChange: (v: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parties.find((p) => p.id === value) ?? value : null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between truncate",
            !selected && "text-muted-foreground",
            className
          )}
        >
          {selected && typeof selected !== "string"
            ? selected.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px]  p-0" align="start">
        <Command filter={(v, s) => (v.toLowerCase().includes(s) ? 1 : 0)}>
          <CommandInput placeholder="Search buyer by name/email…" />
          <CommandList>
            <CommandEmpty>No buyer found.</CommandEmpty>
            <CommandGroup>
              {parties.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.email ?? ""}`}
                  onSelect={() => {
                    onChange({
                      id: p.id,
                      type: p.type,
                      name: p.name,
                      email: p.email,
                      phone: p.phone,
                      shippingAddress: p.shippingAddress,
                      billingAddress: p.billingAddress,
                      gstNumber: p.gstNumber,
                      panNo: p.panNo,
                      cin: p.cin,
                    });
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === p.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    {(p.email || p.billingAddress.state) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {p.email && <Mail className="h-3 w-3" />}
                        <span className="truncate">
                          {p.email ?? ""}
                          {p.email && p.billingAddress.state ? " • " : ""}
                          {p.billingAddress.state ?? ""}
                        </span>
                      </div>
                    )}
                  </div>
                  {p.type && (
                    <Badge variant="secondary" className="ml-auto">
                      {p.type}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
