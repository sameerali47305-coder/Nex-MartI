"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getRemaining(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function DealsCountdown({ endTime }: { endTime: string | null }) {
  const [remaining, setRemaining] = useState(() => (endTime ? getRemaining(endTime) : null));

  useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => setRemaining(getRemaining(endTime)), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime || !remaining) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    ...(remaining.d > 0 ? [{ label: "d", value: remaining.d }] : []),
    { label: "h", value: remaining.h },
    { label: "m", value: remaining.m },
    { label: "s", value: remaining.s },
  ];

  return (
<div className="sticky top-20 z-30 mx-auto mb-6 flex w-fit items-center gap-3 rounded-full border border-orange-200 bg-white px-5 py-3 shadow-lg">
      <Clock size={16} className="text-orange-500" />
      <span className="text-sm font-semibold text-gray-700">OFFER ENDS IN:</span>
      <div className="flex items-center gap-1.5">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1.5">
            <span
              className={`rounded-md px-2.5 py-1.5 text-sm font-bold text-white ${
                i === units.length - 1 ? "bg-orange-500" : "bg-gray-800"
              }`}
            >
              {pad(u.value)}
            </span>
            {i < units.length - 1 && <span className="text-gray-400">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}