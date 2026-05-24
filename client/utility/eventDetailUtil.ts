export interface ParsedRRule {
  FREQ?: string;
  INTERVAL: number; // Defaulting to 1 if missing
  COUNT?: number;
  UNTIL?: string;
  BYDAY?: string[];
  BYMONTH?: string[];
  BYYEARDAY?: string[];
  BYHOUR?: string[];
  // Catch-all for any other rules Google might throw at you
  [key: string]: any; 
}