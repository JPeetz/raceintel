"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  selectedDate: string;
}

export function RaceDateNav({ selectedDate }: Props) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const days = [];
  for (let i = -1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const label =
      i === -1
        ? "Yesterday"
        : i === 0
        ? "Today"
        : i === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    days.push({ dateStr, label, isToday: i === 0, isWeekend: d.getDay() === 0 || d.getDay() === 6 });
  }

  const prevDate = new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split("T")[0];
  const nextDate = new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split("T")[0];

  return (
    <div className="border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link
            href={`/races?date=${prevDate}`}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
            {days.map(({ dateStr, label, isToday }) => {
              const isActive = dateStr === selectedDate;
              return (
                <Link
                  key={dateStr}
                  href={`/races?date=${dateStr}`}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold"
                      : "border border-transparent text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {isToday && !isActive ? <span className="mr-1">●</span> : null}
                  {label}
                </Link>
              );
            })}
          </div>

          <Link
            href={`/races?date=${nextDate}`}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
