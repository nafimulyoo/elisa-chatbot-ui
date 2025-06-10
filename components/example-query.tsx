import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card-themed";

export const ExampleQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  var suggestionQueries: any = [];
  suggestionQueries = [
    ["Apa itu ELISA?", "Basic Knowledge"],
    ["Plot penggunaan ITB Kampus Jakarta bulan lalu", "Data Not Available"],
    ["Bagaimana tren penggunaan Fakultas Kedokteran?", "Data Not Available"],
    ["Bagaimana tren penggunaan ITB sejak tahun lalu?", "Basic Analysis"],
    ["Bandingkan penggunaan bulanan SF dan FMIPA semester lalu", "Basic Analysis"],
    ["Jam puncak penggunaan Labtek VI dan FTI seminggu terakhir", "Basic Analysis"],
    ["Jam terendah penggunaan Labtek X dan FITB bulan lalu", "Basic Analysis"],
    ["Rata-rata penggunaan harian Labtek VI di lantai 3", "Basic Analysis"],
    ["Prediksi jam puncak FTI minggu depan", "Advanced Analysis"],
  ];
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
            Example Queries
          </CardTitle>
        </CardHeader>
        {/* spaced gap 2 */}
        <CardContent className="rounded-lg overflow-hidden overflow-x-auto space-y-2">
          {suggestionQueries.map((suggestion: any, index: any) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              onClick={() => handleSuggestionClick(suggestion[0])}
              className="text-left mr-2"
            >
              {suggestion[0]}
            </Button>

          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};