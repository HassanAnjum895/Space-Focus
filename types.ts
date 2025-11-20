export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export enum TimerMode {
  FOCUS = 'Focus',
  SHORT_BREAK = 'Short Break',
  LONG_BREAK = 'Long Break',
}

export interface TimerSettings {
  [TimerMode.FOCUS]: number;
  [TimerMode.SHORT_BREAK]: number;
  [TimerMode.LONG_BREAK]: number;
}

export const DEFAULT_TIMES: TimerSettings = {
  [TimerMode.FOCUS]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
};