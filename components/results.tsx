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

  return (
    <motion.div
        className="mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
      <div className="rounded-xl border border-border bg-card p- sm:p-8 flex flex-col flex-grow mt-2">
        <h2 className="text-lg sm:text-lg font-semibold text-foreground mb-4 text-gray-700">
          Analysis Results:
        </h2>
        <div className="text-muted-foreground">{explanation}</div>
        <div className="flex-grow flex flex-col">
        {
          data && (
          <Tabs defaultValue="table" className="w-full flex-grow flex flex-col mt-8">
            {
              visualizationType !== null && visualizationType !== "" ? (
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="charts">Chart</TabsTrigger>
                </TabsList>
              ) : (
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
              )
            }

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
          <TabsContent value="charts" className="flex-grow overflow-auto">
            <div className="mt-4">
              {
                visualizationType &&  (
                  <DynamicChart chartData={data} visualizationType={visualizationType} />
                )
              }
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
