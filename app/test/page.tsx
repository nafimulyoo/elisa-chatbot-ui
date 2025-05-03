"use client";

import SmartAnalysis from "@/components/smart-analysis";

export default function Page() {
  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    {
      // loop 20 times
      Array.from({ length: 20 }, (_, index) => (
        <div className="mt-4" key={index}>
            <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Test Smart Analysis {index + 1}
            </h1>
            </div>
            <SmartAnalysis/>
        </div>
      ))
    }
    </div>
    </>
  );
}