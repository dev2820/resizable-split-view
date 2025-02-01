export const clamp = (min = -Infinity, max = Infinity, value: number) => {
  return Math.max(Math.min(value, max), min);
};
