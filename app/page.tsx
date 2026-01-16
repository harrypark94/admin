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
  Globe
} from "lucide-react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/components/AuthProvider";

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
  { id: "zena", name: "JENA", category: ["Admin"], icon: "/icon_zena.png", url: "https://zena-admin-699782049978.asia-northeast3.run.app/", favorite: true },
  { id: "cost", name: "고정비", category: ["Admin"], icon: "/icon_cost.png", url: "https://cost.madeone.kr", favorite: true },
  { id: "commute", name: "출퇴근", category: ["Admin"], icon: "/icon_commute.png", url: "https://hr.madeone.kr", favorite: true },
  { id: "asset", name: "자산관리", category: ["Admin"], icon: "/icon_asset.png", url: "https://asset.madeone.kr", favorite: true },
  { id: "ticket", name: "티켓관리", category: ["Admin", "Ops"], icon: "/icon_ticket.png", url: "https://wb-viewer-291463553101.asia-northeast3.run.app/", favorite: true },
  { id: "vvip", name: "VVIP", category: ["Admin", "Ops"], icon: "/icon_vvip.png", url: "https://vvip.madeone.kr", favorite: true },
  { id: "kpop", name: "아티스트", category: ["Admin"], icon: "/icon_kpop.png", url: "https://kpop-dashboard-370510687216.asia-northeast3.run.app", favorite: true },
];

