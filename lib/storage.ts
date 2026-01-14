import { Task } from '../types';

const STORAGE_KEY = 'planner-hamilton-tasks';

/**
 * Get all tasks from localStorage
 */
export function getTasks(): Task[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

/**
 * Save tasks to localStorage
 */
export function saveTasks(tasks: Task[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

/**
 * Add a new task
 */
export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const tasks = getTasks();
    const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

/**
 * Update an existing task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = getTasks();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) return null;

    const updatedTask = {
        ...tasks[index],
        ...updates,
        id: tasks[index].id, // Preserve ID
        updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    saveTasks(tasks);
    return updatedTask;
}

/**
 * Delete a task
 */
export function deleteTask(id: string): boolean {
    const tasks = getTasks();
    const filtered = tasks.filter((t) => t.id !== id);

    if (filtered.length === tasks.length) return false;

    saveTasks(filtered);
    return true;
}

/**
 * Get tasks for a specific column/date
 */
export function getTasksByColumn(columnId: string): Task[] {
    return getTasks().filter((task) => task.columnId === columnId);
}

/**
 * Get tasks for a date range
 */
export function getTasksByDateRange(startDate: string, endDate: string): Task[] {
    const tasks = getTasks();
    return tasks.filter((task) => {
        if (task.columnId === 'inbox') return false;
        return task.columnId >= startDate && task.columnId <= endDate;
    });
}

/**
 * Clear all tasks (for testing/reset)
 */
export function clearAllTasks(): void {
    localStorage.removeItem(STORAGE_KEY);
}
