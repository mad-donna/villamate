const AMOUNT_STEP_KEY = 'amountStep';
const DEFAULT_STEP = 10000;

export const PRESET_STEPS = [1000, 5000, 10000, 50000, 100000] as const;

export function getAmountStep(): number {
  if (typeof window === 'undefined') return DEFAULT_STEP;
  const raw = localStorage.getItem(AMOUNT_STEP_KEY);
  if (!raw) return DEFAULT_STEP;
  const n = Number(raw);
  return n > 0 ? n : DEFAULT_STEP;
}

export function setAmountStep(step: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AMOUNT_STEP_KEY, String(step));
}
