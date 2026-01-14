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
  Receipt,
  Plus,
  X,
  Globe,
  Sparkles,
  Command,
  ArrowRight,
  MessageSquare,
  Bot
} from "lucide-react";
import Image from "next/image";
import { getGeminiResponse } from "@/lib/gemini";

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
const APPS: AppItem[] = [
  { id: "zena", name: "ZENA", category: ["Admin"], icon: LayoutGrid, url: "https://zena-admin-699782049978.asia-northeast3.run.app/", favorite: true },
  { id: "cost", name: "고정비", category: ["Admin"], icon: "/icon_cost.png", url: "https://cost.madeone.kr", favorite: true },
  { id: "commute", name: "출퇴근", category: ["Admin"], icon: "/icon_commute.png", url: "https://hr.madeone.kr", favorite: true },
  { id: "asset", name: "자산관리", category: ["Admin"], icon: "/icon_asset.png", url: "https://asset.madeone.kr", favorite: true },
  { id: "ticket", name: "티켓관리", category: ["Admin", "Ops"], icon: "/icon_ticket.png", url: "https://ticket.madeone.kr", favorite: true },
  { id: "vvip", name: "VVIP", category: ["Admin", "Ops"], icon: "/icon_vvip.png", url: "https://vvip.madeone.kr", favorite: true },
  { id: "notion", name: "Notion", category: ["Ops", "Communication"], icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg", url: "https://notion.so", favorite: true },
  { id: "gdrive", name: "Google Drive", category: ["Ops"], icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg", url: "https://drive.google.com" },
  { id: "meet", name: "Google Meet", category: ["Communication"], icon: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg", url: "https://meet.google.com" },
];

// --- Sub-Components ---

const GeminiAssistant = ({ query, isOpen, onClose, onSuggestionClick }: { query: string, isOpen: boolean, onClose: () => void, onSuggestionClick: (q: string) => void }) => {
  const [response, setResponse] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen && query && query.length > 2) {
      const timer = setTimeout(async () => {
        setIsTyping(true);
        setResponse("");
        const res = await getGeminiResponse(query);
        setResponse(res);
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="w-full mt-4 p-6 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group min-h-[200px]"
        >
          {/* Animated Background Graduate */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-widest">Gemini Assistant</span>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1 ml-2"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                </motion.div>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-zinc-200 text-lg font-medium leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                {isTyping ? (
                  <span className="text-zinc-500 italic">Thinking...</span>
                ) : response ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap">
                    {response}
                  </motion.div>
                ) : (
                  <p>{query ? `"${query}"에 대해 질문하시겠어요? Enter를 눌러 대화를 시작하세요.` : "안녕하세요! 메이드온 업무나 도구들에 대해 무엇이든 물어보세요."}</p>
                )}
              </div>

              {!response && !isTyping && (
                <div className="flex flex-wrap gap-2">
                  {["오늘 점심 메뉴 추천해줘", "자산 관리 메뉴얼 보여줘", "휴가 신청은 어디서 해?"].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => onSuggestionClick(hint)}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-xs hover:bg-white/10 hover:text-white transition-all"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AddAppModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (app: AppItem) => void }) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    let domain = url;
    try {
      domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      domain = url;
    }

    const newApp: AppItem = {
      id: `custom-${Date.now()}`,
      name,
      url: url.startsWith("http") ? url : `https://${url}`,
      category: ["All Apps" as Category],
      icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      favorite: false
    };

    onAdd(newApp);
    setName("");
    setUrl("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-black/5 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Add New App</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X size={20} className="dark:text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">App Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Custom App"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-blue-500 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">App URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-blue-500 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity mt-4 shadow-lg"
              >
                Create App
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AppIcon = ({ app, isFavoriteSection = false, toggleFavorite, onDelete }: { app: AppItem, isFavoriteSection?: boolean, toggleFavorite?: (id: string) => void, onDelete?: (id: string) => void }) => {
  const [imgError, setImgError] = useState(false);
  const Icon = app.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center gap-3 group relative cursor-pointer"
    >
      <a
        href={app.url || "#"}
        target={app.url ? "_blank" : undefined}
        rel={app.url ? "noopener noreferrer" : undefined}
        className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center p-3 sm:p-4 overflow-hidden border border-black/5 transition-all group-hover:scale-105 group-hover:shadow-lg"
      >
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
              <Globe className="w-8 h-8 text-zinc-300" />
            )}
          </div>
        )}
      </a>

      {/* Favorite Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite?.(app.id);
        }}
        className={`absolute top-1 right-1 p-1 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 ${app.favorite ? "opacity-100" : ""}`}
      >
        <Star size={14} className={app.favorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-300 hover:text-zinc-500"} />
      </button>

      {/* Delete button only for custom apps */}
      {app.id.startsWith("custom-") && !isFavoriteSection && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(app.id);
          }}
          className="absolute top-1 left-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
        >
          <X size={10} />
        </button>
      )}

      <span className="text-sm font-medium text-zinc-400 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors text-center truncate w-full px-1">
        {app.name}
      </span>
    </motion.div>
  );
};

import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { logout, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [apps, setApps] = useState<AppItem[]>(APPS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);

    const savedApps = localStorage.getItem("customApps");
    if (savedApps) {
      try {
        const customApps = JSON.parse(savedApps);
        setApps([...APPS, ...customApps]);
      } catch (e) {
        console.error("Failed to parse custom apps", e);
      }
    }
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
    const updatedApps = apps.map(app =>
      app.id === id ? { ...app, favorite: !app.favorite } : app
    );
    setApps(updatedApps);
    persistCustomApps(updatedApps);
  };

  const addApp = (newApp: AppItem) => {
    const updatedApps = [...apps, newApp];
    setApps(updatedApps);
    persistCustomApps(updatedApps);
  };

  const deleteApp = (id: string) => {
    const updatedApps = apps.filter(app => app.id !== id);
    setApps(updatedApps);
    persistCustomApps(updatedApps);
  };

  const persistCustomApps = (allApps: AppItem[]) => {
    const customApps = allApps.filter(app => app.id.startsWith("custom-"));
    localStorage.setItem("customApps", JSON.stringify(customApps));
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
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

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-default">
              <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full border border-black/10" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white hidden sm:block">{user.name}</span>
            </div>
          )}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} className="text-zinc-200" /> : <Moon size={20} className="text-zinc-500" />}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-400 dark:text-zinc-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Central Command / Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000" />
            <div className="relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[2rem] border border-black/5 dark:border-white/10 shadow-2xl flex items-center px-6 py-4 transition-all">
              <Search className="text-zinc-400 mr-4" size={24} />
              <input
                type="text"
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.length > 0) {
                    setIsGeminiOpen(true);
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="어떤 도구를 찾으시나요? (또는 Gemini에게 물어보기)"
                className="w-full bg-transparent border-none outline-none text-xl font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGeminiOpen(!isGeminiOpen)}
                  className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 ${isGeminiOpen
                    ? "bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  <Sparkles size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Gemini</span>
                </button>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <Command size={14} />
                  <span className="text-[10px] font-bold">K</span>
                </div>
              </div>
            </div>
          </div>

          <GeminiAssistant
            query={searchQuery}
            isOpen={isGeminiOpen || (searchQuery.length > 2 && filteredApps.length === 0)}
            onClose={() => setIsGeminiOpen(false)}
            onSuggestionClick={(q) => {
              setSearchQuery(q);
              setIsGeminiOpen(true);
            }}
          />
        </div>

        {/* Favorites Section - Only show when no search */}
        {!searchQuery && favoriteApps.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-2 mb-8 text-zinc-400 dark:text-zinc-300">
              <Star size={18} />
              <h2 className="text-sm font-bold tracking-wider uppercase">Favorites</h2>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10">
              <AnimatePresence>
                {favoriteApps.map((app) => (
                  <AppIcon key={`fav-${app.id}`} app={app} isFavoriteSection toggleFavorite={toggleFavorite} onDelete={deleteApp} />
                ))}
              </AnimatePresence>
            </div>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-16" />
          </section>
        )}

        {/* All Apps Section */}
        <section>
          {!searchQuery && (
            <div className="flex items-center gap-2 mb-8 text-zinc-400 dark:text-zinc-300">
              <LayoutGrid size={18} />
              <h2 className="text-sm font-bold tracking-wider uppercase">All Apps</h2>
            </div>
          )}

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app) => (
                <AppIcon key={app.id} app={app} toggleFavorite={toggleFavorite} onDelete={deleteApp} />
              ))}

              {/* Add New App Button - Only show when not searching */}
              {!searchQuery && (
                <motion.div
                  layout
                  whileHover={{ y: -5 }}
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 transition-all group-hover:border-zinc-500 dark:group-hover:border-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800">
                    <Plus size={32} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </div>
                  <span className="text-[13px] font-medium text-zinc-500 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white">
                    Add App
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <AddAppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addApp}
      />
    </div>
  );
}
