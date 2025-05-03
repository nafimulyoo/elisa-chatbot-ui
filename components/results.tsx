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

  console.log("Data:", data);
  console.log("Columns:", columns);
  console.log("Visualization Type:", visualizationType);

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
      <div className="rounded-xl border border-border bg-card sm:p-8 flex flex-col flex-grow mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-lg font-semibold text-foreground text-gray-700">
            Analysis Results:
          </h2>
        {
           data && (
          <Button 
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="ml-4 flex items-center gap-2"
          >
            <Download className="h-5 w-5 pb-0.5" />
            Export to CSV
          </Button>
          )
        }
        </div>
        <div className="text-muted-foreground">
            {explanation.split("\n").map((line, index) => (
              <p key={index} className="text-muted-foreground mb-2">
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
                visualizationType &&  (
                  <DynamicChart chartData={data} visualizationType={visualizationType} />
                )
              }
            </div>
          </TabsContent>
          <TabsContent value="table" className="flex-grow">
            <div className="relative overflow-auto max-h-[500px]">
              <Table className="min-w-full divide-y divide-border">
                <TableHeader className="bg-secondary sticky top-0 shadow-sm">
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
                <TableBody className="bg-card divide-y divide-border">
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
    </div>
    </motion.div>
  );
};