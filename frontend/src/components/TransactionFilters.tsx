import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, Filter, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface Filters {
  status: string;
  category: string;
  amountMin: string;
  amountMax: string;
  dateStart: string;
  dateEnd: string;
  sortBy: string;
  order: "asc" | "desc";
  page: number;
  limit: number;
}

interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const TransactionFilters = ({
  filters,
  onFiltersChange,
}: TransactionFiltersProps) => {
  const updateFilter = (key: keyof Filters, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "",
      category: "",
      amountMin: "",
      amountMax: "",
      dateStart: "",
      dateEnd: "",
      sortBy: "date",
      order: "desc",
      page: 1,
      limit: 10,
    });
  };

  const exportTransactions = async (format: "csv" | "json") => {
    try {
      const exportData = {
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.amountMin && { amountMin: parseFloat(filters.amountMin) }),
        ...(filters.amountMax && { amountMax: parseFloat(filters.amountMax) }),
        ...(filters.dateStart && { dateFrom: filters.dateStart }),
        ...(filters.dateEnd && { dateTo: filters.dateEnd }),
        fields: ["id", "date", "amount", "category", "status", "user_id"],
        format: format,
      };

      const response = await axios.post(
        "http://localhost:3000/api/transactions/export",
        exportData,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Transactions exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the transactions",
        variant: "destructive",
      });
    }
  };

  const activeFiltersCount = [
    filters.status,
    filters.category,
    filters.amountMin,
    filters.amountMax,
    filters.dateStart,
    filters.dateEnd,
  ].filter(Boolean).length;

  const handleDateSelect = (date: Date | undefined, type: "start" | "end") => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      updateFilter(type === "start" ? "dateStart" : "dateEnd", dateString);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400"
              >
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTransactions("csv")}
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTransactions("json")}
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Category
            </label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="Investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                    !filters.dateStart && "text-slate-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateStart
                    ? format(new Date(filters.dateStart), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-800 border-slate-700"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={
                    filters.dateStart ? new Date(filters.dateStart) : undefined
                  }
                  onSelect={(date) => handleDateSelect(date, "start")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                    !filters.dateEnd && "text-slate-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateEnd
                    ? format(new Date(filters.dateEnd), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-800 border-slate-700"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={
                    filters.dateEnd ? new Date(filters.dateEnd) : undefined
                  }
                  onSelect={(date) => handleDateSelect(date, "end")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Min Amount
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.amountMin}
              onChange={(e) => updateFilter("amountMin", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Max Amount
            </label>
            <Input
              type="number"
              placeholder="No limit"
              value={filters.amountMax}
              onChange={(e) => updateFilter("amountMax", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter("sortBy", value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Order</label>
              <Select
                value={filters.order}
                onValueChange={(value: "asc" | "desc") =>
                  updateFilter("order", value)
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
