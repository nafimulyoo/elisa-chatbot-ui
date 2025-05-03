"use client";

import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export const Search = ({
  handleSubmit,
  inputValue,
  setInputValue,
  submitted,
  handleClear,
}: any) => {
  const searchParams = useSearchParams();
  const initialRender = useRef(true);
  const submitRequested = useRef(false);

  useEffect(() => {
    const query = searchParams.get("query");
    
    if (initialRender.current && query && !inputValue) {
      const decodedQuery = decodeURIComponent(query);
      setInputValue(decodedQuery);
      submitRequested.current = true;
    }
    
    initialRender.current = false;
  }, [searchParams, setInputValue, inputValue]);

  useEffect(() => {
    if (submitRequested.current && inputValue) {
      submitRequested.current = false;
      const submit = async () => {
        await handleSubmit();
      };
      submit();
    }
  }, [inputValue, handleSubmit]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit();
      }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Ask about electricity usage at ITB..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pr-10 text-base"
          />
          <Zap className="absolute h-5 w-5 right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex sm:flex-row items-center justify-center gap-2">
          {submitted ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto bg-cyan-600 dar:bg-cyan-500 text-white hover:bg-cyan-700 dark:hover:bg-cyan-400">
              Send
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};