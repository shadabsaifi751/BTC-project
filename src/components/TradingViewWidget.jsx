import { useEffect, useRef, memo } from "react";

function TradingViewWidget({ symbol = "BTCUSDT", theme = "dark" }) {
  const container = useRef();

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = "";

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "BYBIT:${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "${theme}",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "backgroundColor": "rgba(0, 0, 0, 0)",
          "gridColor": "${theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}",
          "hide_top_toolbar": false,
          "hide_legend": false,
          "save_image": false,
          "container_id": "tradingview_widget",
          "allow_symbol_change": false,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }
      `;
      container.current.appendChild(script);
    }
  }, [theme, symbol]);

  return (
    <div className="w-full h-full relative" ref={container}>
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
}

export default memo(TradingViewWidget);
