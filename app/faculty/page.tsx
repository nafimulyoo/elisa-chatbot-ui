"use client";

import { useState, useEffect } from "react";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ELISA_URL = 'https://elisa.itb.ac.id';

interface FacultyComparisonData {
  value: {
    fakultas: string;
    energy: number;
    cost: number;
  }[];
  data: {
    max: {
      fakultas: string;
      energy: number;
      cost: number;
    };
    min: {
      fakultas: string;
      energy: number;
      cost: number;
    };
    total: {
      energy: number;
      cost: number;
    };
    average: {
      energy: number;
      cost: number;
    };
  };
  info: {
    faculty: string;
    energy: number;
    cost: number;
    area: number;
    ike: number;
    students: number;
    specific_energy: number;
  }[];
}

export default function FacultyComparison() {
  const [data, setData] = useState<FacultyComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state - default to current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const [month, setMonth] = useState(currentMonth);

  // Sort state
  const [sortField, setSortField] = useState<keyof FacultyComparisonData['info'][0]>("energy");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Analysis
  const [analysis, setAnalysis] = useState("");

  const ANALYSIS_URL = 'http://127.0.0.1:8000';
  // fetch analysis using useEffect
  // Fetch data when month changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${ELISA_URL}/api/compare?date=${month}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data: FacultyComparisonData = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`${ANALYSIS_URL}/api/analysis/faculty?date=${month}`);
        if (!response.ok) throw new Error('Failed to fetch analysis');
        const analysis_result = await response.json();
        setAnalysis(analysis_result);
        console.log(analysis_result)
      } catch (err) {
        console.error("Error fetching analysis:", err);
      }
    };

    const fetchAll = async () => {
      fetchData();
      fetchAnalysis();
    }

    fetchAll();
    
    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(fetchAll, 60*60*1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [month]);

  // Sort the info data
  const sortedInfo = data?.info ? [...data.info].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }) : [];

  // Prepare chart data (top 10 faculties by energy)
  const chartData = data?.value
    .sort((a, b) => b.energy - a.energy)
    .slice(0, 10) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Faculty Energy Comparison</h1>
      
      {/* Filter Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 border rounded-md w-full"
            max={currentMonth}
          />
        </div>
      </div>

      {loading && <p className="text-center">Loading data...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}
      
      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold">Highest Consumption</h3>
              <p className="text-lg">{data.data.max.fakultas}</p>
              <p>{data.data.max.energy.toFixed(2)} kWh</p>
              <p>IDR {data.data.max.cost.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold">Lowest Consumption</h3>
              <p className="text-lg">{data.data.min.fakultas}</p>
              <p>{data.data.min.energy.toFixed(2)} kWh</p>
              <p>IDR {data.data.min.cost.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold">Total</h3>
              <p>{data.data.total?.energy?.toFixed(2)} kWh</p>
              <p>IDR {data.data.total?.cost?.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold">Average</h3>
              <p>{data.data.average?.energy?.toFixed(2)} kWh</p>
              <p>IDR {data.data.average?.cost?.toFixed(2)}</p>
            </div>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top 10 Faculties by Energy Consumption ({month})</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="fakultas" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} ${name === 'energy' ? 'kWh' : 'IDR'}`,
                      name === 'energy' ? 'Energy' : 'Cost'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="energy" fill="#8884d8" name="Energy (kWh)">
                    <LabelList 
                      dataKey="energy" 
                      position="right" 
                      formatter={(value: number) => `${value.toFixed(1)} kWh`}
                    />
                  </Bar>
                  <Bar dataKey="cost" fill="#82ca9d" name="Cost (IDR)">
                    <LabelList 
                      dataKey="cost" 
                      position="right" 
                      formatter={(value: number) => `IDR ${value.toFixed(0)}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
              <div className="h-80">
                  {analysis && (
                <ResponsiveContainer width="100%" height="100%">
                  
                  <p>{analysis}</p>
                  
                </ResponsiveContainer>
                  )}
              </div>
            </div>

          {/* Table Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Detailed Faculty Data</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("faculty");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      Faculty {sortField === "faculty" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("energy");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      Energy (kWh) {sortField === "energy" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("cost");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      Cost (IDR) {sortField === "cost" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("area");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      Area (m²) {sortField === "area" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("ike");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      IKE {sortField === "ike" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("students");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      Students {sortField === "students" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortField("specific_energy");
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      Specific Energy {sortField === "specific_energy" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInfo.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.faculty}</TableCell>
                      <TableCell>{item.energy.toFixed(2)}</TableCell>
                      <TableCell>{item.cost.toFixed(2)}</TableCell>
                      <TableCell>{item.area.toFixed(2)}</TableCell>
                      <TableCell>{item.ike.toFixed(2)}</TableCell>
                      <TableCell>{item.students}</TableCell>
                      <TableCell>{(item.energy/item.students).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}