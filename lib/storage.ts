import { supabase, isSupabaseConfigured, getCurrentUser } from './supabase';
import { Task, Category, Project, TaskStatus, Recurrence, ChecklistItem } from '../types';

const STORAGE_KEY = 'planner-hamilton-tasks';
const CATEGORIES_KEY = 'planner-hamilton-categories';
const PROJECTS_KEY = 'planner-hamilton-projects';

export async function getCurrentUserId(): Promise<string | null> {
    const user = await getCurrentUser();
    return user?.id || null;
}

// ==================== TASKS ====================

const rowToTask = (task: any): Task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    urgency: task.urgency,
    status: (task.status as TaskStatus) || (task.is_completed ? 'done' : 'todo'),
    category: task.category,
    projectId: task.project_id,
    dayOfWeek: task.day_of_week,
    scheduledDate: task.scheduled_date,
    dueDate: task.due_date,
    position: task.position,
    notes: task.notes || '',
    checklist: Array.isArray(task.checklist) ? task.checklist : [],
    recurrence: (task.recurrence as Recurrence) || 'none',
    isCompleted: task.is_completed,
    completedAt: task.completed_at,
    deletedAt: task.deleted_at,
    attachments: task.attachments || [],
    createdAt: task.created_at,
    updatedAt: task.updated_at
});

export async function getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('position', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }

        return (data || []).map(rowToTask);
    } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed: Task[] = stored ? JSON.parse(stored) : [];
        return parsed.map(t => ({
            ...t,
            status: t.status || (t.isCompleted ? 'done' : 'todo'),
            checklist: t.checklist || [],
            recurrence: t.recurrence || 'none',
        }));
    }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    if (isSupabaseConfigured()) {
        const user = await getCurrentUser();
        if (!user) throw new Error('No user logged in');

        const payload: any = {
            user_id: user.id,
            title: task.title,
            description: task.description || '',
            urgency: task.urgency,
            category: task.category,
            project_id: task.projectId,
            day_of_week: task.dayOfWeek,
            scheduled_date: task.scheduledDate,
            due_date: task.dueDate,
            position: task.position,
            notes: task.notes || '',
            is_completed: task.isCompleted || false,
            completed_at: task.completedAt,
            deleted_at: task.deletedAt,
            attachments: task.attachments || [],
            status: task.status || 'todo',
            checklist: task.checklist || [],
            recurrence: task.recurrence || 'none',
        };

        let { data, error } = await supabase
            .from('tasks')
            .insert([payload])
            .select()
            .single();

        // Fallback caso colunas novas ainda não existam no banco
        if (error && /status|checklist|recurrence|due_date/i.test(error.message || '')) {
            delete payload.status;
            delete payload.checklist;
            delete payload.recurrence;
            delete payload.due_date;
            const retry = await supabase.from('tasks').insert([payload]).select().single();
            data = retry.data;
            error = retry.error;
        }

        if (error) throw error;

        return rowToTask(data);
    } else {
        const newTask: Task = {
            id: crypto.randomUUID(),
            ...task,
            checklist: task.checklist || [],
            status: task.status || 'todo',
            recurrence: task.recurrence || 'none',
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
        if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
        if (updates.dayOfWeek !== undefined) dbUpdates.day_of_week = updates.dayOfWeek;
        if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        if (updates.deletedAt !== undefined) dbUpdates.deleted_at = updates.deletedAt;
        if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
        if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence;

        let { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error && /status|checklist|recurrence|due_date/i.test(error.message || '')) {
            delete dbUpdates.status;
            delete dbUpdates.checklist;
            delete dbUpdates.recurrence;
            delete dbUpdates.due_date;
            const retry = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error('Error updating task:', error);
            return null;
        }

        return data ? rowToTask(data) : null;
    } else {
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
        const categories = await getCategories();
        const filtered = categories.filter((c) => c.id !== id);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
        return true;
    }
}

// ==================== PROJECTS ====================

export async function getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }

        return (data || []).map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            color: p.color,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
    } else {
        const stored = localStorage.getItem(PROJECTS_KEY);
        return stored ? JSON.parse(stored) : [];
    }
}

export async function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    if (isSupabaseConfigured()) {
        const user = await getCurrentUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('projects')
            .insert([{
                user_id: user.id,
                name: project.name,
                description: project.description || '',
                color: project.color
            }])
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            color: data.color,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    } else {
        const newProject: Project = {
            id: crypto.randomUUID(),
            ...project,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const projects = await getProjects();
        projects.push(newProject);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return newProject;
    }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    if (isSupabaseConfigured()) {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.color !== undefined) dbUpdates.color = updates.color;

        const { data, error } = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) return null;
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            color: data.color,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    } else {
        const projects = await getProjects();
        const idx = projects.findIndex(p => p.id === id);
        if (idx === -1) return null;
        projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return projects[idx];
    }
}

export async function deleteProject(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        return !error;
    } else {
        const projects = await getProjects();
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
        return true;
    }
}
