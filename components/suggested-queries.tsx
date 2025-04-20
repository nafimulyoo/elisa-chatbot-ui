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
      {
        desktop: "What is ELISA",
        mobile: "What is ELISA",
      },
      {
        desktop:  "What is the usage trend of FSRD in the last 3 months",
        mobile:  "What is the usage trend of FSRD in the last 3 months",
      },
      {
        desktop: "Total ITB usage over the past month",
        mobile: "Total ITB usage over the past month",
      },
      {
        desktop: "Top 3 faculty usage in the last 3 months",
        mobile: "Top 3 faculty usage in the last 3 months",
      },
      {
        desktop: "Forecast CC Barat usage during holidays",
        mobile: "CC Barat holiday forecast",
      },
      {
        desktop: "Predict Labtek VI peak hours next week",
        mobile: "Labtek VI peak forecast",
      },
      {
        desktop: "Average Engineering Physics Building usage during summer",
        mobile: "Engineering Physics summer usage",
      },
      {
        desktop: "Compare STEI usage: weekdays vs weekends",
        mobile: "STEI weekdays vs weekends",
      },
      {
        desktop: "Forecast ITB usage for next academic year",
        mobile: "ITB yearly forecast",
      },
      {
        desktop: "Labtek III usage trends last 3 semesters",
        mobile: "Labtek III trends",
      },
      {
        desktop: "Predict FTI usage during next major event",
        mobile: "FTI event forecast",
      },
      {
        desktop: "Compare CC Timur and Barat peak usage",
        mobile: "CC Timur vs Barat peak",
      },
      {
        desktop: "Total ITB usage over the past decade",
        mobile: "Decade total usage",
      },
      {
        desktop: "Forecast Labtek VII usage during winter break",
        mobile: "Labtek VII winter forecast",
      },
      {
        desktop: "Compare SF and FMIPA usage trends",
        mobile: "SF vs FMIPA trends",
      }
    ];
  }
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
    suggestionQueries = [
      {
        desktop: "What is ELISA",
        mobile: "What is ELISA",
      },
      {
        desktop: "What is the usage trend of FSRD in the last 3 months",
        mobile: "What is the usage trend of FSRD in the last 3 months",
      },
      {
        desktop: "Total ITB usage over the past month",
        mobile: "Total ITB usage over the past month",
      },
    ];
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
        Try these queries:
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestionQueries.map((suggestion:any , index: any) => (
          <Button
            key={index}
            className={index > 5 ? "hidden sm:inline-block" : ""}
            type="button"
            variant="outline"
            onClick={() => handleSuggestionClick(suggestion.desktop)}
          >
            <span className="sm:hidden">{suggestion.mobile}</span>
            <span className="hidden sm:inline">{suggestion.desktop}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
