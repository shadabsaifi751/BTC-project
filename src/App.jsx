import React, { useState, useEffect, useRef } from "react";
import { useBybitWebSocket } from "./hooks/useBybitWebSocket";
import TradingViewWidget from "./components/TradingViewWidget";
import SparklineChart from "./components/SparklineChart";
import {
  Activity,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  RefreshCcw,
  WifiOff,
  Wifi,
} from "lucide-react";

function App() {
  const [theme, setTheme] = useState("dark");
  const { data, history, status, reconnect } = useBybitWebSocket("BTCUSDT");
  const priceRef = useRef(data.lastPrice);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (data.lastPrice && data.lastPrice !== priceRef.current) {
      if (priceRef.current) {
        setFlashClass(
          data.lastPrice > priceRef.current ? "flash-up" : "flash-down",
        );
        setTimeout(() => setFlashClass(""), 1000);
      }
      priceRef.current = data.lastPrice;
    }
  }, [data.lastPrice]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const formatPrice = (p) =>
    p !== null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(p)
      : "--";
  const formatVol = (v) =>
    v !== null
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          compactDisplay: "short",
        }).format(v)
      : "--";

  const isUp = (parseFloat(data.price24hPcnt) || 0) >= 0;
  const sparklineColor =
    data.priceTrend === "up"
      ? "#10b981"
      : data.priceTrend === "down"
        ? "#ef4444"
        : theme === "dark"
          ? "#c0c6d4"
          : "#475569";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <div className="bg-orange-500 rounded-full p-2 text-white shrink-0">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            BTC <span className="opacity-50 font-normal">/ USDT</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border glass-effect ${status === "Connected" ? "text-emerald-500 border-emerald-500/30" : "text-rose-500 border-rose-500/30"}`}
          >
            {status === "Connected" ? (
              <Wifi size={16} />
            ) : status === "Connecting" ? (
              <Activity size={16} className="animate-pulse" />
            ) : (
              <WifiOff size={16} />
            )}
            {status}
            {status !== "Connected" && (
              <button
                onClick={reconnect}
                className="ml-2 hover:bg-rose-500/20 p-1 rounded-full text-rose-500 transition-colors"
                title="Reconnect"
              >
                <RefreshCcw size={14} />
              </button>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-effect hover:scale-110 active:scale-95 transition-all text-current"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Main Price Card */}
        <div className="glass-effect rounded-2xl p-6 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium opacity-60 flex items-center gap-2 tracking-wide uppercase">
              Last Traded Price
            </span>
            <div
              className={`flex items-center gap-1 font-semibold px-2.5 py-1 rounded backdrop-blur-sm text-sm ${isUp ? "text-emerald-500 bg-emerald-500/20" : "text-rose-500 bg-rose-500/20"}`}
            >
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {data.price24hPcnt !== null
                ? data.price24hPcnt > 0
                  ? "+"
                  : ""
                : ""}
              {(Number(data.price24hPcnt || 0) * 100).toFixed(2)}%
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 w-full">
            <div className="flex flex-col z-10">
              <span
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter ${flashClass}`}
              >
                {formatPrice(data.lastPrice)}
              </span>
            </div>

            <div className="hidden sm:block h-16 sm:h-20 w-32 sm:w-48 opacity-80 z-10 pb-2">
              <SparklineChart data={history} color={sparklineColor} />
            </div>
          </div>
        </div>

        {/* 24h Stats Cards */}
        <div className="grid grid-rows-2 gap-4 col-span-1 h-full">
          <div className="glass-effect rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs uppercase opacity-60 font-semibold mb-1">
              Mark Price
            </span>
            <span className="text-xl font-bold">
              {formatPrice(data.markPrice)}
            </span>
          </div>
          <div className="glass-effect rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs uppercase opacity-60 font-semibold mb-1">
              24h Turnover (USD)
            </span>
            <span className="text-xl font-bold">
              {formatVol(data.turnover24h)}
            </span>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4 col-span-1 h-full">
          <div className="glass-effect rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs uppercase opacity-60 font-semibold mb-1">
              24h High
            </span>
            <span className="text-xl font-bold text-up">
              {formatPrice(data.high24h)}
            </span>
          </div>
          <div className="glass-effect rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs uppercase opacity-60 font-semibold mb-1">
              24h Low
            </span>
            <span className="text-xl font-bold text-down">
              {formatPrice(data.low24h)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-[500px] lg:h-[600px] glass-effect rounded-2xl overflow-hidden p-1 relative z-0">
        <TradingViewWidget theme={theme} symbol="BTCUSDT" />
      </div>
    </div>
  );
}

export default App;
