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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ELISA_URL = 'https://elisa.itb.ac.id';

interface ElisaData {
  chart_data: {
    timestamp: string;
    power: number;
  }[];
  today_data: {
    total_daya: number;
    avg_daya: number;
    total_cost: number;
    avg_cost: number;
  };
  prev_month_data: {
    total_daya: number;
    avg_daya: number;
    total_cost: number;
    avg_cost: number;
  };
}

interface Option {
  value: string;
  label: string;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Home() {
  const [data, setData] = useState<ElisaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [date, setDate] = useState("2025-01-01");
  const [fakultas, setFakultas] = useState("all");
  const [gedung, setGedung] = useState("all");
  const [lantai, setLantai] = useState("all");
  
  // Options states
  const [fakultasOptions, setFakultasOptions] = useState<Option[]>([]);
  const [gedungOptions, setGedungOptions] = useState<Option[]>([]);
  const [lantaiOptions, setLantaiOptions] = useState<Option[]>([]);

  // Analysis
  const [analysis, setAnalysis] = useState("");

  const ANALYSIS_URL = 'http://127.0.0.1:8000';

  // Fetch initial fakultas options

  useEffect(() => {
    const fetchFakultas = async () => {
      try {
        const response = await fetch(`${ELISA_URL}/api/get-fakultas`);
        if (!response.ok) throw new Error('Failed to fetch fakultas');
        const data = await response.json();
        setFakultasOptions(data.fakultas || []);
      } catch (err) {
        console.error("Error fetching fakultas:", err);
      }
    };
    fetchFakultas();
  }, []);

  useEffect(() => {
    if (fakultas === "all") {
      setGedung("all");
      setGedungOptions([]);
      setLantai("all");
      setLantaiOptions([]);
      return;
    }

    const fetchGedung = async () => {
      try {
        const response = await fetch(`${ELISA_URL}/api/get-gedung?fakultas=${fakultas}`);
        if (!response.ok) throw new Error('Failed to fetch gedung');
        const data = await response.json();
        setGedungOptions(data.gedung || []);
        setGedung("all"); // Reset to "all" when fakultas changes
        setLantai("all"); // Reset to "all" when fakultas changes
      } catch (err) {
        console.error("Error fetching gedung:", err);
      }
    };
    fetchGedung();
  }, [fakultas]);

  // Fetch lantai options when gedung changes
  useEffect(() => {
    if (gedung === "all" || fakultas === "all") {
      setLantai("all");
      setLantaiOptions([]);
      return;
    }

    const fetchLantai = async () => {
      try {
        const response = await fetch(
          `${ELISA_URL}/api/get-lantai?fakultas=${fakultas}&gedung=${gedung}`
        );
        if (!response.ok) throw new Error('Failed to fetch lantai');
        const data = await response.json();
        setLantaiOptions(data.lantai || []);
        setLantai("all"); // Reset to "all" when gedung changes
      } catch (err) {
        console.error("Error fetching lantai:", err);
      }
    };
    fetchLantai();
  }, [gedung, fakultas]);

  useEffect(() => {
    // current date in YYYY-MM-DD format without hour
    const current_date = new Date().toISOString().split('T')[0];
    setDate(current_date);
    const fetchAnalysis = async () => {
      try {
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const response = await fetch(`${ANALYSIS_URL}/api/analysis/now?date=${date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`);
        if (!response.ok) throw new Error('Failed to fetch analysis');
        const analysis_result = await response.json();
        setAnalysis(analysis_result);
        console.log(analysis_result)
      } catch (err) {
        console.error("Error fetching analysis:", err);
      }
    };
    
    fetchAnalysis();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const fakultas_data = fakultas === "all" ? "" : fakultas;
      const gedung_data = gedung === "all" ? "" : gedung;
      const lantai_data = lantai === "all" ? "" : lantai;

      try {
        const url = `${ELISA_URL}/api/now?date=${current_date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`
        
        console.log(url)
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data: ElisaData = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const fetchAll = async () => {
      fetchData();
      fetchAnalysis();
    }

    fetchAll();
    
    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(fetchAll, 1*60*1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [date, fakultas, gedung, lantai]);

  // Fetch data when filters change
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const fakultas_data = fakultas === "all" ? "" : fakultas;
  //       const gedung_data = gedung === "all" ? "" : gedung;
  //       const lantai_data = lantai === "all" ? "" : lantai;

  //       const url = `${ELISA_URL}/api/now?date=${date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`
        
  //       console.log(url)
  //       const response = await fetch(url);
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch data: ${response.status}`);
  //       }
        
  //       const data: ElisaData = await response.json();
  //       setData(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Unknown error occurred');
  //       console.error("Error fetching data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [date, fakultas, gedung, lantai]);

  const chartData = data?.chart_data.map(item => ({
    ...item,
    formattedTime: formatTimestamp(item.timestamp)
  })) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Now Consumption Dashboard</h1>
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        
        {/* Fakultas Select */}
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Fakultas</label>
        <Select 
          value={fakultas} 
          onValueChange={(value) => {
            setFakultas(value);
            setGedung("all"); // Reset gedung when fakultas changes
            setLantai("all"); // Reset lantai when fakultas changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Fakultas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fakultas</SelectItem>
            {fakultasOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Gedung Select */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Gedung</label>
        <Select 
          value={gedung} 
          onValueChange={(value) => {
            setGedung(value);
            setLantai("all"); // Reset lantai when gedung changes
          }}
          disabled={fakultas === "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder={fakultas !== "all" ? "Select Gedung" : "Select Fakultas first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gedung</SelectItem>
            {gedungOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Lantai Select */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Lantai</label>
        <Select 
          value={lantai} 
          onValueChange={setLantai}
          disabled={gedung === "all" || fakultas === "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder={gedung !== "all" ? "Select Lantai" : "Select Gedung first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lantai</SelectItem>
            {lantaiOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Reset Button */}
      <div className="flex items-end">
        <button 
          onClick={() => {
            setFakultas("all");
            setGedung("all");
            setLantai("all");
          }}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
        >
          Reset Filters
        </button>
      </div>
      
        
      </div>

      {loading && <p className="text-center">Loading data...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}
      
      {/* 2 column flex */}

      
      {data && (
        <>
        <div className="grid g rid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Power Consumption Over Time</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedTime" 
                    tick={{ fontSize: 12 }}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis 
                    label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} kW`, "Power"]}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Power Consumption"
                  />
                </AreaChart>
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
        </div>
       
          {/* Table Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Detailed Data</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Power (kW)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.chart_data.slice(0, 10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatTimestamp(item.timestamp)}</TableCell>
                      <TableCell>{item.power.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Total Energy</h3>
                  <p>{data.today_data.total_daya.toFixed(2)} kWh</p>
                </div>
                <div>
                  <h3 className="font-semibold">Average Power</h3>
                  <p>{data.today_data.avg_daya.toFixed(2)} kW</p>
                </div>
                <div>
                  <h3 className="font-semibold">Total Cost</h3>
                  <p>IDR {data.today_data.total_cost.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Average Cost</h3>
                  <p>IDR {data.today_data.avg_cost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Previous Month Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Total Energy</h3>
                  <p>{data.prev_month_data?.total_daya.toFixed(2)} kWh</p>
                </div>
                <div>
                  <h3 className="font-semibold">Average Power</h3>
                  <p>{data.prev_month_data?.avg_daya?.toFixed(2)} kW</p>
                </div>
                <div>
                  <h3 className="font-semibold">Total Cost</h3>
                  <p>IDR {data.prev_month_data?.total_cost?.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Average Cost</h3>
                  <p>IDR {data.prev_month_data?.avg_cost?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}