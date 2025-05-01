import { motion } from "framer-motion";
import { Button } from "./ui/button";

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  var suggestionQueries: any = [];
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "development") {
    suggestionQueries = [
      ["What is ELISA", "Basic Knowledge"],
      ["Bagaimana cara ELISA mengidentifikasi pemborosan energi di ITB?", "Basic Knowledge"],
      ["What is the weather like today", "Unrelevant"],
      ["What is your favorite color", "Unrelevant"],
      ["Plot ITB Kampus Jakarta usage last month", "Data Not Available"],
      ["What is the usage trend of Fakultas Kedokteran", "Data Not Available"],
      ["What is the usage trend of ITB since last year", "Basic Analysis"],
      ["Compare SF and FMIPA monthly usage last semester", "Basic Analysis"],
      ["Gedung Labtek VI highest, lowest, and anomalies last two weeks ", "Basic Analysis"],
      ["Top 3 faculty usage in the last 3 months", "Basic Analysis"],
      ["Labtek VI and FTI peak hours usage in the last week", "Basic Analysis"],
      ["Forecast CC Barat usage during holidays", "Advanced Analysis"],
      ["Predict Labtek VI, Labtek X, and FTI peak hours next week", "Advanced Analysis"],
      ["Forecast pemakaian energi listrik ITB satu bulan kedepan, dengan tidak melupakan hari libur nasional", "Advanced Analysis"],
      ["Predict FTI usage during next major event", "Advanced Analysis"],
    ]
  }
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
    suggestionQueries = [
      ["What is ELISA", "Basic Knowledge"],
      ["Bagaimana cara ELISA mengidentifikasi pemborosan energi di ITB?", "Basic Knowledge"],
      ["What is the weather like today", "Unrelevant"],
      ["What is your favorite color", "Unrelevant"],
      ["Plot ITB Kampus Jakarta usage last month", "Data Not Available"],
      ["What is the usage trend of Fakultas Kedokteran", "Data Not Available"],
      ["What is the usage trend of ITB since last year", "Basic Analysis"],
      ["Compare SF and FMIPA monthly usage last semester", "Basic Analysis"],
      ["Gedung Labtek X highest, lowest, and anomalies last two weeks ", "Basic Analysis"],
      ["Top 3 faculty usage in the last 3 months", "Basic Analysis"],
      ["Labtek VI and FTI peak hours usage in the last week", "Basic Analysis"],
      ["Forecast CC Barat usage during holidays", "Advanced Analysis"],
      ["Predict Labtek VI, Labtek X, and FTI peak hours next week", "Advanced Analysis"],
      ["Forecast pemakaian energi listrik ITB satu bulan kedepan, dengan tidak melupakan hari libur nasional", "Advanced Analysis"],
      ["Predict FTI usage during next major event", "Advanced Analysis"],
    ]
  }

  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto"
    >
      <h2 className="text-lg sm:text-lg font-semibold text-foreground mb-4 text-gray-700">
        Test cases:
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Case
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Query
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suggestionQueries.map((suggestion: any, index: any) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {suggestion[1]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion[0])}
                    className="text-left"
                  >
                    {suggestion[0]}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};