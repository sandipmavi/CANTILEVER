import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { Task } from '../types';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await tasksAPI.getTasks();
      if (response.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const response = await tasksAPI.createTask(taskData);
      if (response.success) {
        setTasks(prev => [...prev, response.data.task]);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Error creating task:', error);
      setLoading(false);
      return false;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const response = await tasksAPI.updateTask(taskId, updates);
      if (response.success) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? response.data.task : task
        ));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Error updating task:', error);
      setLoading(false);
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const response = await tasksAPI.deleteTask(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Error deleting task:', error);
      setLoading(false);
      return false;
    }
  };

  const filterTasks = (filters: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  }) => {
    let filteredTasks = [...tasks];

    if (filters.status && filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    if (filters.category && filters.category !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    if (filters.search) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filteredTasks;
  };

  const sortTasks = (tasksToSort: Task[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    return [...tasksToSort].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Task];
      let bValue: any = b[sortBy as keyof Task];

      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
      }

      if (sortBy === 'dueDate') {
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      }

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    filterTasks,
    sortTasks,
    refreshTasks: loadTasks
  };
};