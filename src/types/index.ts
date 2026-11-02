export type Tone = "purple" | "blue" | "green" | "amber" | "teal" | "rose";

export interface TrendPoint {
  date: string;
  revenue: number;
  orders: number;
  fulfilled: number;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  date: string;
  summary: string;
  source: string;
  tone: Tone;
  fields: Record<string, string | number | readonly string[]>;
}

export interface Finding {
  id: string;
  title: string;
  detail: string;
  kind: "Root cause" | "Impact";
  evidenceIds: readonly string[];
}

export interface ToolActivity {
  name: string;
  description: string;
  durationMs: number;
  tone: Tone;
  evidenceId: string;
}

export interface Connection {
  id: string;
  name: string;
  category: string;
  description: string;
  records: number;
  color: string;
  initials: string;
}
