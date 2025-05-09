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
import { Building2, FileChartColumnIncreasing, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-themed";
import { useTheme } from "next-themes";
import { formatNumber } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

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
      total: number;
      cost: number;
    };
    average: {
      average: number;
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
const ANALYSIS_URL = process.env.NEXT_PUBLIC_API_URL

const getLocalYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  return `${year}-${month}`;
};


export default function FacultyComparison() {
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<FacultyComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state - default to current month
  const searchParams = useSearchParams();

  const [month, setMonth] = useState(searchParams.get('date') || getLocalYearMonth());

  // Sort state
  const [sortField, setSortField] = useState<keyof FacultyComparisonData['info'][0]>("energy");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Analysis
  const [model, setModel] = useState("gemini");
  const [analysis, setAnalysis] = useState("");

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`${ANALYSIS_URL}/api/analysis/faculty?date=${month}&model=${model}`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      const analysis_result = await response.json();
      setAnalysis(analysis_result.analysis);
      console.log(analysis_result)
    } catch (err) {
      console.error("Error fetching analysis:", err);
    }
  };


  // fetch analysis using useEffect
  // Fetch data when month changes
  useEffect(() => {
    setData(null);
    setAnalysis("");

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${ANALYSIS_URL}/api/compare?date=${month}`;
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

    

    const fetchAll = async () =>     fetchData();

    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(fetchData, 60 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [month, ANALYSIS_URL]);

  useEffect(() => {
    setAnalysis("")
    fetchAnalysis()
  }, [data, month, model])

  // Sort the info data
  const sortedInfo = data?.info ? [...data.info].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }) : [];

  const chartData = data?.value
    .sort((a, b) => b.energy - a.energy) || [];

  return (
    <motion.div className="grid grid-cols-5 gap-4" initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <Card className="col-span-5 lg:col-span-4">
        <CardHeader className="mb-4 py-3">
          <CardTitle className="text-2xl font-semibold text-slate-800  dark:text-slate-100">
            <Building2 className="mr-3 h-6 w-6 text-cyan-600 dark:text-cyan-400" /> Faculty Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="">
            {/* Filter Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Month</label>

                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="p-2 border rounded-md w-full text-sm dark:bg-slate-900/10 
                dark:border-slate-700/50  text-slate-900 dark:text-slate-100 foc
                us:outline-none focus:ring focus:ring-slate-500 
                focus:ring-opacity-50 disabled:opacity-50 hover:cursor-pointer"
                  max={getLocalYearMonth()}
                />
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
                        {/* Horizontal Bar Chart */}
                        <Card className="mb-8">
                          <CardHeader>
                            <CardTitle className="font-semibold">Faculties by Energy Consumption (kWh)</CardTitle>
                          </CardHeader>
                          <CardContent className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{
                                  top: 20,
                                  right: 70,
                                  left: 0,
                                  bottom: 20,
                                }}
                              >
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px",
                                  }}
                                  cursor={{
                                    fill: theme === "dark" ? "#1e293b" : "#f1f5f9",
                                    stroke: theme === "dark" ? "#1e293b" : "#f1f5f9",
                                    strokeWidth: 0,
                                  }}
                                />
                                <XAxis
                                  type="number"
                                  stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
                                />
                                <YAxis
                                  dataKey="fakultas"
                                  type="category"
                                  width={50}
                                  stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
                                  tick={{ fontSize: 12 }}
                                />
                                <Legend
                                  wrapperStyle={{ color: '#f1f5f9' }} // slate-100 for legend text
                                />
                                <Bar dataKey="energy" fill="#1e9bb9" name="Energy (kWh)">

                                </Bar>

                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card className="mb-8">
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
      {
        data && (
          <>

            <motion.div className="col-span-5 lg:col-span-1" initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <Card>
                <CardHeader className="pt-1">
                  <CardTitle className="font-semibold text-slate-900 dark:text-slate-100">
                    <FileChartColumnIncreasing className="mr-2 -mt-1 h-5 w-5 text-cyan-600 dark:text-cyan-400" /> Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div>
                      <h3 className=" text-xs font-medium text-cyan-600 dark:text-cyan-400">Monthly Total</h3>
                      <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.data.total?.cost, 0)}</p>
                      <p>{formatNumber(data.data.total?.total)} kWh</p>
                    </div>
                    <div>
                      <h3 className=" text-xs font-medium text-cyan-600 dark:text-cyan-400">Daily Average</h3>
                      <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.data.average?.cost, 0)}</p>
                      <p>{formatNumber(data.data.average?.average)} kWh</p>
                    </div>
                    <div>
                      <h3 className=" text-xs font-medium text-rose-600 dark:text-rose-500">Highest: {data.data.max.fakultas}</h3>
                      <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.data.max.cost, 0)}</p>
                      <p>{formatNumber(data.data.max.energy)} kWh</p>
                    </div>
                    <div>
                      <h3 className=" text-xs font-medium text-green-600 dark:text-green-400">Lowest: {data.data.min.fakultas}</h3>
                      <p className="font-semibold text-lg mt-1">Rp{formatNumber(data.data.min.cost, 0)}</p>
                      <p>{formatNumber(data.data.min.energy)} kWh</p>
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
                <CardHeader> <CardTitle className=" font-semibold">Detailed Faculty Data</CardTitle> </CardHeader>
                <CardContent className="rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="">
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
                          <TableCell>{(item.energy / item.students).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )
      }
    </motion.div>
  );
}