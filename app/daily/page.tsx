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
import { motion } from "framer-motion";
import { Activity, ArrowDownRight, ArrowUpRight, Calendar, FileChartColumnIncreasing, Loader2 } from "lucide-react";
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-themed";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { formatNumber } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
// import { useSearchParams } from "next/navigation";

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

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [comparison, setComparison] = useState<number[]>([]);
  const [data, setData] = useState<ElisaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const searchParams = useSearchParams();

  // Filter states
  // const [date, setDate] = useState(searchParams.get('date') || getLocalDateString());
  // const [fakultas, setFakultas] = useState(searchParams.get('faculty') || "all");
  // const [gedung, setGedung] = useState(searchParams.get('building') || "all");
  // const [lantai, setLantai] = useState(searchParams.get('floor') || "all");

  const [date, setDate] = useState(getLocalDateString());
  const [fakultas, setFakultas] = useState("all");
  const [gedung, setGedung] = useState("all");
  const [lantai, setLantai] = useState("all");

  // Options states
  const [fakultasOptions, setFakultasOptions] = useState<Option[]>([]);
  const [gedungOptions, setGedungOptions] = useState<Option[]>([]);
  const [lantaiOptions, setLantaiOptions] = useState<Option[]>([]);

  const fetchAnalysis = async () => {
    console.log(model)
    setAnalysis("");
    try {
      const fakultas_data = fakultas === "all" ? "" : fakultas;
      const gedung_data = gedung === "all" ? "" : gedung;
      const lantai_data = lantai === "all" ? "" : lantai;

      const response = await fetch(`${ANALYSIS_URL}/api/analysis/daily?date=${date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}&model=${model}`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      const analysis_result = await response.json();
      setAnalysis(analysis_result.analysis);
      console.log(analysis_result)
    } catch (err) {
      console.error("Error fetching analysis:", err);
    }
  };

  // Analysis
  const [model, setModel] = useState("gemini");
  const [analysis, setAnalysis] = useState("");

  const ANALYSIS_URL = process.env.NEXT_PUBLIC_API_URL

  // Fetch initial fakultas options
  useEffect(() => {
    const fetchFakultas = async () => {
      try {
        const response = await fetch(`${ANALYSIS_URL}/api/get-fakultas`);
        if (!response.ok) throw new Error('Failed to fetch fakultas');
        var data = await response.json();
        data.fakultas = data.fakultas.filter((fakultas: Option) => fakultas.value !== "-");
        setFakultasOptions(data.fakultas || []);
      } catch (err) {
        console.error("Error fetching fakultas:", err);
      }
    };
    fetchFakultas();
  }, [ANALYSIS_URL]);


  // Fetch gedung options when fakultas changes
  useEffect(() => {
    const fetchGedung = async () => {
      try {
        var response;
        if (fakultas === "all") {
          response = await fetch(`${ANALYSIS_URL}/api/get-gedung?fakultas=-`);
        }
        else {
          response = await fetch(`${ANALYSIS_URL}/api/get-gedung?fakultas=${fakultas}`);
        }

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
  }, [ANALYSIS_URL, fakultas]);

  // Fetch lantai options when gedung changes
  useEffect(() => {
    if (gedung === "all") {
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
        var data = await response.json();
        data.lantai = data.lantai.filter((lantai: Option) => lantai.value !== "Total");
        setLantaiOptions(data.lantai || []);
        setLantai("all");
      } catch (err) {
        console.error("Error fetching lantai:", err);
      }
    };
    fetchLantai();
  }, [ANALYSIS_URL, gedung, fakultas]);


  // Fetch data when filters change
  useEffect(() => {
    setData(null);
    setAnalysis("");
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
        setComparison(
          [
            data.today_data.total_daya - data.prev_month_data.day_daya,
            data.today_data.total_cost - data.prev_month_data.day_cost,
          ]
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };


    fetchData();

    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(fetchData, 15 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [date, fakultas, gedung, lantai]);

  useEffect(() => {
    setAnalysis("")
    fetchAnalysis()
  }, [data, date, fakultas, gedung, lantai, model])


  // Prepare chart data for clustered column chart
  const chartData = data?.chart_data.map(item => ({
    time: formatTimestamp(item.timestamp),
    R: item.R,
    S: item.S,
    T: item.T
  })) || [];

  return (
    <motion.div className="grid grid-cols-5 gap-4" initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // speed slower
      transition={{ duration: 1 }}
      >
      <Card className="col-span-5 lg:col-span-4">
        <CardHeader className="mb-4 py-3">
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            <Calendar className="mr-3 h-6 w-6 text-cyan-600 dark:text-cyan-400" /> Daily Usage
          </CardTitle>
        </CardHeader>
        <CardContent>

          <div className="">
            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2 border rounded-md text-sm dark:bg-slate-900/10 
                dark:border-slate-700/50  text-slate-900 dark:text-slate-100 foc
                us:outline-none focus:ring focus:ring-slate-500 
                focus:ring-opacity-50 disabled:opacity-50 hover:cursor-pointer"
                  max={getLocalDateString()}
                />
              </div>

              {/* Fakultas Select */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Faculty</label>
                <Select
                  value={fakultas}
                  onValueChange={(value) => {
                    setFakultas(value);
                    setGedung("all"); // Reset gedung when fakultas changes
                    setLantai("all"); // Reset lantai when fakultas changes
                  }}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Faculty</SelectItem>
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
                <label className="text-sm font-medium mb-1">Building</label>
                <Select
                  value={gedung}
                  onValueChange={(value) => {
                    setGedung(value);
                    setLantai("all"); // Reset lantai when gedung changes
                  }}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue
                      placeholder={
                        fakultas !== "all" ? "Select Gedung" : "Select Fakultas first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Building</SelectItem>
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
                <label className="text-sm font-medium mb-1">Floor</label>
                <Select
                  value={lantai}
                  onValueChange={setLantai}
                  disabled={gedung === "all"}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue
                      placeholder={
                        gedung !== "all" ? "Select Lantai" : "Select Gedung first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floor</SelectItem>
                    {lantaiOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-slate-100/0">.</label>
                <Button
                  onClick={() => {
                    setFakultas("all");
                    setGedung("all");
                    setLantai("all");
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Reset Filters
                </Button>
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
                    <Loader2 className="h-12 w-12 animate-spin text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex items-center justify-center mt-4 text-slate-600 dark:text-slate-300">
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
                    data ? (
                      <>
                        {/* Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                          {/* Chart Section - Clustered Column Chart */}
                          <Card>
                            <CardHeader> <CardTitle className=" font-semibold">Energy Consumption by Phase (kW)</CardTitle> </CardHeader>
                            <CardContent className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                {/* <BarChart
                                  data={chartData}
                                  margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >

                                  <XAxis stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"} dataKey="time" />
                                  <YAxis stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                      border: "none",
                                      borderRadius: "8px",
                                      padding: "8px"
                                    }}
                                    cursor={{
                                      fill: theme === "dark" ? "#1e293b" : "#f1f5f9",
                                      stroke: theme === "dark" ? "#1e293b" : "#f1f5f9",
                                      strokeWidth: 0,
                                    }}
                                  />
                                  <Legend />
                                  <Bar dataKey="R" fill="#67d790" name="Phase R" />
                                  <Bar dataKey="S" fill="#f8ba52" name="Phase S" />
                                  <Bar dataKey="T" fill="#f37474" name="Phase T" />
                                </BarChart> */}
                                <LineChart
                                  data={chartData}
                                  margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >

                                  <XAxis stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"} dataKey="time" />
                                  <YAxis stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                      border: "none",
                                      borderRadius: "8px",
                                      padding: "8px"
                                    }}
                                    cursor={{
                                      fill: theme === "dark" ? "#1e293b" : "#f1f5f9",
                                      stroke: theme === "dark" ? "#1e293b" : "#f1f5f9",
                                      strokeWidth: 0,
                                    }}
                                  />
                                  <Legend />
                                  <Line dataKey="R" stroke="#67d790" name="Phase R" strokeWidth={2} dot={false}/>
                                  <Line dataKey="S" stroke="#f8ba52" name="Phase S" strokeWidth={2} dot={false}/>
                                  <Line dataKey="T" stroke="#f37474" name="Phase T" strokeWidth={2} dot={false}/>
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                          <Card>
                                                        <CardHeader className="flex justify-between"> 
                              <CardTitle className=" font-semibold">AI-Generated Report</CardTitle> 
                              <Select
                              value={model}
                              onValueChange={((value) => {
                                setModel(value);
                              })}
                            >
                            <SelectTrigger className="py-5 mt-2 w-auto text-slate-900 dark:text-slate-100 mr-2" disabled={!analysis}>
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gemini">Gemini 2.0 Flash</SelectItem>
                                <SelectItem value="deepseek">Deepseek R1 Distill Llama 8B</SelectItem>
                                <SelectItem value="gemma">Gemma 3 4B</SelectItem>
                              </SelectContent>
                            </Select>  
                            </CardHeader>
                            <CardContent className="text-slate-900 dark:text-slate-100">
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
                                        <Loader2 className="h-12 w-12 animate-spin text-slate-600 dark:text-slate-300" />
                                      </div>
                                      <div className="flex items-center justify-center mt-4 text-slate-600 dark:text-slate-300">
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
                                          <p className="">
                                            {analysis.split("\n").map((line, index) => (
                                                <p key={index} className="">
                                                  {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, i) => {
                                                    if (part.startsWith("**") && part.endsWith("**")) {
                                                      return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
                                                    } else if (part.startsWith("*") && part.endsWith("*")) {
                                                      return <span key={i} className="italic">{part.slice(1, -1)}</span>;
                                                    }
                                                    return <span key={i}>{part}</span>;
                                                  })}
                                                </p>
                                              ))}
                                          </p>
                                          <Markdown>
                                            {analysis}
                                          </Markdown>
                                        </motion.div>
                                      )
                                    }
                                  </div>
                                )
                              }
                            </CardContent>
                          </Card>
                        </div>

                      </>

                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        {/* Chart Section - Clustered Column Chart */}
                        <Card>
                          <CardHeader> <CardTitle className=" font-semibold">Data not Available</CardTitle> </CardHeader>
                          <CardContent className="">
                            Failed to fetch data from ELISA API. Please check analysis for more information.
                          </CardContent>
                        </Card>
                        <Card>
                                                      <CardHeader className="flex justify-between"> 
                              <CardTitle className=" font-semibold">AI-Generated Report</CardTitle> 
                              <Select
                              value={model}
                              onValueChange={((value) => {
                                setModel(value);
                              })}
                            >
                            <SelectTrigger className="py-5 mt-2 w-auto text-slate-900 dark:text-slate-100 mr-2" disabled={!analysis}>
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gemini">Gemini 2.0 Flash</SelectItem>
                                <SelectItem value="deepseek">Deepseek R1 Distill Llama 8B</SelectItem>
                                <SelectItem value="gemma">Gemma 3 4B</SelectItem>
                              </SelectContent>
                            </Select>  
                            </CardHeader>
                            <CardContent className="text-slate-900 dark:text-slate-100">
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
                                      <Loader2 className="h-12 w-12 animate-spin text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div className="flex items-center justify-center mt-4 text-slate-600 dark:text-slate-300">
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
                                        <p className="">
                                           {analysis.split("\n").map((line, index) => (
                                                <p key={index} className="">
                                                  {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, i) => {
                                                    if (part.startsWith("**") && part.endsWith("**")) {
                                                      return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
                                                    } else if (part.startsWith("*") && part.endsWith("*")) {
                                                      return <span key={i} className="italic">{part.slice(1, -1)}</span>;
                                                    }
                                                    return <span key={i}>{part}</span>;
                                                  })}
                                                </p>
                                              ))}
                                        </p>
                                      </motion.div>
                                    )
                                  }
                                </div>
                              )
                            }
                          </CardContent>
                        </Card>
                      </div>
                    )
                  }
                </motion.div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {data && (
        <>
          <motion.div className="col-span-5 lg:col-span-1" initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <Card className="mb-4">
              <CardHeader className="pt-1">
                <CardTitle className="font-semibold text-slate-900 dark:text-slate-100">
                  {
                    comparison[0] > 0 ? (
                      <ArrowDownRight className="mr-2 h-5 w-5 text-rose-600 dark:text-rose-500 -mt-1" />
                    ) : (
                      <ArrowUpRight className="mr-2 h-5 w-5 text-green-500 dark:text-green-400 -mt-1" />
                    )
                  }
                  Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div>
                  <p className="font-medium text-xs">Daily Total (Difference)</p>
                  <p className="font-semibold text-lg mt-1">Rp{formatNumber(comparison[1], 0)}</p>
                  <p className="">{formatNumber(comparison[0])} kWh</p>
                  {
                    comparison[0] > 0 ? (
                      <p className="mt-2 font-medium text-xs text-rose-600 dark:text-rose-500">Increase in energy cost compared to last month{"'"}s average</p>
                    ) : (
                      <p className="mt-2 font-medium text-xs text-green-500 dark:text-green-400">Reduction in energy cost compared to last month{"'"}s average</p>
                    )
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pt-1">
                <CardTitle className="font-semibold text-slate-900 dark:text-slate-100">
                  <FileChartColumnIncreasing className="mr-2 -mt-1 h-5 w-5 text-cyan-600 dark:text-cyan-400" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <h3 className=" text-xs font-medium text-cyan-600 dark:text-cyan-400">Daily Total</h3>
                    <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.today_data.total_cost, 0)}</p>
                    <p className="">{formatNumber(data.today_data.total_daya)} kWh</p>
                  </div>
                  <div>
                    <h3 className=" text-xs font-medium text-cyan-600 dark:text-cyan-400">Hourly Average</h3>
                    <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.today_data.avg_cost, 0)}</p>
                    <p className="">{formatNumber(data.today_data.avg_daya)} kWh</p>
                  </div>
                  <div>
                    <h3 className=" text-xs font-medium text-amber-500 dark:text-amber-400">Prev. Month{"'"}s Total</h3>
                    <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.prev_month_data?.total_cost, 0)}</p>
                    <p className="">{formatNumber(data.prev_month_data?.total_daya)} kWh</p>
                  </div>
                  <div>
                    <h3 className=" text-xs font-medium text-amber-500 dark:text-amber-400">Prev. Month{"'"}s Daily Average</h3>
                    <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.prev_month_data?.day_cost, 0)}</p>
                    <p className="">{formatNumber(data.prev_month_data?.day_daya)} kWh</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Table Section */}
          <motion.div className="col-span-5 lg:col-span-4" initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>


            <Card className="">
              <CardHeader> <CardTitle className=" font-semibold">Hourly Data</CardTitle> </CardHeader>
              <CardContent className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="">
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
                        <TableCell>{formatNumber(item.energy)} kWh</TableCell>
                        <TableCell>Rp{formatNumber(item.cost, 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}