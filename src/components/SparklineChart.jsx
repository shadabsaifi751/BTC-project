import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { memo } from "react";

function SparklineChart({ data, color }) {
  if (!data || data.length === 0)
    return (
      <div className="h-full w-full flex items-center justify-center text-sm opacity-50">
        Waiting for data...
      </div>
    );

  const prices = data.map((d) => d.price).filter((p) => !isNaN(p));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const buffer = (max - min) * 0.1 || 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <YAxis domain={[min - buffer, max + buffer]} hide />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default memo(SparklineChart);
