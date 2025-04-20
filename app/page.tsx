"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Results } from "@/components/results";
import { SuggestedQueries } from "@/components/suggested-queries";
import { Search } from "@/components/search";
import { Header } from "@/components/header";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [columns, setColumns]: any = useState([]);
  const [explanations, setExplanations]: any = useState([]);
  const [data, setData]: any = useState([]);
  const [visualizationType, setVisualizationType]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Analyzing request...");
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Clean up the fetch request on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const handleSubmit = async (suggestion?: string) => {
    const question = suggestion ?? inputValue;
    if (inputValue.length === 0 && !suggestion) return;
    clearExistingData();
    if (question.trim()) {
      setSubmitted(true);
    }
    setLoading(true);
    setLoadingStep("Analyzing request...");

    // Abort previous request if exists
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(`${API_URL}/api/web?prompt=${encodeURIComponent(question)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      

      const responseData = await response.json();
      
      setLoadingStep("Processing results...");

      // Process the results
      const result: any = responseData
      console.log("Result:", result);

      if (result?.length > 0) {
        for (let i = 0; i < result.length; i++) {
          setExplanations((prev: any) => [...prev, result[i].explanation]);
          if (result[i].data?.length > 0) {
            setData((prev: any) => [...prev, result[i].data]);
            setColumns((prev: any) => [...prev, Object.keys(result[i].data[0])]);
            setVisualizationType((prev: any) => [...prev, result[i].visualization_type]);
          }
        }
      }
      
      setLoading(false);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Error fetching data:", e);
        toast.error("An error occurred. Please try again.");
      }
      setLoading(false);
    } finally {
      setAbortController(null);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    try {
      await handleSubmit(suggestion);
    } catch (e) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const clearExistingData = () => {
    setColumns([]);
    setExplanations([]);
    setData([]);
    setVisualizationType([]);
    // Abort any active request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleClear = () => {
    setSubmitted(false);
    setInputValue("");
    clearExistingData();
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 flex items-start justify-center p-0 sm:p-8">
      <div className="w-full max-w-4xl min-h-dvh sm:min-h-0 flex flex-col ">
        <motion.div
          className="bg-card rounded-xl shadow-lg flex-grow flex flex-col mt-"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="p-6 sm:p-8 flex flex-col flex-grow">
            <Header handleClear={handleClear} />
            <Search
              handleClear={handleClear}
              handleSubmit={handleSubmit}
              inputValue={inputValue}
              setInputValue={setInputValue}
              submitted={submitted}
            />
            <p className="text-md text-warning mt-2 mb-3">
              Currently, I can only assist with basic data analysis as shown in the example. Forecasting, prediction, clustering, and other advanced analysis are not supported yet. Please check back later for updates.
            </p>
            <div
              id="main-container"
              className="flex-grow flex flex-col sm:min-h-[420px]"
            >
              <div className="flex-grow h-full">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <SuggestedQueries
                      handleSuggestionClick={handleSuggestionClick}
                    />
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      className="sm:h-full min-h-[400px] flex flex-col"
                    >
                      {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                          </div>
                          <div className="flex items-center justify-center mt-4 text-muted-foreground">
                            {loadingStep}
                          </div>
                        </div>
                      ) : explanations.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center">
                          <p className="text-center text-muted-foreground">
                            No results found.
                          </p>
                        </div>
                      ) : (
                        explanations.map((explanation: any, index: number) => (
                          <Results
                            key={index}
                            data={data[index]}
                            visualizationType={visualizationType[index]}
                            columns={columns[index]}
                            explanation={explanation}
                          />
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}