import { DynamicChart } from "./dynamic-chart";
import { motion } from "framer-motion";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Download,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-themed";
import { Markdown } from "./markdown";

export const Results = ({
  data,
  columns,
  visualizationType,
  explanation
}: {
  data: any[];
  columns: string[];
  visualizationType: any;
  explanation: string;
}) => {
  const formatColumnTitle = (title: string) => {
    return title
      .split("_")
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
      )
      .join(" ");
  };

  // console.log("Data:", data);
  // console.log("Columns:", columns);
  // console.log("Visualization Type:", visualizationType);

  const formatCellValue = (column: string, value: any) => {
    if (column.toLowerCase().includes("valuation")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "";
      }
      const formattedValue = parsedValue.toFixed(2);
      const trimmedValue = formattedValue.replace(/\.?0+$/, "");
      return `$${trimmedValue}B`;
    }
    if (column.toLowerCase().includes("rate")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "";
      }
      const percentage = (parsedValue * 100).toFixed(2);
      return `${percentage}%`;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  const exportToCSV = () => {
    // Prepare CSV content
    const headers = columns.join(',') + '\n';
    const rows = data.map(row =>
      columns.map(column => {
        // Get the formatted value
        const formattedValue = formatCellValue(column, row[column]);
        // Escape quotes and wrap in quotes if contains commas
        return formattedValue.includes(',')
          ? `"${formattedValue.replace(/"/g, '""')}"`
          : formattedValue;
      }).join(',')
    ).join('\n');

    const csvContent = headers + rows;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'analysis_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      className="mb-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className=" font-semibold h-9">
            <div className="flex justify-between">
              Analysis Result
              {
                data && (
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-2 gap-2 dark:text-slate-200 text-slate-700"
                  >
                    <Download className="h-5 w-5 pb-0.5" />
                    Export to CSV
                  </Button>
                )
              }
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="">
            <Markdown>
              {explanation}
            </Markdown>
          </div>
          <div className="flex-grow flex flex-col">
            {
              data && (
                <Tabs defaultValue="charts" className="w-full flex-grow flex flex-col mt-8">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="charts">Chart</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                  </TabsList>
                  <TabsContent value="charts" className="flex-grow overflow-auto">
                    <div className="mt-4">
                      {
                        visualizationType && (
                          <DynamicChart chartData={data} visualizationType={visualizationType} />
                        )
                      }
                    </div>
                  </TabsContent>
                  <TabsContent value="table" className="flex-grow">
                    <div className="relative overflow-auto max-h-[500px]">
                      <Table className="">
                        <TableHeader className="">
                          <TableRow>
                            {columns.map((column, index) => (
                              <TableHead
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                              >
                                {formatColumnTitle(column)}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody className="">
                          {data.map((row, index) => (
                            <TableRow key={index} className="hover:bg-muted">
                              {columns.map((column, cellIndex) => (
                                <TableCell
                                  key={cellIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                                >
                                  {formatCellValue(
                                    column,
                                    row[column],
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              )
            }
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};