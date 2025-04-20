"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRangePicker } from "@/components/date-range-picker";
import { FilterIcon } from "lucide-react";
import { useState } from "react";

type TransactionType = "ALL" | "INCOME" | "EXPENSE";

interface FilterState {
  type: TransactionType;
  categoryId?: string;
}

export function TransactionFilters() {
  const [filters, setFilters] = useState<FilterState>({
    type: "ALL",
  });

  const typeLabels: Record<TransactionType, string> = {
    ALL: "All Types",
    INCOME: "Income Only",
    EXPENSE: "Expenses Only",
  };

  return (
    <div className="flex items-center gap-2">
      <DateRangePicker />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-2">
            <FilterIcon className="h-4 w-4" />
            <span>Filter</span>
            {(filters.type !== "ALL" || filters.categoryId) && (
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Transaction Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Transaction Type
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.type === "ALL"}
              onCheckedChange={() =>
                setFilters({ ...filters, type: "ALL" })
              }
            >
              All Types
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.type === "INCOME"}
              onCheckedChange={() =>
                setFilters({ ...filters, type: "INCOME" })
              }
            >
              Income Only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.type === "EXPENSE"}
              onCheckedChange={() =>
                setFilters({ ...filters, type: "EXPENSE" })
              }
            >
              Expenses Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setFilters({ type: "ALL" })}>
            Reset Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}