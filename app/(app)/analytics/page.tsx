import { Heading } from "@/components/ui/heading";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/date-range-picker";
import { DashboardFilters } from "@/components/dashboard-filters";
import { MonthlyTrendsChart } from "@/components/monthly-trends-chart";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BarChart3, CircleDollarSign, PieChart } from "lucide-react";
import { SpendingTrendsChart } from "@/components/spending-trends-chart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Analytics" description="Visualize and analyze your financial data" />
        <DateRangePicker />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Monthly Trends</CardTitle>
                </div>
                <DashboardFilters />
              </div>
              <CardDescription>Income vs expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyTrendsChart />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Expenses by Category</CardTitle>
                </div>
                <CardDescription>Your spending distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensesByCategoryChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Spending Trends</CardTitle>
                </div>
                <CardDescription>Your expenses week by week</CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingTrendsChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Income Analysis</CardTitle>
                </div>
                <DashboardFilters />
              </div>
              <CardDescription>Your income sources and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-12">
                Income analysis charts will appear here as you add income transactions
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Expense Analysis</CardTitle>
                </div>
                <DashboardFilters />
              </div>
              <CardDescription>Detailed breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingTrendsChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Category Analysis</CardTitle>
                </div>
                <DashboardFilters />
              </div>
              <CardDescription>Spending breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ExpensesByCategoryChart />
              </div>
              <div className="mt-8">
                <ExpensesByCategoryChart showList />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}