"use client";
import { Button } from "@/components/ui/button";
import { PieChartInteractive } from "@/components/ui/pie-chart-interactive";
import Link from "next/link";
import { ArrowRight, BarChart4, DollarSign, PiggyBank } from "lucide-react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { faker } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const labels = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs"];

const barMixedData = {
  labels,
  datasets: [
    {
      label: "Satışlar",
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: "rgba(59, 130, 246, 0.5)",
    },
  ],
};

const pieData = {
  labels: ["Mobil", "Web", "Masaüstü"],
  datasets: [
    {
      label: "Kullanıcı Dağılımı",
      data: [300, 500, 200],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
    },
  ],
};

const barMultipleData = {
  labels,
  datasets: [
    {
      label: "2024",
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: "#3b82f6",
    },
    {
      label: "2023",
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: "#10b981",
    },
  ],
};

const areaData = {
  labels,
  datasets: [
    {
      label: "Gelir",
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      fill: true,
      backgroundColor: "rgba(59, 130, 246, 0.3)",
      borderColor: "#3b82f6",
    },
  ],
};

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <header className='border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-16 items-center bg-blue-300 justify-between'>
          <div className='flex items-center ml-6 gap-2'>
            <PiggyBank className='h-10 w-10 text-primary' />
            <span className='text-4xl font-bold text-blue-900'>
              Budget Tracker
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <Link href='/sign-in'>
              <Button variant='ghost'>Sign in</Button>
            </Link>
            <Link href='/sign-up'>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <section className='py-20 md:py-32 bg-gradient-to-t from-white to-blue-300'>
          <div className='container px-4 md:px-6'>
            <div className='grid gap-12 md:grid-cols-2 md:gap-16 items-center'>
              <div className='flex flex-col gap-6'>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
                  Take control of your finances
                </h1>
                <p className='text-xl text-muted-foreground'>
                  Track your income and expenses, visualize your spending
                  patterns, and achieve your financial goals.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link href='/sign-up'>
                    <Button size='lg' className='gap-2'>
                      Start for free <ArrowRight className='h-4 w-4' />
                    </Button>
                  </Link>
                  <Link href='/sign-in'>
                    <Button size='lg' variant='outline'>
                      Sign in
                    </Button>
                  </Link>
                </div>
              </div>
              <div className='min-h-screen flex items-center justify-center bg-gray-50 p-10'>
                <div className='grid grid-cols-2 grid-rows-2 gap-6 w-full max-w-6xl'>
                  {/* Satır 1 - Sütun 1 */}
                  <div className='bg-white p-4 rounded-lg shadow'>
                    <h2 className='text-lg font-semibold mb-2'>
                      Bar Chart Mixed
                    </h2>
                    <Bar data={barMixedData} />
                  </div>

                  {/* Satır 1 - Sütun 2 */}
                  <div className='bg-white p-4 rounded-lg shadow'>
                    <h2 className='text-lg font-semibold mb-2'>
                      Pie Chart + Legend
                    </h2>
                    <Pie data={pieData} />
                  </div>

                  {/* Satır 2 - Sütun 1 */}
                  <div className='bg-white p-4 rounded-lg shadow'>
                    <h2 className='text-lg font-semibold mb-2'>
                      Bar Chart Multiple
                    </h2>
                    <Bar data={barMultipleData} />
                  </div>

                  {/* Satır 2 - Sütun 2 */}
                  <div className='bg-white p-4 rounded-lg shadow'>
                    <h2 className='text-lg font-semibold mb-2'>Area Chart</h2>
                    <Line
                      data={areaData}
                      options={{ plugins: { legend: { display: false } } }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='py-16 md:py-24 bg-muted/30'>
          <div className='container px-4 md:px-6'>
            <div className='flex flex-col gap-8 text-center'>
              <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
                Key Features
              </h2>
              <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                <div className='flex flex-col gap-4 p-6 bg-card rounded-xl border border-border/70 shadow-sm'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                    <DollarSign className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold'>Track Transactions</h3>
                  <p className='text-muted-foreground'>
                    Record your income and expenses with detailed
                    categorization.
                  </p>
                </div>
                <div className='flex flex-col gap-4 p-6 bg-card rounded-xl border border-border/70 shadow-sm'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                    <BarChart4 className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold'>Data Visualization</h3>
                  <p className='text-muted-foreground'>
                    Understand your financial patterns through intuitive charts
                    and graphs.
                  </p>
                </div>
                <div className='flex flex-col gap-4 p-6 bg-card rounded-xl border border-border/70 shadow-sm'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                    <PiggyBank className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold'>Financial Insights</h3>
                  <p className='text-muted-foreground'>
                    Get valuable insights about your spending habits and saving
                    opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-border py-6 md:py-8'>
        <div className='container flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:flex-row'>
          <div className='flex items-center gap-2'>
            <PiggyBank className='h-5 w-5 text-primary' />
            <span className='font-medium'>Budget Tracker</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} Budget Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
