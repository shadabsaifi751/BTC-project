import { useState, useEffect, useRef, useCallback } from 'react';

const BYBIT_WS_URL = 'wss://stream.bybit.com/v5/public/linear';

export function useBybitWebSocket(symbol = 'BTCUSDT') {
  const [data, setData] = useState({
    symbol,
    lastPrice: null,
    markPrice: null,
    high24h: null,
    low24h: null,
    turnover24h: null,
    price24hPcnt: null,
    prevPrice: null,
    priceTrend: 'neutral',
  });
  
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Connecting');
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('Connecting');
    const ws = new WebSocket(BYBIT_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Connected');
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [`tickers.${symbol}`],
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.topic === `tickers.${symbol}` && message.data) {
        const payload = message.data;
        
        setData(prev => {
          const newPrice = payload.lastPrice ? parseFloat(payload.lastPrice) : prev.lastPrice;
          const prevPriceVal = prev.lastPrice !== null ? prev.lastPrice : newPrice;
          
          let trend = prev.priceTrend;
          if (newPrice > prevPriceVal) trend = 'up';
          else if (newPrice < prevPriceVal) trend = 'down';

          // Update sparkline data
          if (newPrice !== prev.lastPrice && newPrice !== null) {
            setHistory(h => {
              const newHist = [...h, { time: Date.now(), price: newPrice }];
              if (newHist.length > 60) return newHist.slice(newHist.length - 60);
              return newHist;
            });
          }

          return {
            ...prev,
            lastPrice: newPrice,
            markPrice: payload.markPrice ? parseFloat(payload.markPrice) : prev.markPrice,
            high24h: payload.highPrice24h ? parseFloat(payload.highPrice24h) : prev.high24h,
            low24h: payload.lowPrice24h ? parseFloat(payload.lowPrice24h) : prev.low24h,
            turnover24h: payload.turnover24h ? parseFloat(payload.turnover24h) : prev.turnover24h,
            price24hPcnt: payload.price24hPcnt ? parseFloat(payload.price24hPcnt) : prev.price24hPcnt,
            prevPrice: prevPriceVal,
            priceTrend: trend,
          };
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setStatus('Error');
    };

    ws.onclose = () => {
      setStatus('Disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [symbol]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const reconnect = () => {
    if (wsRef.current) wsRef.current.close();
    else connect();
  };

  return { data, history, status, reconnect };
}
