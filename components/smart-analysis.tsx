"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Results } from "@/components/results";
import { SuggestedQueries } from "@/components/suggested-queries";
import { Search } from "@/components/search";

import { CodeBlock, atomOneLight } from 'react-code-blocks';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SmartAnalysis() {
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [columns, setColumns]: any = useState([]);
  const [explanations, setExplanations]: any = useState([]);
  const [data, setData]: any = useState([]);
  const [visualizationType, setVisualizationType]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Analyzing request...");
  const [notebook, setNotebook]: any = useState({});
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
      setNotebook({});
      const response = await fetch(`${API_URL}/api/web?prompt=${encodeURIComponent(question)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      setLoadingStep("Processing results...");

      // Process the results
      const result: any = responseData["result"];
      // concert notebook from string to json
      const new_notebook: any = responseData["notebook"];
      setNotebook(new_notebook);
      console.log("Result:", result);
      console.log("Notebook:", notebook);

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
      console.log("Data:", data);
      console.log("Columns:", columns);
      console.log("Visualization Type:", visualizationType);

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
            <div className="flex items-center justify-between mb-6">
              <h1
                className="text-2xl sm:text-3xl font-semibold text-foreground flex items-center cursor-pointer text-gray-700"
                onClick={() => handleClear()}
              >
                Smart Analysis Q&A
              </h1>
            </div>
            <Search
              handleClear={handleClear}
              handleSubmit={handleSubmit}
              inputValue={inputValue}
              setInputValue={setInputValue}
              submitted={submitted}
            />
            {/* <p className="text-md text-warning mt-2 mb-3">
              Currently, I can only assist with basic data analysis as shown in the example. Forecasting, prediction, clustering, and other advanced analysis are not supported yet. Please check back later for updates.
            </p> */}
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
                        <Tabs defaultValue="result" className="w-full flex-grow flex flex-col mt-8">
                          {
                            notebook ? (
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="result">Result</TabsTrigger>
                                <TabsTrigger value="code">Code</TabsTrigger>
                              </TabsList>
                            ) : (
                              <TabsList className="grid w-full grid-cols-1">
                                <TabsTrigger value="result">Result</TabsTrigger>
                              </TabsList>
                            )
                          }
                          <TabsContent value="result" className="flex-grow overflow-auto">
                            {explanations.map((explanation: any, index: number) => (
                              <Results
                                key={index}
                                data={data[index]}
                                visualizationType={visualizationType[index]}
                                columns={columns[index]}
                                explanation={explanation}
                              />
                            ))
                            }
                          </TabsContent>

                          <TabsContent value="code" className="flex-grow">
                            {
                              notebook && (
                                notebook.cells.map((cell: any, index: number) => (
                                  <div key={index} className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                      Code Cell {index + 1}
                                    </h3>
                                    <pre className=" p-4 rounded-md overflow-x-auto">

                                      <CodeBlock
                                        text={cell.source}
                                        language="python"
                                        showLineNumbers={true}
                                        theme={atomOneLight}
                                      />
                                    </pre>

                                    {cell.outputs && cell.outputs.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="text-md font-semibold text-gray-700 mb-2">
                                          Output
                                        </h4>
                                        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                                          {
                                            cell.outputs.map((output: any, outputIndex: number) => (
                                              <div key={outputIndex}>
                                                {output.data && output.data["text/plain"] ? (
                                                  <div>{output.data["text/plain"]}</div>
                                                ) : (
                                                  <div>{output.text}</div>
                                                )}
                                              </div>
                                            ))
                                          }
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )
                                )

                              )
                            }
                          </TabsContent>
                        </Tabs>

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