export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  priority: PriorityLevel;
  mastery: number; // Percentage (0 - 100)
  completed: boolean;
}

export interface Biometrics {
  stressLevel: number; // 0.0 to 1.0
  heartRate: number; // bpm
  focusIntensity: number; // 0 - 100%
  alphaRatio: number; // brainwave telemetry ratio
}

export interface APIPlanResponse {
  plan: string;
  isFallback: boolean;
}
