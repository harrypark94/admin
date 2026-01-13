"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  LogOut,
  Star,
  LayoutGrid,
  Search,
  Settings,
  UserCircle,
  Cloud,
  CloudRain,
  ShoppingBag,
  Clock,
  Receipt
} from "lucide-react";
import Image from "next/image";

// --- Components ---

const WeatherWidget = () => {
  const [data, setData] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Seoul coordinates
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true");
        const json = await res.json();
        const weather = json.current_weather;

        // Simple mapping for condition
        const code = weather.weathercode;
        let condition = "Clear";
        if (code >= 1 && code <= 3) condition = "Cloudy";
        if (code >= 51 && code <= 67) condition = "Rainy";
        if (code >= 71 && code <= 82) condition = "Snowy";

        setData({ temp: Math.round(weather.temperature), condition });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/10 backdrop-blur-md border border-zinc-200 dark:border-white/20 shadow-sm transition-all hover:scale-105 cursor-default group">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-400/30 group-hover:animate-pulse">
        {data?.condition === "Rainy" ? (
          <CloudRain size={18} className="text-blue-600 dark:text-blue-300" />
        ) : (
          <Cloud size={18} className="text-blue-600 dark:text-blue-200" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-900 dark:text-white leading-none">Seoul</span>
        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
          {data ? `${data.temp}°C · ${data.condition}` : "--°C · Loading..."}
        </span>
      </div>
    </div>
  );
};

// --- Types ---
type Category = "All Apps" | "Design" | "Ops" | "Dev" | "Communication" | "Admin";

interface AppItem {
  id: string;
  name: string;
  category: Category[];
  icon: string | React.ElementType;
  favorite?: boolean;
  url?: string;
}

// --- Data ---
const CATEGORIES: Category[] = ["All Apps", "Design", "Ops", "Dev", "Communication", "Admin"];

const APPS: AppItem[] = [
  { id: "cost", name: "고정비", category: ["Admin"], icon: Receipt, url: "https://cost.madeone.kr", favorite: true },
  { id: "commute", name: "출퇴근", category: ["Admin"], icon: Clock, url: "https://hr.madeone.kr", favorite: true },
  { id: "asset", name: "Asset", category: ["Admin"], icon: ShoppingBag, url: "https://admin.madeone.kr", favorite: true },
  { id: "notion", name: "Notion", category: ["Ops", "Communication"], icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg", favorite: true },
  { id: "gdrive", name: "Google Drive", category: ["Ops"], icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" },
  { id: "adobe", name: "Adobe CC", category: ["Design"], icon: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_logo.svg" },
  { id: "zoom", name: "Zoom", category: ["Communication"], icon: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Zoom_Communications_Logo.svg", favorite: true },
  { id: "meet", name: "Google Meet", category: ["Communication"], icon: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg" },
  { id: "admin", name: "Admin Panel", category: ["Admin"], icon: Settings, favorite: true },
  { id: "hr", name: "HR Portal", category: ["Admin"], icon: UserCircle },
  { id: "miro", name: "Miro", category: ["Design", "Communication"], icon: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Miro-logo.svg" },
];

// --- Components ---

const AppIcon = ({ app, isFavoriteSection = false, toggleFavorite }: { app: AppItem, isFavoriteSection?: boolean, toggleFavorite?: (id: string) => void }) => {
  const [imgError, setImgError] = useState(false);
  const Icon = app.icon;

  return (
    <motion.a
      layout
      href={app.url || "#"}
      target={app.url ? "_blank" : undefined}
      rel={app.url ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center gap-3 group relative cursor-pointer"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center p-3 sm:p-4 overflow-hidden border border-black/5 transition-all group-hover:scale-105 group-hover:shadow-lg">
        {!imgError && typeof Icon === "string" ? (
          <img
            src={Icon}
            alt={app.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-lg">
            {typeof Icon === "function" ? (
              <Icon className="w-8 h-8 text-zinc-400" />
            ) : (
              <LayoutGrid className="w-8 h-8 text-zinc-300" />
            )}
          </div>
        )}

        {/* Favorite Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite?.(app.id);
          }}
          className={`absolute top-1 right-1 p-1 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 ${app.favorite ? "opacity-100" : ""}`}
        >
          <Star size={14} className={app.favorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-300 hover:text-zinc-500"} />
        </button>
      </div>
      <span className="text-[13px] font-medium text-zinc-600 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
        {app.name}
      </span>
    </motion.a>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<Category>("All Apps");
  const [apps, setApps] = useState<AppItem[]>(APPS);

  useEffect(() => {
    setMounted(true);
    // Check system preference or localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleFavorite = (id: string) => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, favorite: !app.favorite } : app
    ));
  };

  const filteredApps = apps.filter(app =>
    activeTab === "All Apps" || app.category.includes(activeTab)
  );

  const favoriteApps = apps.filter(app => app.favorite);

  if (!mounted) return null;

  return (
    <div className="min-h-screen transition-colors duration-300 selection:bg-blue-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 px-6 md:px-12 flex items-center justify-between z-50">
        <div className="flex items-center">
          <div className="relative h-8 w-32 md:h-10 md:w-40">
            <Image
              src="/logo.png"
              alt="MADEONE"
              fill
              style={{ filter: theme === "dark" ? "brightness(0) invert(1)" : "brightness(0)" }}
              className="object-contain transition-all duration-300"
              priority
            />
          </div>
        </div>

        <div className="hidden md:block">
          <WeatherWidget />
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} className="text-zinc-200" /> : <Moon size={20} className="text-zinc-500" />}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-200 group">
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-16">
          <div className="bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md p-1.5 rounded-full flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === cat
                  ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Section */}
        {activeTab === "All Apps" && favoriteApps.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-2 mb-8 text-zinc-500 dark:text-zinc-300">
              <Star size={18} />
              <h2 className="text-sm font-semibold tracking-wider uppercase">Favorites</h2>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10">
              <AnimatePresence>
                {favoriteApps.map((app) => (
                  <AppIcon key={`fav-${app.id}`} app={app} isFavoriteSection toggleFavorite={toggleFavorite} />
                ))}
              </AnimatePresence>
            </div>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-16" />
          </section>
        )}

        {/* All Apps Section */}
        <section>
          {activeTab === "All Apps" && (
            <div className="flex items-center gap-2 mb-8 text-zinc-500 dark:text-zinc-300">
              <LayoutGrid size={18} />
              <h2 className="text-sm font-semibold tracking-wider uppercase">All Apps</h2>
            </div>
          )}

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app) => (
                <AppIcon key={app.id} app={app} toggleFavorite={toggleFavorite} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
