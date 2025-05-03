"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from "recharts";
import { useState, useMemo } from "react";
import { useTheme } from "next-themes";

const COLORS = [
  "#06b6d4",
  "#22c55e",
  "#ef4444",
  "#facc15",
  "#8b5cf6",
  "#f97316",
  "#10b981",
  "#3b82f6"
];

interface DynamicChartProps {
  chartData: any[];
  visualizationType: string;
}

export const DynamicChart = ({
  chartData,
  visualizationType,
}: DynamicChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();

  // Memoize and transform data to ensure numeric values
  const { transformedChartData, categories, colorMap } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { transformedChartData: [], categories: [], colorMap: {} };
    }

    // Get unique categories from first column
    const firstColumn = Object.keys(chartData[0])[0];
    const uniqueCategories = Array.from(
      new Set(chartData.map((item) => String(item[firstColumn])))
    );

    // Create color mapping for categories
    const categoryColorMap: Record<string, string> = {};
    uniqueCategories.forEach((category, index) => {
      categoryColorMap[category] = COLORS[index % COLORS.length];
    });

    // Transform data ensuring numeric values for numeric columns
    const transformed = chartData.map((item) => {
      const newItem: { [key: string]: any } = {};
      for (const key in item) {
        if (Object.hasOwn(item, key)) {
          const value = item[key];
          // Attempt to convert to number, otherwise keep the original value
          const numValue = Number(value);
          newItem[key] = isNaN(numValue) ? value : numValue;
        }
      }
      return newItem;
    });

    return {
      transformedChartData: transformed,
      categories: uniqueCategories,
      colorMap: categoryColorMap,
    };
  }, [chartData]);

  // Memoize numeric columns based on transformed data (skip first column if it's categorical)
  const numericColumns = useMemo(() => {
    if (!transformedChartData || transformedChartData.length === 0) {
      return [];
    }

    const columns = Object.keys(transformedChartData[0] || {});

    // If first column is categorical (not numeric), skip it for numeric columns
    const firstColumn = columns[0];
    const isFirstColumnNumeric = typeof transformedChartData[0][firstColumn] === "number";

    return columns.filter((key, index) => {
      // Skip first column if it's not numeric
      if (index === 0 && !isFirstColumnNumeric) return false;

      return (
        typeof transformedChartData[0][key] === "number" &&
        !key.toLowerCase().includes("id") &&
        !key.toLowerCase().includes("index")
      );
    });
  }, [transformedChartData]);

  // For scatter plot, we need at least two numeric columns (after skipping first if categorical)
  const canRenderScatter = numericColumns.length >= 2;

  // Determine if we should cluster (for bar/line charts with multiple series)
  const shouldCluster = numericColumns.length > 1 &&
    (visualizationType === "bar_chart" || visualizationType === "line_chart");

  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const renderChart = () => {
    if (!transformedChartData || transformedChartData.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          No data to display.
        </div>
      );
    }

    switch (visualizationType) {
      case "line_chart":
        return (
          <LineChart data={transformedChartData}>
            <XAxis
              dataKey={Object.keys(transformedChartData[0])[0]}
              tick={{ fontSize: 12 }}
              stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
            />
            <YAxis tick={{ fontSize: 12 }}
              stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Legend />
            {shouldCluster ? (
              numericColumns.map((column, index) => (
                <Line
                  key={column}
                  type="monotone"
                  dataKey={column}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                  name={column.replace(/_/g, ' ')}
                  dot={false}
                  strokeWidth={2}
                />
              ))
            ) : (
              numericColumns.length > 0 && (
                <Line
                  type="monotone"
                  dataKey={numericColumns[0]}
                  stroke="#06b6d4"
                  activeDot={{ r: 8 }}
                  dot={false}
                  strokeWidth={2}

                />
              )
            )}
          </LineChart>
        );

      case "bar_chart":
        return (
          <BarChart data={transformedChartData}>

            <XAxis
              dataKey={Object.keys(transformedChartData[0])[0]}
              tick={{ fontSize: 12 }}
              stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
            />
            <YAxis tick={{ fontSize: 12 }}
              stroke={theme === "dark" ? "#dbe1e9" : "#0f1418"}
            />
            <Tooltip

              cursor={{
                fill: theme === "dark" ? "#1e293b" : "#f1f5f9",
                stroke: theme === "dark" ? "#1e293b" : "#f1f5f9",
                strokeWidth: 0,
              }}

              contentStyle={{
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Legend />
            {shouldCluster ? (
              numericColumns.map((column, index) => (
                <Bar
                  key={column}
                  dataKey={column}
                  fill={COLORS[index % COLORS.length]}
                  name={column.replace(/_/g, ' ')}
                  onMouseEnter={(_, idx) => handleMouseEnter(column, idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  {transformedChartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              ))
            ) : (
              numericColumns.length > 0 && (
                <Bar
                  dataKey={numericColumns[0]}
                  fill={COLORS[0]}
                  onMouseEnter={(_, idx) => handleMouseEnter(numericColumns[0], idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  {transformedChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[0]}
                    />
                  ))}
                </Bar>
              )
            )}

          </BarChart>




        );

      // case "scatter_plot":
      //   if (!canRenderScatter) {
      //     return (
      //       <div className="text-center p-8 text-muted-foreground">
      //         Not enough numeric columns for scatter plot (need at least 2 numeric columns)
      //       </div>
      //     );
      //   }

      //   // Get the first column name (for category)
      //   const firstColumn = Object.keys(transformedChartData[0])[0];

      //   return (

      //     <ScatterChart>
      //       <CartesianGrid strokeDasharray="3 3" />
      //       <XAxis 
      //         dataKey={numericColumns[0]} 
      //         name={numericColumns[0].replace(/_/g, ' ')}
      //         tick={{ fontSize: 12 }}
      //       />
      //       <YAxis 
      //         dataKey={numericColumns[1]} 
      //         name={numericColumns[1].replace(/_/g, ' ')}
      //         tick={{ fontSize: 12 }}
      //       />
      //       <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      //       <Legend />

      //       {/* Create a separate Scatter group for each category */}
      //       {categories.map((category) => (
      //         <Scatter
      //           key={category}
      //           name={category}
      //           data={transformedChartData.filter(
      //             (item) => String(item[firstColumn]) === category
      //           )}
      //           fill={colorMap[category]}
      //           onMouseEnter={(_, idx) => handleMouseEnter(category, idx)}
      //           onMouseLeave={handleMouseLeave}
      //         >
      //           {transformedChartData.map(({ [firstColumn]: _, ...rest }) => rest)
      //             .filter((item) => String(item[firstColumn]) === category)
      //             .map((entry, index) => (
      //               <Cell
      //                 key={`cell-${category}-${index}`}
      //                 fill={colorMap[category]}
      //               />
      //             ))}
      //         </Scatter>
      //       ))}
      //     </ScatterChart>
      //   );

      default:
        return (
          <div className="text-center p-8 text-muted-foreground">
            Unsupported chart type: {visualizationType}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};