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
import { Activity, Car, Loader2, FileChartColumnIncreasing, TrendingUp, ArrowUpRight, MoveUpRight, ArrowUpDown, ArrowDownRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-themed";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { formatNumber } from "@/lib/utils";

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
    total_cost: number;
    day_daya: number;
    day_cost: number;
    hour_daya: number;
    hour_cost: number;
  };
}

interface Option {
  value: string;
  label: string;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};


const ANALYSIS_URL = process.env.NEXT_PUBLIC_API_URL

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {

  const { theme, setTheme } = useTheme();

  const [data, setData] = useState<ElisaData | null>(null);
  const [comparison, setComparison] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Filter states
  const [date, setDate] = useState(getLocalDateString());
  const [fakultas, setFakultas] = useState("all");
  const [gedung, setGedung] = useState("all");
  const [lantai, setLantai] = useState("all");

  // Options states
  const [fakultasOptions, setFakultasOptions] = useState<Option[]>([]);
  const [gedungOptions, setGedungOptions] = useState<Option[]>([]);
  const [lantaiOptions, setLantaiOptions] = useState<Option[]>([]);

  // Analysis
  const [analysis, setAnalysis] = useState("");



  // Fetch initial fakultas options

  useEffect(() => {
    const fetchFakultas = async () => {
      try {
        const response = await fetch(`${ANALYSIS_URL}/api/get-fakultas`);
        if (!response.ok) throw new Error("Failed to fetch fakultas");
        var data = await response.json();
        data.fakultas = data.fakultas.filter((fakultas: Option) => fakultas.value !== "-");
        setFakultasOptions(data.fakultas || []);
      } catch (err) {
        console.error("Error fetching fakultas:", err);
      }
      
    };
    fetchFakultas();
  }, []);

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
    }, [fakultas]);
  
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
    }, [gedung, fakultas]);

  useEffect(() => {
    setData(null);
    setAnalysis("");

    // current date in YYYY-MM-DD format without hour
    setLoading(true);
    const current_date = getLocalDateString();
    setDate(current_date);
    const fetchAnalysis = async () => {
      try {
        setAnalysis("");
        // delay 0.5 - 2 seconds
        const delay = Math.floor(Math.random() * 1000) + 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const response = await fetch(
          `${ANALYSIS_URL}/api/analysis/now?faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`,
        );
        if (!response.ok) throw new Error("Failed to fetch analysis");
        const analysis_result = await response.json();
        setAnalysis(analysis_result.analysis);
        console.log(analysis_result);
      } catch (err) {
        console.error("Error fetching analysis:", err);
      }
    };

    const fetchData = async () => {
      setError(null);
      const fakultas_data = fakultas === "all" ? "" : fakultas;
      const gedung_data = gedung === "all" ? "" : gedung;
      const lantai_data = lantai === "all" ? "" : lantai;

      try {
        const url = `${ANALYSIS_URL}/api/now?date=${current_date}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`;

        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data: ElisaData = await response.json();
        setData(data);
        setComparison(
          [
            data.today_data.avg_daya - data.prev_month_data.hour_daya,
            data.today_data.avg_cost - data.prev_month_data.hour_cost,
          ]
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };


    const fetchAll = async () => {
      fetchData();
      fetchAnalysis();
    };

    fetchAll();

    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(fetchAll, 1 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [date, fakultas, gedung, lantai]);


  const chartData =
    data?.chart_data.map((item) => ({
      ...item,
      formattedTime: formatTimestamp(item.timestamp),
    })) || [];

  // Calculate the minimum power value in the chart data
  const minPower = chartData.reduce(
    (min, item) => Math.min(min, item.power),
    Infinity,
  );

  const maxPower = chartData.reduce(
    (max, item) => Math.max(max, item.power),
    -Infinity,
  );

  // Floor to 2 decimal places
  const minPowerRounded = Math.floor(minPower * 100) / 100;
  const maxPowerRounded = Math.ceil(maxPower * 100) / 100;
  // Calculate the bottom domain value (90% of the minimum power)
  const bottomDomain = Math.floor(minPower * 0.98)
  const topDomain = Math.ceil(maxPower * 1.02)

  return (
    <motion.div className="grid grid-cols-5 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
      <Card className="col-span-5 lg:col-span-4 ">
        <CardHeader className="mb-4 py-3">
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            <Activity className="mr-3 h-6 w-6 text-cyan-600 dark:text-cyan-400" /> Last Hour's Usage
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
                  className="p-2 border rounded-md text-sm dark:bg-slate-900/50 dark:border-slate-700/50  text-slate-900 dark:text-slate-100 focus:outline-none focus:ring focus:ring-slate-500 focus:ring-opacity-50 disabled:opacity-50"
                  disabled
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
                    <SelectItem value="all">All Unit</SelectItem>
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
                <label className="text-sm font-medium mb-1  text-slate-900 dark:text-slate-100/0">.</label>
                <Button
                  onClick={() => {
                    setFakultas("all");
                    setGedung("all");
                    setLantai("all");
                  }}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 border text-slate-900 dark:text-slate-100 py-2 px-4 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200 ease-in-out focus:outline-none  focus:ring-slate-500 focus:ring-opacity-50 font-normal"
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
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                          {/* Chart Section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className=" font-semibold">
                                Power Consumption Since Last Hour (kW)
                              </CardTitle>
                            </CardHeader>
                            {/* <h2 className="text-xl font-semibold mb-4">
                        Power Consumption Since Last Hour
                      </h2> */}
                            <CardContent className="h-80" >
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                  <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#1e9bb9" stopOpacity={0.8} />
                                      <stop offset="100%" stopColor="#1e9bb9" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>

                                  <XAxis
                                    dataKey="formattedTime"
                                    tick={{ fontSize: 12 }}
                                    stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
                                    interval={Math.floor(chartData.length / 10)}
                                  />

                                  <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
                                    domain={[bottomDomain, topDomain]}
                                    tickFormatter={(value) => {
                                      const roundedValue = Math.round(value / 10) * 10;
                                      return `${roundedValue} kW`;
                                    }}
                                  />

                                  <Tooltip
                                    formatter={(value) => [`${value} kW`, "Power"]}
                                    labelFormatter={(label) => `Time: ${label}`}
                                    contentStyle={{
                                      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                      border: "none",
                                      borderRadius: "8px",
                                      padding: "8px",
                                    }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="power"
                                    strokeWidth={2}
                                    fill="url(#areaGradient)" // Using the gradient here
                                    stroke="#1e9bb9"
                                    activeDot={{ r: 8 }}
                                    name="Power Consumption"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className=" font-semibold">
                                AI-Generated Report
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="">
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
                                              {analysis}
                                            </p>
                                          </motion.div>
                                        )
                                      }
                                    </div>
                                  )
                                }
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        
                        
                      </>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {/* Chart Section - Clustered Column Chart */}
                        <Card className="mb-8 rounded-lg shadow-md">
                          <CardHeader> <CardTitle className=" font-semibold">Data not Available</CardTitle></CardHeader>
                          <CardContent className="h-80">
                            Failed to fetch data from ELISA API. Please check analysis for more information.
                          </CardContent>
                        </Card>
                        <Card className="mb-8 rounded-lg shadow-md">
                          <CardHeader> <CardTitle className=" font-semibold">AI-Generated Report</CardTitle></CardHeader>
                          <CardContent className="">
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
                                          {analysis}
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
            )

            }
            {/* {error && <p className="text-red-500 text-center">Error: {error}</p>} */}
          </div>
        </CardContent>
      </Card>
      {
        data && (
          <>
          <motion.div className="col-span-5 lg:col-span-1" initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
            {/* shadow center */}
            <Card className="mb-4 w-full">
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
                  <p className="font-medium text-xs">Last Hour's Total (Difference)</p>
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
                    <h3 className=" text-xs font-medium text-cyan-600 dark:text-cyan-400">Today{"'"}s Total</h3>
                    <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.today_data.total_cost, 0)}</p>
                    <p className="">{formatNumber(data.today_data.total_daya)} kWh</p>
                  </div>
                  <div>
                    <h3 className=" text-xs font-medium text-cyan-600 dark:text-cyan-400">Today{"'"}s Hourly Average</h3>
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
                  <div>
                    <h3 className=" text-xs font-medium text-amber-500 dark:text-amber-400">Prev. Month{"'"}s Hourly Average</h3>
                    <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.prev_month_data?.hour_cost, 0)}</p>
                    <p className="">{formatNumber(data.prev_month_data?.hour_daya)} kWh</p>
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
          <CardHeader>
            <CardTitle className=" font-semibold">
              Power Consumption Data
            </CardTitle>
          </CardHeader>
          <CardContent>

            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="">
                  <TableRow>
                    <TableHead>Timestamp (UTC+7)</TableHead>
                    <TableHead>Power</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.chart_data.slice(0, 10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatTimestamp(item.timestamp)}</TableCell>
                      <TableCell>{formatNumber(item.power)} kW</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        </>
        )
      }

    </motion.div>
  );
}
