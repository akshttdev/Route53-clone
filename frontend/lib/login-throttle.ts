const STORAGE_KEY = "login_throttle_v1";
const MAX_FAILURES = 5;
const COOLDOWN_MS = 45_000;

type ThrottleState = {
  failures: number;
  lockedUntil: number;
};

function read(): ThrottleState {
  if (typeof window === "undefined") {
    return { failures: 0, lockedUntil: 0 };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { failures: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw) as ThrottleState;
    return {
      failures: Number(parsed.failures) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return { failures: 0, lockedUntil: 0 };
  }
}

function write(state: ThrottleState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const loginThrottle = {
  /** Returns remaining cooldown seconds, or 0 if not locked. */
  getCooldownSeconds(): number {
    const { lockedUntil } = read();
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  },

  isLocked(): boolean {
    return this.getCooldownSeconds() > 0;
  },

  recordFailure(): { locked: boolean; cooldownSeconds: number } {
    const state = read();
    if (state.lockedUntil > Date.now()) {
      return {
        locked: true,
        cooldownSeconds: this.getCooldownSeconds(),
      };
    }

    const failures = state.failures + 1;
    if (failures >= MAX_FAILURES) {
      write({ failures: 0, lockedUntil: Date.now() + COOLDOWN_MS });
      return { locked: true, cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000) };
    }

    write({ failures, lockedUntil: 0 });
    return { locked: false, cooldownSeconds: 0 };
  },

  recordSuccess() {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
