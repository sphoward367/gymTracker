export interface TimerState {
  isRunning: boolean;
  remaining: number;
  totalDuration: number;
  startedAt: number | null;
  exerciseId: string;
}
