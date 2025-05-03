"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeatMapGrid } from "react-grid-heatmap";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-themed";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  // Filter states
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(today.getDate() - 6); // 6 days before today

    // Format as 'YYYY-MM-DD' (local time)
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      start: formatDate(start),
      end: formatDate(end),
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

  const ANALYSIS_URL = process.env.NEXT_PUBLIC_API_URL

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
    const xLabels = Array(24).fill(0).map((_, i) => `${i}`);
    // first three letters of the day names
    const yLabels = dayNames.map(day => day.slice(0, 3));

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
        data.lantai = data.lantai.filter((lantai: Option) => lantai.value !== "Total");;
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
    setData(null);
    setAnalysis("");

    const fetchData = async () => {
      setLoading(true);
      try {
        const fakultas_data = fakultas === "all" ? "" : fakultas;
        const gedung_data = gedung === "all" ? "" : gedung;
        const lantai_data = lantai === "all" ? "" : lantai;

        const url = `${ANALYSIS_URL}/api/heatmap?start=${dateRange.start}&end=${dateRange.end}&faculty=${fakultas_data}&building=${gedung_data}&floor=${lantai_data}`;

        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data: HeatmapData = await response.json();
        setData(data);
      } catch (err) {
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
  }, [dateRange, fakultas, gedung, lantai]);

  // Handle date range change (always adjust to full week)
  const handleDateChange = (newDate: string) => {
    const date = new Date(newDate);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End of week (Saturday)

    // Format dates in YYYY-MM-DD (local time)
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setDateRange({
      start: formatDate(start),
      end: formatDate(end),
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>

      <Card>
        <CardHeader className="mb-4 py-3">
          <CardTitle className="text-2xl font-semibold  text-slate-900 dark:text-slate-100">
            <Flame className="mr-3 h-6 w-6 text-cyan-600 dark:text-cyan-400" /> Weekly Usage Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>

          <div className="">
            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Week Starting</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="p-2 border rounded-md text-sm dark:bg-slate-900/10 
                dark:border-slate-700/50  text-slate-900 dark:text-slate-100 foc
                us:outline-none focus:ring focus:ring-slate-500 
                focus:ring-opacity-50 disabled:opacity-50 hover:cursor-pointer"
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
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
                <label className="text-sm font-medium mb-1  text-slate-900 dark:text-slate-100/0">.</label>
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
                        {/* Heatmap Section */}
                        <Card className="mb-6">
                          <CardHeader> <CardTitle className=" font-semibold">
                            Energy Usage Heatmap ({new Date(data.dates.start).toLocaleDateString()} - {new Date(data.dates.end).toLocaleDateString()})
                          </CardTitle> </CardHeader>
                          <CardContent className="p-4">
                            <HeatMapGrid
                              data={heatmapData}
                              xLabels={xLabels}
                              yLabels={yLabels}
                              cellHeight="2rem"
                              cellStyle={(_x, _y, ratio) => {
                                // Determine color based on clustered thresholds
                                let color;
                                if (ratio == 0) {
                                  if (theme === "dark") {
                                    color = [15, 23, 42]
                                  }
                                  else {
                                    color = [240, 240, 240]
                                  }

                                }
                                else if (ratio <= 0.33) {
                                  color = [103, 215, 144];  // Green - low usage
                                } else if (ratio <= 0.66) {
                                  color = [248, 186, 82];   // Yellow - medium usage
                                } else {
                                  color = [243, 116, 116];  // Red - high usage
                                }

                                return {
                                  background: `rgb(${color.join(',')})`,
                                 
                                  transition: "background-color 0.2s ease", // Optional for hover effects
                                  border: "0px",
                                  margin: "1px"
                                };
                              }}
                              cellRender={(y, x, value) => (
                                <TooltipProvider delayDuration={0}>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="h-full w-full hover:bg-slate-900/20 hover:block h-full" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="dark:bg-slate-900 dark:text-slate-100 border-0">
                                      <div className=" gap-1">
                                        <div className="flex gap-2 items-center">
                                          <span className="">Hour {xLabels[x]}</span>
                                          <span className="dark:text-slate-400">|</span>
                                          <span className="">{yLabels[y]}</span>
                                        </div>
                                        <div className="">
                                          <span className="text-cyan-500 dark:text-cyan-400">
                                            {(value?.toFixed(2) || 0)} kWh
                                          </span>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              xLabelsStyle={(index) => ({
                                fontSize: "0.8rem",
                                textTransform: "uppercase",
                                color: theme === "dark" ? "#dbe1e9" : "#0f1418"
                              })}
                              yLabelsStyle={() => ({
                                fontSize: "0.8rem",
                                textTransform: "uppercase",
                                color: theme === "dark" ? "#dbe1e9" : "#0f1418"
                              })}
                            />
                            <div className="flex justify-between my-4 text-sm">
                              <span>Lowest: {minValue.toFixed(2)} kWh</span>
                              <span>Highest: {maxValue.toFixed(2)} kWh</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="rounded-lg">
                          <CardHeader> <CardTitle className=" font-semibold">AI-Generated Report</CardTitle> </CardHeader>
                          <CardContent className="overflow-y-auto">
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

                      </>
                    ) : (
                      <div className="grid g rid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chart Section - Clustered Column Chart */}
                        <div className="mb-8 rounded-lg shadow-md">
                          <CardHeader> <CardTitle className=" font-semibold">Data not Available</CardTitle> </CardHeader>
                          <CardContent className="">
                            Failed to fetch data from ELISA API. Please check analysis for more information.
                          </CardContent>
                        </div>
                        <div className="mb-8 rounded-lg shadow-md">
                          <CardHeader> <CardTitle className=" font-semibold">AI-Generated Report</CardTitle> </CardHeader>
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
                        </div>
                      </div>
                    )

                  }
                </motion.div>
              </>)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}