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
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeatMapGrid } from "react-grid-heatmap";

const ELISA_URL = 'https://elisa.itb.ac.id';

interface HeatmapData {
  dates: {
    start: string;
    end: string;
  };
  heatmap: {
    day: number; // 1-7 (Monday-Sunday)
    hour: number; // 0-23
    value: number;
  }[];
}

interface Option {
  value: string;
  label: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Home() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
    // Default to current week
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End of week (Saturday)
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });
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

  // Prepare heatmap data
  const prepareHeatmapData = () => {
    if (!data) return { xLabels: [], yLabels: [], data: [] };
    
    // Initialize empty grid (7 days x 24 hours)
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    
    // Fill the grid with values
    data.heatmap.forEach(item => {
      // Adjust day index (API returns 1=Monday, we want 0=Sunday)
      const dayIndex = (item.day + 6) % 7; // Convert to 0-6 (Sunday-Saturday)
      grid[dayIndex][item.hour] = item.value;
    });
    
    // Prepare labels
    const xLabels = Array(24).fill(0).map((_, i) => `${i}:00`);
    const yLabels = dayNames;
    
    return { xLabels, yLabels, data: grid };
  };

  const { xLabels, yLabels, data: heatmapData } = prepareHeatmapData();

  // Find min and max values for color scaling
  const minValue = Math.min(...(data?.heatmap.map(item => item.value) || [0]));
  const maxValue = Math.max(...(data?.heatmap.map(item => item.value) || [1]));

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

  // Fetch gedung options when fakultas changes
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
        setGedung("all");
        setLantai("all");
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
        setLantai("all");
      } catch (err) {
        console.error("Error fetching lantai:", err);
      }
    };
    fetchLantai();
  }, [gedung, fakultas]);

  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const url = `${ELISA_URL}/api/heatmap?start=${dateRange.start}&end=${dateRange.end}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`;
        
        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data: HeatmapData = await response.json();
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
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const start_date_input = dateRange.start;
        const end_date_input = dateRange.end;

        const response = await fetch(`${ANALYSIS_URL}/api/analysis/heatmap?start=${start_date_input}&end=${end_date_input}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`);
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
    intervalId = setInterval(fetchAll, 15*60*1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dateRange, fakultas, gedung, lantai]);

  // Handle date range change (always adjust to full week)
  const handleDateChange = (newDate: string) => {
    const date = new Date(newDate);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End of week (Saturday)
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Energy Usage Heatmap</h1>
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Week Starting</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange(e.target.value)}
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
              setGedung("all");
              setLantai("all");
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
              setLantai("all");
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
      
      {data && (
        <>
          {/* Heatmap Section */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Energy Usage Heatmap ({new Date(data.dates.start).toLocaleDateString()} - {new Date(data.dates.end).toLocaleDateString()})
            </h2>
            <div className="h-[500px]">
              <HeatMapGrid
                data={heatmapData}
                xLabels={xLabels}
                yLabels={yLabels}
                cellHeight="2rem"
                cellStyle={(_x, _y, ratio) => ({
                  background: `rgb(${255 * (ratio)}, ${255 * (1 - ratio)}, 0)`,
                  fontSize: "0.8rem",
                  color: ratio > 0.5 ? "white" : "black"
                })}
                cellRender={(x, y, value) => (
                  <div title={`${yLabels[y]} ${xLabels[x]}: ${value?.toFixed(2) || 0} kWh`}>
                    {value?.toFixed(1) || 0}
                  </div>
                )}
                xLabelsStyle={(index) => ({
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  color: "#777"
                })}
                yLabelsStyle={() => ({
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  color: "#777"
                })}
              />
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
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Low: {minValue.toFixed(2)} kWh</span>
              <span>High: {maxValue.toFixed(2)} kWh</span>
            </div>
          </div>

        </>
      )}
    </div>
  );
}