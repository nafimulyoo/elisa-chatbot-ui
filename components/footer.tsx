import Link from "next/link";
import * as React from "react";

export function Footer() {
  return (
    <footer className="py-6 md:py-0 border-t border-border/40">
      <div className="z-20 w-full bg-background/95 shadow-top backdrop-blur supports-[backdrop-filter]:bg-background">
        <div className="mx-4 md:mx-8 flex h-14 items-center text-center justify-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
            This work was created as part of Nafi Mulyo Kusumo{"'"}s bachelor{"'"}s thesis in Engineering Physics at ITB. Source code is available on{" "}
          <Link
            href="https://github.com/nafimulyoo/elisa-smart-analysis"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Backend Repository
          </Link>
            {" "}and{" "}
          <Link
            href="https://github.com/nafimulyoo/elisa-chatbot-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Frontend Repository
          </Link>
          .
        </p>
        </div>
      </div>
      </footer>
  )
}

