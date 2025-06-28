
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchMonthlyTrends = async () => {
  const response = await axios.get('http://localhost:3000/api/dashboard/trends/monthly');
  return response.data;
};

const fetchYearlyTrends = async () => {
  const response = await axios.get('http://localhost:3000/api/dashboard/trends/yearly');
  return response.data;
};

const OverviewChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-trends'],
    queryFn: fetchMonthlyTrends,
  });

  const { data: yearlyData = [], isLoading: yearlyLoading } = useQuery({
    queryKey: ['yearly-trends'],
    queryFn: fetchYearlyTrends,
  });

  const currentData = selectedPeriod === 'monthly' ? monthlyData : yearlyData;
  const isLoading = selectedPeriod === 'monthly' ? monthlyLoading : yearlyLoading;
  const xAxisKey = selectedPeriod === 'monthly' ? 'month' : 'year';

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Overview</CardTitle>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-400">Income</span>
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
              <LineChart data={currentData}>
                <XAxis 
                  dataKey={xAxisKey} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => selectedPeriod === 'yearly' ? `$${(value / 1000).toFixed(0)}k` : `$${value}`}
                />
                <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [
                  selectedPeriod === 'yearly' ? `$${value.toLocaleString()}` : `$${value}`, 
                  ''
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Income</span>
            <span className="text-emerald-400 font-semibold">
              {selectedPeriod === 'yearly' ? '$195,302.00' : '$224.00'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewChart;
