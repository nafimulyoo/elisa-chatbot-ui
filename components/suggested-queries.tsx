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
    ["Apa itu ELISA?", "Basic Knowledge"],
    ["Bagaimana cara ELISA mengidentifikasi pemborosan energi di ITB?", "Basic Knowledge"],
    ["Bagaimana cuaca hari ini?", "Unrelevant"],
    ["Apa warna favoritmu?", "Unrelevant"],
    ["Plot penggunaan ITB Kampus Jakarta bulan lalu", "Data Not Available"],
    ["Bagaimana tren penggunaan Fakultas Kedokteran?", "Data Not Available"],
    ["Bagaimana tren penggunaan ITB sejak tahun lalu?", "Basic Analysis"],
    ["Bandingkan penggunaan bulanan SF dan FMIPA semester lalu", "Basic Analysis"],
    ["Berapa pemakaian tertinggi, terendah, dan anomali di Labtek X pada dua minggu terakhir?", "Basic Analysis"],
    ["3 fakultas teratas yang paling banyak menggunakan energi dalam 3 bulan terakhir", "Basic Analysis"],
    ["Jam puncak penggunaan Labtek VI dan FTI seminggu terakhir", "Basic Analysis"],
    ["Jam terendah penggunaan Labtek X dan FITB bulan lalu", "Basic Analysis"],
    ["Rata-rata penggunaan harian Labtek VI di lantai 3", "Basic Analysis"],
    ["Perkiraan penggunaan energi listrik ITB satu bulan kedepan, dengan tidak melupakan hari libur nasional", "Advanced Analysis"],
    ["Prediksi jam puncak Labtek VI, Labtek X, dan FTI minggu depan", "Advanced Analysis"],
    ["Prediksi FTI atau FITB yang paling boros di jam 12 siang besok", "Advanced Analysis"],
    ["Prediksi jam yang paling hemat energi listrik di ITB bulan depan", "Advanced Analysis"],
    ["Perkirakan total konsumsi energi ITB untuk kuartal berikutnya, dengan mempertimbangkan data historis dan variasi musiman.", "Advanced Analysis"],
    ["Prediksi fakultas yang paling hemat energi listrik di ITB pekan depan", "Advanced Analysis"],
    ["Prediksi total pemakaian energi listrik di ITB pada Oktober 2025", "Advanced Analysis"],
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