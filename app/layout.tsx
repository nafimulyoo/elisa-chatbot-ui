import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils"
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
        <div className="flex justify-center mt-8">

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
