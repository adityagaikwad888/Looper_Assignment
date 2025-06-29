import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import api from "../services/apiClient";

const fetchMonthlyTrends = async () => {
  const response = await api.get("/dashboard/trends/monthly");
  return response.data;
};

const fetchYearlyTrends = async () => {
  const response = await api.get("/dashboard/trends/yearly");
  return response.data;
};

const OverviewChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [hoveredData, setHoveredData] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthly-trends"],
    queryFn: fetchMonthlyTrends,
  });

  const { data: yearlyData = [], isLoading: yearlyLoading } = useQuery({
    queryKey: ["yearly-trends"],
    queryFn: fetchYearlyTrends,
  });

  const currentData = selectedPeriod === "monthly" ? monthlyData : yearlyData;
  const isLoading =
    selectedPeriod === "monthly" ? monthlyLoading : yearlyLoading;
  const xAxisKey = selectedPeriod === "monthly" ? "month" : "year";

  // Calculate total income for the period
  const calculateTotalIncome = (data) => {
    return data.reduce((total, item) => {
      const income = (item.revenue || 0) - (item.expenses || 0);
      return total + income;
    }, 0);
  };

  // Get current income to display
  const getCurrentIncome = () => {
    if (hoveredData) {
      return (hoveredData.revenue || 0) - (hoveredData.expenses || 0);
    }
    if (selectedData) {
      return (selectedData.revenue || 0) - (selectedData.expenses || 0);
    }
    return calculateTotalIncome(currentData);
  };

  // Get current period label
  const getCurrentPeriodLabel = () => {
    if (hoveredData) {
      return selectedPeriod === "monthly"
        ? hoveredData.month
        : hoveredData.year;
    }
    if (selectedData) {
      return selectedPeriod === "monthly"
        ? selectedData.month
        : selectedData.year;
    }
    return selectedPeriod === "monthly" ? "Total (Monthly)" : "Total (Yearly)";
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Overview</CardTitle>
            <div className="flex items-center space-x-4 mt-2">
              {" "}
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-400">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-400">Expenses</span>
              </div>
            </div>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-24 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentData}
                onMouseMove={(data) => {
                  if (
                    data &&
                    data.activePayload &&
                    data.activePayload.length > 0
                  ) {
                    setHoveredData(data.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredData(null);
                }}
                onClick={(data) => {
                  if (
                    data &&
                    data.activePayload &&
                    data.activePayload.length > 0
                  ) {
                    setSelectedData(data.activePayload[0].payload);
                  }
                }}
              >
                <XAxis
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) =>
                    selectedPeriod === "yearly"
                      ? `$${(value / 1000).toFixed(0)}k`
                      : `$${value}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    selectedPeriod === "yearly"
                      ? `$${value.toLocaleString()}`
                      : `$${value}`,
                    "",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              Income ({getCurrentPeriodLabel()})
            </span>
            <span
              className={`font-semibold ${
                getCurrentIncome() >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {getCurrentIncome() >= 0 ? "+" : "-"}$
              {Math.abs(getCurrentIncome()).toLocaleString()}
            </span>
          </div>
          {(hoveredData || selectedData) && (
            <div className="mt-2 text-xs text-slate-500">
              Revenue: $
              {(
                hoveredData?.revenue ||
                selectedData?.revenue ||
                0
              ).toLocaleString()}{" "}
              | Expenses: $
              {(
                hoveredData?.expenses ||
                selectedData?.expenses ||
                0
              ).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewChart;
