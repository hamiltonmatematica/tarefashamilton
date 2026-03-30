
export enum Urgency {
  CRITICAL = 'P0',
  HIGH = 'P1',
  MEDIUM = 'P2',
  LOW = 'P3'
}

export type DayOfWeek = 'inbox' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  size?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  urgency: Urgency;
  category: string; // Category ID
  projectId?: string; // Optional link to a project
  dayOfWeek: DayOfWeek;
  scheduledDate?: string; // YYYY-MM-DD
  position: number;
  notes: string;
  isCompleted: boolean;
  completedAt?: string;
  deletedAt?: string; // For 30-day trash retention
  attachments: TaskAttachment[]; // Images, PDFs, etc
  createdAt: string;
  updatedAt?: string;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  filters: {
    urgency: Urgency | null;
    category: string | null;
    projectId: string | null;
    search: string;
  };
  showCompleted: boolean;
}