// --- Components ---

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
      layout={false} // Disable framer-motion layout during drag
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
        draggable={false}
        className="relative w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] md:w-[100px] md:h-[100px] rounded-[1.6rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_40px_rgb(0,0,0,0.4)] flex items-center justify-center overflow-hidden border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-active:scale-95"
      >
        {!imgError && typeof Icon === "string" ? (
          <img
            src={Icon}
            alt={app.name}
            draggable={false}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 dark:bg-zinc-800" onPointerDownCapture={(e) => e.stopPropagation()}>
            {typeof Icon === "function" ? (
              <Icon className="w-10 h-10 text-zinc-400" />
            ) : (
              <Globe className="w-10 h-10 text-zinc-300" />
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

      <span className="text-base font-semibold text-zinc-400 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors text-center truncate w-full px-1">
        {app.name}
      </span>
    </motion.div>
  );
};

const SortableAppIcon = ({ app, id, toggleFavorite, onDelete }: { app: AppItem, id: string, toggleFavorite: (id: string) => void, onDelete?: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id, data: { app } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1, // Dim the original item while dragging
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AppIcon app={app} isFavoriteSection={id.startsWith('fav-')} toggleFavorite={toggleFavorite} onDelete={onDelete} />
    </div>
  );
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export default function Home() {
  const { logout, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState<AppItem[]>(APPS);
  const [favAppsOrder, setFavAppsOrder] = useState<string[]>([]); // Array of App IDs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);

    const savedAppsStr = localStorage.getItem("customApps");
    const savedOrderStr = localStorage.getItem("appOrder");
    const savedFavOrderStr = localStorage.getItem("favAppOrder");

    let currentApps = [...APPS];

    if (savedAppsStr) {
      try {
        const customApps = JSON.parse(savedAppsStr);
        currentApps = [...currentApps, ...customApps];
      } catch (e) {
        console.error("Failed to parse custom apps", e);
      }
    }

    // Restore App Order
    if (savedOrderStr) {
      try {
        const order = JSON.parse(savedOrderStr) as string[];
        const appMap = new Map(currentApps.map(app => [app.id, app]));
        const orderedApps: AppItem[] = [];
        const seenIds = new Set<string>();

        order.forEach(id => {
          const app = appMap.get(id);
          if (app) {
            orderedApps.push(app);
            seenIds.add(id);
          }
        });

        currentApps.forEach(app => {
          if (!seenIds.has(app.id)) {
            orderedApps.push(app);
          }
        });

        setApps(orderedApps);
      } catch (e) {
        setApps(currentApps);
      }
    } else {
      setApps(currentApps);
    }

    // Restore Favorites Order
    const currentFavorites = currentApps.filter(app => app.favorite).map(app => app.id);
    if (savedFavOrderStr) {
      try {
        const savedFavOrder = JSON.parse(savedFavOrderStr) as string[];
        const validFavOrder = savedFavOrder.filter(id => currentFavorites.includes(id));
        const newFavs = currentFavorites.filter(id => !validFavOrder.includes(id));
        setFavAppsOrder([...validFavOrder, ...newFavs]);
      } catch (e) {
        setFavAppsOrder(currentFavorites);
      }
    } else {
      setFavAppsOrder(currentFavorites);
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    if (activeIdStr === overIdStr) return;

    // Check if handling Favorites (prefix 'fav-')
    if (activeIdStr.startsWith('fav-') && overIdStr.startsWith('fav-')) {
      setFavAppsOrder((items) => {
        const oldIndex = items.findIndex(id => `fav-${id}` === activeIdStr);
        const newIndex = items.findIndex(id => `fav-${id}` === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          localStorage.setItem("favAppOrder", JSON.stringify(newOrder));
          return newOrder;
        }
        return items;
      });
    }
    // Check if handling All Apps (no prefix or prefix 'app-')
    else if (!activeIdStr.startsWith('fav-') && !overIdStr.startsWith('fav-')) {
      setApps((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeIdStr);
        const newIndex = items.findIndex((item) => item.id === overIdStr);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        const orderIds = newOrder.map(app => app.id);
        localStorage.setItem("appOrder", JSON.stringify(orderIds));

        return newOrder;
      });
    }
  };

  const toggleFavorite = (id: string) => {
    const updatedApps = apps.map(app =>
      app.id === id ? { ...app, favorite: !app.favorite } : app
    );
    setApps(updatedApps);
    persistCustomApps(updatedApps);

    const app = updatedApps.find(a => a.id === id);
    if (app) {
      if (app.favorite) {
        setFavAppsOrder(prev => {
          const newOrder = [...prev, id];
          localStorage.setItem("favAppOrder", JSON.stringify(newOrder));
          return newOrder;
        });
      } else {
        setFavAppsOrder(prev => {
          const newOrder = prev.filter(favId => favId !== id);
          localStorage.setItem("favAppOrder", JSON.stringify(newOrder));
          return newOrder;
        });
      }
    }
  };

  const addApp = (newApp: AppItem) => {
    const updatedApps = [...apps, newApp];
    setApps(updatedApps);
    persistCustomApps(updatedApps);

    // Also update order
    const orderIds = updatedApps.map(app => app.id);
    localStorage.setItem("appOrder", JSON.stringify(orderIds));
  };

  const deleteApp = (id: string) => {
    const updatedApps = apps.filter(app => app.id !== id);
    setApps(updatedApps);
    persistCustomApps(updatedApps);

    const orderIds = updatedApps.map(app => app.id);
    localStorage.setItem("appOrder", JSON.stringify(orderIds));

    setFavAppsOrder(prev => {
      const newOrder = prev.filter(favId => favId !== id);
      localStorage.setItem("favAppOrder", JSON.stringify(newOrder));
      return newOrder;
    });
  };

  const persistCustomApps = (allApps: AppItem[]) => {
    const customApps = allApps.filter(app => app.id.startsWith("custom-"));
    localStorage.setItem("customApps", JSON.stringify(customApps));
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteAppsOrdered = favAppsOrder
    .map(id => apps.find(app => app.id === id))
    .filter((app): app is AppItem => !!app);

  // Identify Dragged Item
  const activeApp = activeId
    ? (activeId.startsWith('fav-')
      ? apps.find(a => `fav-${a.id}` === activeId)
      : apps.find(a => a.id === activeId))
    : null;

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

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
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

      <main className="pt-44 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Search Bar */}
          <div className="flex justify-center mb-16 px-4">
            <div className="relative w-full max-w-xl group">
              <div className="absolute inset-0 bg-zinc-900/5 dark:bg-white/5 blur-xl group-focus-within:bg-blue-500/10 transition-all rounded-full" />
              <div className="relative flex items-center bg-white/70 dark:bg-zinc-800/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 shadow-sm transition-all group-focus-within:border-blue-500/50 group-focus-within:shadow-lg group-focus-within:scale-[1.02]">
                <Search className="text-zinc-400 dark:text-zinc-500" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for apps..."
                  className="w-full bg-transparent border-none outline-none px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                  >
                    <X size={16} className="text-zinc-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          {!searchQuery && favoriteAppsOrdered.length > 0 && (
            <section className="mb-20">
              <div className="flex items-center gap-2 mb-8 text-zinc-400 dark:text-zinc-300">
                <Star size={18} />
                <h2 className="text-sm font-bold tracking-wider uppercase">Favorites</h2>
              </div>

              <SortableContext
                items={favoriteAppsOrdered.map(a => `fav-${a.id}`)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-8 gap-y-16">
                  {favoriteAppsOrdered.map((app) => (
                    <SortableAppIcon
                      key={`fav-${app.id}`}
                      id={`fav-${app.id}`}
                      app={app}
                      toggleFavorite={toggleFavorite}
                      onDelete={deleteApp}
                    />
                  ))}
                </div>
              </SortableContext>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-16" />
            </section>
          )}

          {/* All Apps Section */}
          <section>
            <div className="flex items-center gap-2 mb-8 text-zinc-400 dark:text-zinc-300">
              <LayoutGrid size={18} />
              <h2 className="text-sm font-bold tracking-wider uppercase">
                {searchQuery ? "Search Results" : "All Apps"}
              </h2>
            </div>

            {!searchQuery ? (
              <SortableContext
                items={filteredApps.map(a => a.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-8 gap-y-16">
                  {filteredApps.map((app) => (
                    <SortableAppIcon
                      key={app.id}
                      id={app.id}
                      app={app}
                      toggleFavorite={toggleFavorite}
                      onDelete={deleteApp}
                    />
                  ))}

                  <motion.div
                    layout
                    whileHover={{ y: -5 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] md:w-[100px] md:h-[100px] bg-zinc-100 dark:bg-zinc-800/50 rounded-[1.6rem] flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 transition-all group-hover:border-zinc-500 dark:group-hover:border-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800">
                      <Plus size={32} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                    </div>
                    <span className="text-base font-semibold text-zinc-500 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white">
                      Add App
                    </span>
                  </motion.div>
                </div>
              </SortableContext>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-8 gap-y-16">
                <AnimatePresence mode="popLayout">
                  {filteredApps.map((app) => (
                    <AppIcon key={app.id} app={app} toggleFavorite={toggleFavorite} onDelete={deleteApp} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeApp ? (
              <AppIcon
                app={activeApp}
                isFavoriteSection={activeId?.startsWith('fav-')}
                toggleFavorite={toggleFavorite}
                onDelete={deleteApp}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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
