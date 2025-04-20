"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DashboardFiltersProps {
  onFilterChange?: (filter: string) => void;
}

export function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const [filter, setFilter] = useState("all");

  const handleFilterChange = (value: string) => {
    setFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 gap-1'>
          Filtrele
          <ChevronDown className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuLabel>Kategori Filtresi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={filter}
          onValueChange={handleFilterChange}
        >
          <DropdownMenuRadioItem value='all'>Tümü</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='essential'>
            Temel Giderler
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='discretionary'>
            İsteğe Bağlı Giderler
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='income'>Gelirler</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
