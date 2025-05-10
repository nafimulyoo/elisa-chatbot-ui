"use client";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Brain, BrainCircuit, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation";

export function Header() {
    const { setTheme, theme } = useTheme()
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Redirect to your target page with the search query as a parameter
            router.push(`/analysis?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <>
            <header className="flex items-center justify-between pb-4 sm:pb-2 border-b dark:border-slate-700/50 mb-4 -mt-3 sm:mt-0">

                <div className="flex items-center space-x-2 text-slate">
                    <div className="flex mt-5 sm:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className="w-auto h-6 text-yellow-400 iconify iconify--twemoji" width="1em" height="1em" viewBox="0 0 36 36">
                            <path fill="#FFAC33" d="M32.938 15.651A1 1 0 0 0 32 15H19.925L26.89 1.458A1 1 0 0 0 26 0a1 1 0 0 0-.653.243L18 6.588L3.347 19.243A1 1 0 0 0 4 21h12.075L9.11 34.542A1 1 0 0 0 10 36a1 1 0 0 0 .653-.243L18 29.412l14.653-12.655a1 1 0 0 0 .285-1.106"></path>
                        </svg>
                        <h1 className="font-bold text-3xl tracking-wide">ElisaAI</h1>
                    </div>
                    <div className="leading-3 text-xs border-b border-transparent pb-3 pl-4 mt-3 self-center self-start">
                        <small className="hidden sm:block text-xs">Electrical Energy and Water Information System AI</small>
                        <small className="hidden sm:block">Institut Teknologi Bandung</small>
                    </div>
                </div>
                <div className="flex items-center space-x-4 mr-12 md:mr-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center space-x-1 bg-slate-100/20 dark:bg-slate-800/50 rounded-full px-3 py-1.5 border dark:border-slate-700/50 backdrop-blur-sm">
                                    <BrainCircuit className="h-4 w-4 text-slate-600 dark:text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Ask AI for analysis..."
                                        className="bg-transparent border-none focus:outline-none text-sm w-64 placeholder:text-slate-500"
                                    />
                                    <button type="submit" className="sr-only">Search</button>
                                </form>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Press Enter to search</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    className="text-slate-400 hover: text-slate-900 dark:text-slate-100 absolute right-16 top-8 sm:top-0 sm:right-0 sm:relative"
                                >
                                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle theme</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </header>
        </>
    );
}