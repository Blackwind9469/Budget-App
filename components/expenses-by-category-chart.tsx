"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TransactionType } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ExpensesByCategoryChartProps {
  startDate?: string;
  endDate?: string;
  showList?: boolean;
}

export function ExpensesByCategoryChart({
  startDate,
  endDate,
  showList = false,
}: ExpensesByCategoryChartProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC148",
    "#EA5545",
    "#8884d8",
    "#F46036",
    "#2E294E",
    "#1B998B",
    "#C5D86D",
    "#5F4BB6",
    "#86A59C",
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Sorgu parametrelerini oluştur
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        // API üzerinden kategori harcamalarını getir
        const response = await fetch(
          `/api/expenses/by-category?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "API yanıt vermedi");
        }

        const categoryExpenses = await response.json();

        setData(categoryExpenses);
      } catch (err: any) {
        console.error("Kategori harcamaları yüklenirken hata:", err);
        setError(err.message || "Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, startDate, endDate]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[300px]'>
        <div className='text-muted-foreground'>Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-[300px]'>
        <div className='text-destructive'>{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-[300px]'>
        <div className='text-muted-foreground'>
          Bu dönem için harcama verisi bulunamadı
        </div>
      </div>
    );
  }

  // Grafik görünümü
  if (!showList) {
    return (
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            outerRadius={80}
            fill='#8884d8'
            dataKey='total'
            nameKey='categoryName'
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} TL`, "Toplam"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Liste görünümü
  return (
    <div className='space-y-4'>
      {data.map((category, index) => (
        <div key={category.categoryId} className='space-y-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Badge
                style={{ backgroundColor: colors[index % colors.length] }}
                className='h-2 w-2 rounded-full p-1'
              />
              <span className='font-medium'>{category.categoryName}</span>
            </div>
            <span className='text-sm'>
              {category.total.toFixed(2)} TL ({category.percentage}%)
            </span>
          </div>
          <Progress value={category.percentage} className='h-2' />
        </div>
      ))}
    </div>
  );
}
