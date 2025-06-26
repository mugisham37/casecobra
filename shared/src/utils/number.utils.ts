// Number utilities

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const round = (value: number, decimals: number = 0): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const isEven = (num: number): boolean => {
  return num % 2 === 0;
};

export const isOdd = (num: number): boolean => {
  return num % 2 !== 0;
};

export const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  
  return true;
};

export const factorial = (n: number): number => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

export const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

export const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

export const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b);
};

export const percentage = (value: number, total: number): number => {
  return (value / total) * 100;
};

export const percentageOf = (percentage: number, total: number): number => {
  return (percentage / 100) * total;
};

export const average = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const median = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const mode = (numbers: number[]): number[] => {
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
    maxFreq = Math.max(maxFreq, frequency[num]);
  });
  
  return Object.keys(frequency)
    .filter(key => frequency[Number(key)] === maxFreq)
    .map(Number);
};

export const sum = (numbers: number[]): number => {
  return numbers.reduce((total, num) => total + num, 0);
};

export const product = (numbers: number[]): number => {
  return numbers.reduce((total, num) => total * num, 1);
};

export const min = (numbers: number[]): number => {
  return Math.min(...numbers);
};

export const max = (numbers: number[]): number => {
  return Math.max(...numbers);
};

export const range = (numbers: number[]): number => {
  return max(numbers) - min(numbers);
};

export const variance = (numbers: number[]): number => {
  const avg = average(numbers);
  return average(numbers.map(num => Math.pow(num - avg, 2)));
};

export const standardDeviation = (numbers: number[]): number => {
  return Math.sqrt(variance(numbers));
};

export const normalize = (value: number, min: number, max: number): number => {
  return (value - min) / (max - min);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const map = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

export const isFloat = (value: number): boolean => {
  return !Number.isInteger(value);
};

export const isPositive = (value: number): boolean => {
  return value > 0;
};

export const isNegative = (value: number): boolean => {
  return value < 0;
};

export const isZero = (value: number): boolean => {
  return value === 0;
};

export const sign = (value: number): number => {
  return Math.sign(value);
};

export const abs = (value: number): number => {
  return Math.abs(value);
};

export const ceil = (value: number): number => {
  return Math.ceil(value);
};

export const floor = (value: number): number => {
  return Math.floor(value);
};

export const truncate = (value: number): number => {
  return Math.trunc(value);
};
