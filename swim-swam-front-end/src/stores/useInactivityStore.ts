import { create } from 'zustand';

type InactivityState = {
  inactiveIntervals: number;
  warningVisible: boolean;
  countdownSeconds: number;
  recordInactiveInterval: () => void;
  decrementCountdown: () => void;
  resetInactivity: () => void;
};

const WARNING_INTERVAL_COUNT = 5;
const WARNING_COUNTDOWN_SECONDS = 4 * 60;

export const useInactivityStore = create<InactivityState>((set) => ({
  inactiveIntervals: 0,
  warningVisible: false,
  countdownSeconds: 0,
  recordInactiveInterval: () => set((state) => {
    if (state.warningVisible) return state;

    const inactiveIntervals = state.inactiveIntervals + 1;
    if (inactiveIntervals < WARNING_INTERVAL_COUNT) {
      return { inactiveIntervals };
    }

    return {
      inactiveIntervals,
      warningVisible: true,
      countdownSeconds: WARNING_COUNTDOWN_SECONDS,
    };
  }),
  decrementCountdown: () => set((state) => ({
    countdownSeconds: Math.max(0, state.countdownSeconds - 1),
  })),
  resetInactivity: () => set({
    inactiveIntervals: 0,
    warningVisible: false,
    countdownSeconds: 0,
  }),
}));
