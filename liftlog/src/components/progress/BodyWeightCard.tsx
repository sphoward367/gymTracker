import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from 'recharts';
import { bodyWeightService } from '@/services/bodyWeight/bodyWeightService';
import type { BodyWeightEntry } from '@/types/user';
import { formatShortDate } from '@/utils/formatters';

interface Props {
  userId: string;
}

interface ChartPoint {
  date: string;
  value: number;
}

function todayDateString(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Custom Recharts tooltip rendered with Tailwind classes only — no inline styles.
 * The `payload` and `label` props are provided by Recharts at runtime.
 */
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const raw = payload[0]?.value;
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  const display = isFinite(num) ? `${num.toFixed(1)} kg` : '—';

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs shadow-lg">
      <p className="mb-0.5 text-zinc-400">{label}</p>
      <p className="font-semibold text-on-surface">{display}</p>
    </div>
  );
}

export function BodyWeightCard({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<BodyWeightEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [todayWeight, setTodayWeight] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bodyWeightService.getHistory(userId, 30);
      setHistory(data);
      const todayStr = todayDateString();
      const todayEntry = data.find((e) => e.date === todayStr);
      setTodayWeight(todayEntry?.weight ?? null);
      if (todayEntry) setInputValue(String(todayEntry.weight));
    } catch (err) {
      console.error('Failed to load body weight history:', err);
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function handleLog() {
    const weight = parseFloat(inputValue);
    if (!isFinite(weight) || weight <= 0 || weight > 500) {
      setError('Enter a valid weight between 0 and 500 kg.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await bodyWeightService.logWeight(userId, weight);
    } catch (err) {
      console.error('Failed to save body weight:', err);
      setError('Failed to save. Please try again.');
      setSaving(false);
      return;
    }
    // Reload history separately — save already succeeded at this point
    try {
      await loadHistory();
    } catch {
      // loadHistory sets its own error; save was still successful
    }
    setSaving(false);
  }

  const chartData: ChartPoint[] = history.map((entry) => {
    const [year, month, day] = entry.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return { date: formatShortDate(d), value: entry.weight };
  });

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Body Weight</h2>
        {!loading && (
          todayWeight !== null ? (
            <span className="rounded-full bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-400">
              Logged today: {todayWeight}kg
            </span>
          ) : (
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
              Not logged today
            </span>
          )
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          aria-label="Body weight in kg"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. 80.5"
          className="min-h-[44px] flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-on-surface placeholder-zinc-500 focus:border-primary focus:outline-none"
          min="0"
          max="500"
          step="0.1"
        />
        <button
          type="button"
          onClick={() => void handleLog()}
          disabled={saving}
          className={`min-h-[44px] min-w-[44px] rounded-lg bg-primary px-5 font-medium text-on-primary transition-opacity active:opacity-80 ${
            saving ? 'opacity-50' : ''
          }`}
        >
          {saving ? 'Saving…' : todayWeight !== null ? 'Update' : 'Log'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}

      {/* Loading state */}
      {loading && (
        <p className="mt-4 text-center text-sm text-zinc-400">Loading…</p>
      )}

      {/* Chart or prompt */}
      {!loading && (
        <div className="mt-4">
          {history.length >= 2 ? (
            /* h-[180px] replaces the forbidden inline style={{ height: 180 }} */
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  {/* Custom tooltip component uses only Tailwind classes — no inline styles */}
                  <Tooltip content={<ChartTooltip />} />
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
          ) : (
            <p className="text-sm text-zinc-400">
              Log your weight twice to see your trend.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
