
import { Urgency, DayOfWeek, Category, TaskStatus, Recurrence } from './types';

export const URGENCY_CONFIG = {
  [Urgency.CRITICAL]: { label: 'Crítica', color: 'bg-red-500', text: 'text-red-700', border: 'border-red-500', bg: 'bg-red-50' },
  [Urgency.HIGH]: { label: 'Alta', color: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', bg: 'bg-orange-50' },
  [Urgency.MEDIUM]: { label: 'Média', color: 'bg-yellow-400', text: 'text-yellow-700', border: 'border-yellow-400', bg: 'bg-yellow-50' },
  [Urgency.LOW]: { label: 'Baixa', color: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', bg: 'bg-green-50' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; text: string; border: string }> = {
  backlog: { label: 'Backlog', color: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  todo: { label: 'A Fazer', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  doing: { label: 'Em Andamento', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  blocked: { label: 'Bloqueada', color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
  done: { label: 'Concluída', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
};

export const STATUS_ORDER: TaskStatus[] = ['backlog', 'todo', 'doing', 'blocked', 'done'];

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'Sem repetição',
  daily: 'Todos os dias',
  weekdays: 'Dias úteis (Seg-Sex)',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<string, string> = {
  inbox: 'Caixa de Entrada',
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Pessoal', color: '#3b82f6' },
  { id: '2', name: 'Áurea', color: '#8b5cf6' },
  { id: '3', name: 'Tráfego Pago', color: '#10b981' },
  { id: '4', name: 'Consultoria IA', color: '#f59e0b' },
];

export const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayISO = (): string => formatDate(new Date());

export const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatPrettyDate = (dateStr?: string): string => {
  if (!dateStr) return 'Sem data';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const isOverdue = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return dateStr < todayISO();
};

export const isToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return dateStr === todayISO();
};

export const getWeekDates = (startOfWeek: Date): { date: string, label: string, dayKey: DayOfWeek }[] => {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.map((day, index) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + index);
    return {
      date: formatDate(d),
      label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
      dayKey: day
    };
  });
};
