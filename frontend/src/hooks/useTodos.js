import { useState, useEffect } from 'react';
import { todoApi } from '../services/api';
export const useTodos = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Load todos on mount
    useEffect(() => {
        loadTodos();
    }, []);
    const loadTodos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await todoApi.getAll();
            setTodos(data);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load todos';
            setError(errorMessage);
            console.error('Error loading todos:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const createTodo = async (todo) => {
        setLoading(true);
        setError(null);
        try {
            const newTodo = await todoApi.create(todo);
            setTodos((prev) => [newTodo, ...prev]);
            return newTodo;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create todo';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const updateTodo = async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await todoApi.update(id, updates);
            setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
            return updated;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
            setError(errorMessage);
            // Refresh list on error (e.g., 404)
            if (err instanceof Error && err.message.includes('not found')) {
                loadTodos();
            }
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const deleteTodo = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await todoApi.delete(id);
            setTodos((prev) => prev.filter((todo) => todo.id !== id));
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete todo';
            setError(errorMessage);
            // Refresh list on error
            loadTodos();
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const toggleComplete = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await todoApi.toggleComplete(id);
            setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
            return updated;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle todo';
            setError(errorMessage);
            // Refresh list on error
            loadTodos();
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    return {
        todos,
        loading,
        error,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        refreshTodos: loadTodos,
    };
};
