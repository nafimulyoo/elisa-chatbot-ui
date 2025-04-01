"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateChartConfig,
  generateQuery,
  runGenerateSQLQuery,
} from "./actions";
import { Config, Result } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Results } from "@/components/results";
import { SuggestedQueries } from "@/components/suggested-queries";
import { QueryViewer } from "@/components/query-viewer";
import { Search } from "@/components/search";
import { Header } from "@/components/header";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [columns, setColumns]: any = useState([]);
  const [explanations, setExplanations]: any = useState([]);
  const [data, setData]: any = useState([]);
  const [visualizationType, setVisualizationType]: any = useState([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Analyzing request...");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [chartConfig, setChartConfig] = useState<Config | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const API_URL = 'http://127.0.0.1:8000'

  // Clean up the event source on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const handleSubmitStreaming = async (suggestion?: string) => {
    const question = suggestion ?? inputValue;
    if (inputValue.length === 0 && !suggestion) return;
    clearExistingData();
    if (question.trim()) {
      setSubmitted(true);
    }
    setLoading(true);
    setLoadingStep("Analyzing request...");
    setLoadingProgress(0);
    setActiveQuery("");

    // Close previous event source if exists
    if (eventSource) {
      eventSource.close();
    }

    try {
      // Set up server-sent events
      const newEventSource = new EventSource(`${API_URL}/api/web/stream?prompt=${question}`, {
        withCredentials: true
      });
      
      setEventSource(newEventSource);

      newEventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLoadingStep(data.status);
        setLoadingProgress(data.progress);

        if (data.progress === 100 && data.result) {

          newEventSource.close();
          setEventSource(null);
          setLoading(false);
          
          // Process the results
          const result: any = data.result;

          if (result.length > 0) {
            // example of result: [{"data": [{...}, {...}], "explanation": "explanation text"}, {"visualization_type": "bar_chart"}, 
            // {"data": [{...}, {...}], "explanation": "explanation text"}, {"visualization_type": "line_chart"},
            // {"data": [{...}, {...}], "explanation": "explanation text"}, {"visualization_type": "area_chart"}]
            // loop through all results and display them

            // loop through all result
            for (let i = 0; i < result.length; i++) {
              setExplanations((prev: any) => [...prev, result[i].explanation]);
              // if data exists, add it to the state
              console.log(result[i])
              if (result[i].data.length > 0) {
                setData((prev: any) => [...prev, result[i].data]);
                setColumns((prev: any) => [...prev, Object.keys(result[i].data[0])]);
                setVisualizationType((prev: any) => [...prev, result[i].visualization_type]);
              }
            }
          }
        }
      };

      newEventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        newEventSource.close();
        setEventSource(null);
        setLoading(false);
        toast.error("Connection error. Please try again.");
      };
    } catch (e) {
      console.error("Error setting up streaming:", e);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    try {
      await handleSubmitStreaming(suggestion);
    } catch (e) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const clearExistingData = () => {
    setActiveQuery("");
    setColumns([]);
    setExplanations([]);
    setData([]);
    setVisualizationType([]);
    setChartConfig(null);
    
    // Close any active event source
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
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
              handleSubmit={handleSubmitStreaming} // Use streaming version
              inputValue={inputValue}
              setInputValue={setInputValue}
              submitted={submitted}
            />
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
                      {activeQuery.length > 0 && (
                        <QueryViewer
                          activeQuery={activeQuery}
                          inputValue={inputValue}
                        />
                      )}
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
                        // loop through all explanations and display them
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