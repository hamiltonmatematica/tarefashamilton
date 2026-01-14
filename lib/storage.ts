import { supabase, isSupabaseConfigured, getCurrentUser } from './supabase';
import { Task, Category } from '../types';

const STORAGE_KEY = 'planner-hamilton-tasks';
const CATEGORIES_KEY = 'planner-hamilton-categories';

// Get current user ID from Supabase Auth
export async function getCurrentUserId(): Promise<string | null> {
    const user = await getCurrentUser();
    return user?.id || null;
}

// ==================== TASKS ====================

export async function getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured()) {
        // Fetch from Supabase
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('position', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }

        // Convert from database format
        return (data || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            urgency: task.urgency,
            category: task.category,
            dayOfWeek: task.day_of_week,
            scheduledDate: task.scheduled_date,
            position: task.position,
            notes: task.notes || '',
            isCompleted: task.is_completed,
            completedAt: task.completed_at,
            deletedAt: task.deleted_at,
            attachments: task.attachments || [],
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }));
    } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    if (isSupabaseConfigured()) {
        const user = await getCurrentUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                user_id: user.id,
                title: task.title,
                description: task.description || '',
                urgency: task.urgency,
                category: task.category,
                day_of_week: task.dayOfWeek,
                scheduled_date: task.scheduledDate,
                position: task.position,
                notes: task.notes || '',
                is_completed: task.isCompleted || false,
                completed_at: task.completedAt,
                deleted_at: task.deletedAt,
                attachments: task.attachments || []
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            urgency: data.urgency,
            category: data.category,
            dayOfWeek: data.day_of_week,
            scheduledDate: data.scheduled_date,
            position: data.position,
            notes: data.notes,
            isCompleted: data.is_completed,
            completedAt: data.completed_at,
            deletedAt: data.deleted_at,
            attachments: data.attachments,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    } else {
        // Fallback to localStorage
        const newTask: Task = {
            id: crypto.randomUUID(),
            ...task,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const tasks = await getTasks();
        tasks.push(newTask);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return newTask;
    }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    if (isSupabaseConfigured()) {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.urgency !== undefined) dbUpdates.urgency = updates.urgency;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.dayOfWeek !== undefined) dbUpdates.day_of_week = updates.dayOfWeek;
        if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        if (updates.deletedAt !== undefined) dbUpdates.deleted_at = updates.deletedAt;
        if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            return null;
        }

        return data ? {
            id: data.id,
            title: data.title,
            description: data.description,
            urgency: data.urgency,
            category: data.category,
            dayOfWeek: data.day_of_week,
            scheduledDate: data.scheduled_date,
            position: data.position,
            notes: data.notes,
            isCompleted: data.is_completed,
            completedAt: data.completed_at,
            deletedAt: data.deleted_at,
            attachments: data.attachments,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        } : null;
    } else {
        // Fallback to localStorage
        const tasks = await getTasks();
        const taskIndex = tasks.findIndex((t) => t.id === id);
        if (taskIndex === -1) return null;

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return tasks[taskIndex];
    }
}

export async function deleteTask(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        return !error;
    } else {
        // Fallback to localStorage
        const tasks = await getTasks();
        const filtered = tasks.filter((t) => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }
}

// ==================== CATEGORIES ====================

export async function getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return data || [];
    } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(CATEGORIES_KEY);
        return stored ? JSON.parse(stored) : [];
    }
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (isSupabaseConfigured()) {
        const user = await getCurrentUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('categories')
            .insert([{
                user_id: user.id,
                name: category.name,
                color: category.color
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Fallback to localStorage
        const newCategory: Category = {
            id: crypto.randomUUID(),
            ...category
        };
        const categories = await getCategories();
        categories.push(newCategory);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        return newCategory;
    }
}

export async function deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        return !error;
    } else {
        // Fallback to localStorage
        const categories = await getCategories();
        const filtered = categories.filter((c) => c.id !== id);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        return true;
    }
}
