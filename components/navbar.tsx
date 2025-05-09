"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { BrainCircuit, Menu, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card-themed";
import { Activity, Calendar, Flame, Users, BarChart2, MessageSquare, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

// Component for nav items
function NavItem({
    icon: Icon,
    label,
    active,
    href
}: {
    icon: LucideIcon;
    label: string;
    active?: boolean;
    href: string;
}) {
    return (
        <Link href={href} className="block">
            <Button
                variant="ghost"
                className={`w-full justify-start ${active ? "bg-slate-100/70 dark:bg-slate-800/70 text-cyan-600 dark:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/70  hover:text-cyan-600 dark:text-cyan-400" : "text-slate-700 hover:text-cyan-600 dark:text-cyan-400 dark:text-slate-200 dark:hover:text-cyan-400  hover:bg-slate-50/50 dark:hover:bg-slate-800/10"} `}
            >
                <Icon className="mr-2 h-4 w-4" />
                {label}
            </Button>
        </Link>
    )
}

export function Navbar() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);


    // Update time
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }

    // Format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const navItems = [
        { href: "/home", label: "Home", title: "Last Hour Usage", icon: Activity },
        { href: "/daily", label: "Daily", title: "Daily Usage", icon: Calendar },
        { href: "/monthly", label: "Monthly", title: "Monthly Usage", icon: Calendar },
        { href: "/heatmap", label: "Heatmap", title: "Heatmap", icon: Flame },
        { href: "/faculty", label: "Faculty", title: "Faculties Consumption", icon: Building2 },
        { href: "/analysis", label: "Smart Analysis", title: "Smart Analysis", icon: BrainCircuit },
        // { href: "/feedback", label: "Feedback", title: "Feedback", icon: MessageSquare },
    ];

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full">
            {/* Mobile menu button */}
            <div className="md:hidden absolute right-4 top-8 z-20">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-gray-200 focus:outline-none"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Desktop Navigation */}
            <div className="flex justify-center pb-4 w-full">
                <Card className="backdrop-blur-sm hidden md:block">
                    {/* <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hidden md:block"></Card> */}
                    <CardContent className="p-4">
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href === "/" && pathname === "/") ||
                                    (item.href !== "/" && pathname?.startsWith(item.href));

                                return (
                                    <NavItem
                                        key={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        active={isActive}
                                        href={item.href}
                                    />
                                );
                            })}
                        </nav>
                        <Card className="mt-8  backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 ">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-mono">SYSTEM TIME</div>
                                        <div className="text-3xl font-mono text-cyan-600 dark:text-cyan-400 mb-1">{formatTime(currentTime)}</div>
                                        <div className="text-sm text-slate-700 dark:text-slate-300">{formatDate(currentTime)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-white dark:bg-gray-900 pt-20">
                    <ul className="flex flex-col items-center gap-2 p-4">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href === "/" && pathname === "/") ||
                                (item.href !== "/" && pathname?.startsWith(item.href));

                            return (
                                <li key={item.href} className="w-full max-w-xs">
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center px-4 py-3 text-lg font-medium rounded-md transition-colors",
                                            isActive
                                                ? "bg-slate-100/70 dark:bg-slate-800/70 text-cyan-600 dark:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/70  hover:text-cyan-600 dark:text-cyan-400"
                                                : "text-slate-700 hover:text-cyan-600 dark:text-cyan-400 dark:text-slate-200 dark:hover:text-cyan-400  hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                                        )}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.label}
                                    </Link>

                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}