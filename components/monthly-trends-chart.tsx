"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyTrendsChartProps {
  months?: number;
}

const monthNames = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

export function MonthlyTrendsChart({ months = 6 }: MonthlyTrendsChartProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // API'den aylık trend verilerini getir
        const response = await fetch(`/api/trends/monthly?months=${months}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "API yanıt vermedi");
        }

        const trends = await response.json();

        // Trendi görsel olarak daha iyi anlaşılır hale getir
        const formattedData = trends.map((item: any) => {
          // YYYY-MM formatından ay adına dönüştür
          const [year, month] = item.month.split("-");
          const monthIndex = parseInt(month) - 1;
          return {
            ...item,
            month: `${monthNames[monthIndex]} ${year.slice(2)}`, // Oca 23 gibi
          };
        });

        setData(formattedData);
      } catch (err: any) {
        console.error("Aylık trend verileri yüklenirken hata:", err);
        setError(err.message || "Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, months]);

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
          Bu dönem için aylık trend verisi bulunamadı
        </div>
      </div>
    );
  }

  // Grafik bileşeni
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis dataKey='month' />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)} TL`]}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        <Bar
          name='Gelir'
          dataKey='income'
          fill='#4BC0C0'
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name='Gider'
          dataKey='expense'
          fill='#FF6384'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
