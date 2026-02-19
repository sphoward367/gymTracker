import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatShortDate } from '@/utils/formatters';
import type { ExerciseHistoryEntry } from '@/types/workout';

type Tab = 'heaviest' | 'volume';

interface ChartPoint {
  date: string;
  value: number;
}

interface Props {
  history: ExerciseHistoryEntry[];
}

export function ExerciseCharts({ history }: Props) {
  const [tab, setTab] = useState<Tab>('heaviest');

  // History arrives newest-first from the service — reverse for chronological chart axis
  const chronological = [...history].reverse();

  const heaviestPoints: ChartPoint[] = chronological.reduce<ChartPoint[]>((acc, entry) => {
    const validSets = entry.sets.filter(
      (s) => s.completed && s.type !== 'warmup' && s.weight > 0,
    );
    if (validSets.length === 0) return acc;

    const maxWeight = Math.max(...validSets.map((s) => s.weight));
    acc.push({ date: formatShortDate(entry.startedAt), value: maxWeight });
    return acc;
  }, []);

  const volumePoints: ChartPoint[] = chronological.map((entry) => {
    const total = entry.sets
      .filter((s) => s.completed && s.type !== 'warmup')
      .reduce((sum, s) => sum + s.weight * s.reps, 0);
    return { date: formatShortDate(entry.startedAt), value: total };
  });

  const activePoints = tab === 'heaviest' ? heaviestPoints : volumePoints;
  const minSessions = tab === 'heaviest' ? heaviestPoints.length < 2 : chronological.length < 2;

  if (minSessions) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        Log this exercise at least twice to see progress charts.
      </p>
    );
  }

  const yLabel = 'kg';

  return (
    <div className="mx-4 mb-4">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800">
        <button
          className={`flex-1 min-h-[44px] py-2 text-sm transition-colors ${
            tab === 'heaviest'
              ? 'border-b-2 border-primary text-primary font-semibold'
              : 'text-zinc-400'
          }`}
          onClick={() => setTab('heaviest')}
        >
          1RM
        </button>
        <button
          className={`flex-1 min-h-[44px] py-2 text-sm transition-colors ${
            tab === 'volume'
              ? 'border-b-2 border-primary text-primary font-semibold'
              : 'text-zinc-400'
          }`}
          onClick={() => setTab('volume')}
        >
          Volume
        </button>
      </div>

      {/* Chart */}
      <div className="rounded-b-xl bg-surface pt-4 pb-2 px-2">
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activePoints} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : parseFloat(String(value));
                  return [`${isFinite(num) ? num.toFixed(1) : '—'} ${yLabel}`, ''] as [string, string];
                }}
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#f4f4f5',
                }}
                labelStyle={{ color: '#a1a1aa', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
