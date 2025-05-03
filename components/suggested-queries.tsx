import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card-themed";

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  var suggestionQueries: any = [];
  suggestionQueries = [
    ["What is ELISA?", "Basic Knowledge"],
    ["Bagaimana cara ELISA mengidentifikasi pemborosan energi di ITB?", "Basic Knowledge"],
    ["What is the weather like today?", "Unrelevant"],
    ["What is your favorite color?", "Unrelevant"],
    ["Plot ITB Kampus Jakarta usage last month", "Data Not Available"],
    ["What is the usage trend of Fakultas Kedokteran?", "Data Not Available"],
    ["What is the usage trend of ITB since last year?", "Basic Analysis"],
    ["Compare SF and FMIPA monthly usage last semester", "Basic Analysis"],
    ["Gedung Labtek X highest, lowest, and anomalies last two weeks ", "Basic Analysis"],
    ["Top 3 faculty usage in the last 3 months", "Basic Analysis"],
    ["Labtek VI and FTI peak hours usage in the last week", "Basic Analysis"],
    ["Peak hours usage of Labtek VI and FTI last week", "Basic Analysis"],
    ["Average daily usage of Labtek VI on the 3rd floor", "Basic Analysis"],
    ["Predict Labtek VI, Labtek X, and FTI peak hours next week", "Advanced Analysis"],
    ["Forecast pemakaian energi listrik ITB satu bulan kedepan, dengan tidak melupakan hari libur nasional", "Advanced Analysis"],
  ]
  
  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto"
    >
      <Card >
        <CardHeader>
          <CardTitle className=" font-semibold">
            Test cases
          </CardTitle>
        </CardHeader>
        <CardContent className="rounded-lg overflow-hidden overflow-x-auto p-0">
          <Table className="min-w-full">
            <TableHeader >
              <TableRow className="hover:bg-transparent">
                <TableHead>
                  No.
                </TableHead>
                <TableHead>
                  Case
                </TableHead>
                <TableHead>
                  Test Query
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {suggestionQueries.map((suggestion: any, index: any) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell className="">
                    {index + 1}
                  </TableCell>
                  <TableCell className="">
                    {suggestion[1]}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSuggestionClick(suggestion[0])}
                      className="text-left"
                    >
                      {suggestion[0]}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};