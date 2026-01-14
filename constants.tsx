
import { Urgency, DayOfWeek, Category } from './types';

export const URGENCY_CONFIG = {
  [Urgency.CRITICAL]: { label: 'Crítica', color: 'bg-red-500', text: 'text-red-700', border: 'border-red-500', bg: 'bg-red-50' },
  [Urgency.HIGH]: { label: 'Alta', color: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', bg: 'bg-orange-50' },
  [Urgency.MEDIUM]: { label: 'Média', color: 'bg-yellow-400', text: 'text-yellow-700', border: 'border-yellow-400', bg: 'bg-yellow-50' },
  [Urgency.LOW]: { label: 'Baixa', color: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', bg: 'bg-green-50' },
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
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
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
