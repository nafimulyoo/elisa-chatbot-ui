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
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
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

const ELISA_URL = 'https://elisa.itb.ac.id';

interface ElisaData {
  chart_data: {
    timestamp: string;
    R: number;
    S: number;
    T: number;
  }[];
  hourly_data: {
    hour: string;
    cost: number;
    energy: number;
  }[];
  today_data: {
    total_daya: number;
    avg_daya: number;
    total_cost: number;
    avg_cost: number;
  };
  prev_month_data: {
    total_daya: number;
    day_daya: number;
    total_cost: number;
    day_cost: number;
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
        const response = await fetch(`${ANALYSIS_URL}/api/get-fakultas`);
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
        const response = await fetch(`${ANALYSIS_URL}/api/get-gedung?fakultas=${fakultas}`);
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
          `${ANALYSIS_URL}/api/get-lantai?fakultas=${fakultas}&gedung=${gedung}`
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
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      console.log("fetching data");
      try {
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const url = `${ANALYSIS_URL}/api/daily?date=${date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`;

        // console.log(url);
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

    const fetchAnalysis = async () => {
      setAnalysis("");
      try {
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const response = await fetch(`${ANALYSIS_URL}/api/analysis/daily?date=${date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`);
        if (!response.ok) throw new Error('Failed to fetch analysis');
        const analysis_result = await response.json();
        setAnalysis(analysis_result.analysis);
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
    intervalId = setInterval(fetchAll, 15 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [date, fakultas, gedung, lantai]);


  // Prepare chart data for clustered column chart
  const chartData = data?.chart_data.map(item => ({
    time: formatTimestamp(item.timestamp),
    R: item.R,
    S: item.S,
    T: item.T
  })) || [];

  return (
    <div className="p-6">
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded-md"
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
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

      {loading ? (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          layout
          className="sm:h-full min-h-[400px] flex flex-col"
        >
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
            <div className="flex items-center justify-center mt-4 text-muted-foreground">
              Loading data...
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout
            className="sm:h-full min-h-[400px] flex flex-col"
          > {
              data && (
                <>
                  {/* Summary Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold">Total Usage</h3>
                          <p><span className="font-medium">Energy: </span>{data.today_data.total_daya.toFixed(2)} kWh</p>
                          <p><span className="font-medium">Cost: </span>Rp{data.today_data.total_cost.toFixed(2)}</p>
                        </div>
                        <div>
                        <h3 className="font-semibold">Average Hourly Usage</h3>
                          <p><span className="font-medium">Energy: </span>{data.today_data.avg_daya.toFixed(2)} kWh/hour</p>
                          <p><span className="font-medium">Cost: </span>Rp{data.today_data.avg_cost.toFixed(2)} /hour</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-4">Previous Month Summary</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold">Total Usage</h3>
                          <p><span className="font-medium">Energy: </span>{data.prev_month_data?.total_daya?.toFixed(2) || 'N/A'} kWh</p>
                          <p><span className="font-medium">Cost: </span>Rp{data.prev_month_data?.total_cost?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Average Daily Usage</h3>
                          <p><span className="font-medium">Energy: </span>{data.prev_month_data?.day_daya?.toFixed(2) || 'N/A'} kWh/day</p>
                          <p><span className="font-medium">Cost: </span>Rp{data.prev_month_data?.day_cost?.toFixed(2) || 'N/A'} /day</p>
                        </div>
                      </div>
                    </div>
                  </div>
                    <div className="grid g rid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {/* Chart Section - Clustered Column Chart */}
                      <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Energy Consumption by Phase</h2>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="R" fill="#8884d8" name="Phase R" />
                              <Bar dataKey="S" fill="#82ca9d" name="Phase S" />
                              <Bar dataKey="T" fill="#ffc658" name="Phase T" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
                        <div className="h-80">
                          {
                            !analysis ? (
                              <motion.div
                                key="analysis"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center h-full"
                              >
                                <div className="flex-grow flex flex-col items-center justify-center">
                                  <div className="flex items-center justify-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                                  </div>
                                  <div className="flex items-center justify-center mt-4 text-muted-foreground">
                                    Loading analysis...
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div>
                                {
                                  analysis && (
                                    <motion.div
                                      key="analysis"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="h-full"
                                    >
                                      <p className="text-gray-700">
                                        {analysis}
                                      </p>
                                    </motion.div>
                                  )
                                }
                              </div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                    {/* Table Section */}
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Hourly Data</h2>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-100">
                            <TableRow>
                              <TableHead>Hour (UTC+7)</TableHead>
                              <TableHead>Energy</TableHead>
                              <TableHead>Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.hourly_data.slice(0, 10).map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.hour}</TableCell>
                                <TableCell>{item.energy.toFixed(2)} kWh</TableCell>
                                <TableCell>Rp{item.cost.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                </>

              )
            }
          </motion.div>
        </>
      )}
    </div>
  );
}