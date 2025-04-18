import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const metadata = {
  metadataBase: new URL("https://natural-language-postgres.vercel.app"),
  title: "Elisa Smart Analysis Q&A",
  description:
    "Chat with a Postgres database using natural language powered by the AI SDK by Vercel.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistMono.className} ${GeistSans.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* center */}
        <div className="absolute -mt-8 ml-4">
        <div className="flex flex-row lg:flex-col gap-4 lg:gap-0 title text-base w-full text-left cursor-pointer text-slate-600"><div className="flex"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className="w-auto h-6 text-yellow-400 iconify iconify--twemoji" width="1em" height="1em" viewBox="0 0 36 36"><path fill="#FFAC33" d="M32.938 15.651A1 1 0 0 0 32 15H19.925L26.89 1.458A1 1 0 0 0 26 0a1 1 0 0 0-.653.243L18 6.588L3.347 19.243A1 1 0 0 0 4 21h12.075L9.11 34.542A1 1 0 0 0 10 36a1 1 0 0 0 .653-.243L18 29.412l14.653-12.655a1 1 0 0 0 .285-1.106"></path></svg><h1 className="font-bold text-4xl tracking-wide mt-1">Elisa</h1></div><div className="leading-3 text-xs border-b border-transparent lg:pb-3 lg:pl-7 mt-0 self-center lg:self-start"><small className="block text-xs">Electrical Energy and Water Information System</small><small>Institut Teknologi Bandung</small></div></div>
        </div>
        <div className="flex justify-center mt-12">

        <NavigationMenu className="flex justify-center">
        <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/home" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/daily" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Daily
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/monthly" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Monthly
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/heatmap" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Heatmap
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/faculty" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Faculty
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Smart Analysis
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
        </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
