"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Results } from "@/components/results";
import { SuggestedQueries } from "@/components/suggested-queries";
import { Search } from "@/components/search";

import { CodeBlock, atomOneLight, atomOneDark } from 'react-code-blocks';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card-themed";
import { useTheme } from "next-themes";
import { Progress } from "./ui/progress";

export default function SmartAnalysis() {
  const [isStream, setIsStream] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [columns, setColumns]: any = useState([]);
  const [explanations, setExplanations]: any = useState([]);
  const [data, setData]: any = useState([]);
  const [visualizationType, setVisualizationType]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [notebook, setNotebook]: any = useState({});
  const [model, setModel] = useState("gemini");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { theme, setTheme } = useTheme();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Clean up the fetch request on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const handleSubmit = async (suggestion?: string, stream?: boolean) => {
    const question = suggestion ?? inputValue;
    if (inputValue.length === 0 && !suggestion) return;
    clearExistingData();
    if (question.trim()) {
      setSubmitted(true);
    }
    setLoading(true);
    setLoadingMessage("Initiating analysis...");

    // Abort previous request if exists
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);


    try {
      if (!stream) {
        setNotebook({});
        const response = await fetch(`${API_URL}/api/web?prompt=${encodeURIComponent(question)}&model=${model}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        setLoadingMessage("Processing results...");

        // Process the results
        const result: any = responseData["result"];
        // concert notebook from string to json
        const new_notebook: any = responseData["notebook"];
        setNotebook(new_notebook);

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

      }

      setNotebook({});
      let buffer = "";
      const response = await fetch(`${API_URL}/api/web-stream?prompt=${encodeURIComponent(question)}&model=${model}`)
      let progress = 0;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();


      const processStream = async () => {

        let stream = true;
        setLoadingProgress(0);

        while (stream) {
          const { value, done } = await reader?.read() || {};
          const response = decoder.decode(value, { stream: true });
          buffer += response;

          console.log("Response: ", response);
          const lines = buffer.split("\n").filter(line => line.trim() !== "");

          for (const line of lines) {
            const jsonResponse = JSON.parse(line);

            if (jsonResponse.progress) {
              if (jsonResponse.progress > progress) {
                progress = jsonResponse.progress;
                console.log("Progress:", jsonResponse.progress);
                await new Promise(resolve => setTimeout(resolve, 200));
                setLoadingMessage(jsonResponse.message);
                setLoadingProgress(jsonResponse.progress);
              }
            }

            const jsonResponseData = jsonResponse.data
            if (jsonResponseData) {
              console.log("JSON Response Data:", jsonResponseData);
              const result: any = jsonResponseData.result;
              // concert notebook from string to json
              const new_notebook: any = jsonResponseData.notebook;

              console.log(result);
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


              if (jsonResponse.progress == 1.0) {
                stream = false; // Stop the stream when progress is 100%
                // await new Promise(resolve => setTimeout(resolve, 200));
                setLoading(false);
                setLoadingMessage("");
                setLoadingProgress(0);
                break
              }
            }
          }
        }
      }

      await processStream();
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
      await handleSubmit(suggestion, isStream);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <Card>
        <CardHeader className="mb-4 py-3">
          <CardTitle onClick={() => handleClear()} className="text-2xl font-semibold  text-slate-900 dark:text-slate-100">
            <BrainCircuit className="mr-3 h-6 w-6 text-cyan-600 dark:text-cyan-400" /> Smart Analysis Q&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Search
            handleClear={handleClear}
            handleSubmit={handleSubmit}
            inputValue={inputValue}
            setInputValue={setInputValue}
            submitted={submitted}
            model={model}
            setModel={setModel}
          />
          <div
            id="main-container"
            className="flex-grow flex flex-col sm:min-h-[420px] mt-8"
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
                          <Loader2 className="h-12 w-12 animate-spin text-slate-500 dark:text-slate-400" />
                        </div>
                        <Progress value={loadingProgress * 100} className="w-3/4 mt-8" />
                        <div className="flex items-center justify-center mt-4 text-slate-600 dark:text-slate-300 mt-2">
                          {
                            loadingMessage
                          }
                        </div>
                      </div>


                    ) : explanations.length === 0 ? (
                      <div className="flex-grow flex items-center justify-center">
                        <p className="text-center text-muted-foreground">
                          No results found.
                        </p>
                      </div>
                    ) : (
                      <Tabs defaultValue="result" className="w-full flex-grow flex flex-col">
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
                          <motion.div
                            className=""
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          >


                            {
                              notebook && (
                                notebook.cells.map((cell: any, index: number) => (
                                  <Card key={index} className="mt-4">
                                    <CardHeader className="font-semibold">
                                      <CardTitle>
                                        Code Cell {index + 1}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>

                                      <pre className=" p-4 rounded-md overflow-x-auto">

                                        <CodeBlock
                                          text={cell.source}
                                          language="python"
                                          showLineNumbers={true}
                                          theme={theme === "dark" ? atomOneDark : atomOneLight}
                                          customStyle={
                                            {
                                              backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                              color: theme === "dark" ? "#cbd5e1" : "#000000",
                                              padding: "1rem",
                                              paddingTop: "2rem",
                                              paddingBottom: "2rem",
                                              borderRadius: "0.5rem",
                                            }
                                          }
                                        />
                                      </pre>

                                      {cell.outputs && cell.outputs.length > 0 && (
                                        <Card className="mt-4">
                                          <CardHeader>
                                            <CardTitle className="text-md font-semibold text-slate-900 dark:text-slate-100">
                                              Output
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-0">
                                            <pre className="p-4 overflow-x-auto bg-slate-100 dark:bg-slate-800 text-wrap">
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
                                          </CardContent>
                                        </Card>
                                      )}
                                    </CardContent>
                                  </Card>
                                )
                                )

                              )
                            }
                          </motion.div>
                        </TabsContent>
                      </Tabs>

                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}