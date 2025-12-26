import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ColourfulText } from './components/ui/colourful-text';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { ErrorMessage } from './components/ErrorMessage';
import { useTodos } from './hooks/useTodos';
function App() {
    const { todos, loading, error, createTodo, updateTodo, deleteTodo, toggleComplete, } = useTodos();
    const [dismissedError, setDismissedError] = useState(null);
    const handleCreateTodo = async (todo) => {
        await createTodo(todo);
    };
    const handleUpdateTodo = async (id, updates) => {
        await updateTodo(id, updates);
    };
    const handleDeleteTodo = async (id) => {
        if (window.confirm('Are you sure you want to delete this TODO item?')) {
            await deleteTodo(id);
        }
    };
    const handleToggleComplete = async (id) => {
        await toggleComplete(id);
    };
    const displayError = error && error !== dismissedError ? error : null;
    // Check if error is a connection error and provide helpful message
    const isConnectionError = displayError?.toLowerCase().includes('cannot connect') ||
        displayError?.toLowerCase().includes('network error') ||
        displayError?.toLowerCase().includes('backend server');
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8", children: _jsxs("div", { className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("header", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: "/logo.png", alt: "Todo List Logo", className: "h-10 w-10 mr-3" }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: _jsx(ColourfulText, { text: "TODO List" }) })] }), _jsx("h3", { className: "text-xl font-bold underline", children: "By William Jiang" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your tasks efficiently" })] }), isConnectionError && (_jsxs("div", { className: "mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx("p", { className: "text-yellow-800 font-semibold", children: "Backend Connection Issue" }), _jsxs("p", { className: "text-yellow-700 text-sm mt-1", children: ["Make sure the backend server is running on ", _jsx("code", { className: "bg-yellow-100 px-1 rounded", children: "http://localhost:8173" })] }), _jsxs("p", { className: "text-yellow-700 text-sm mt-1", children: ["Run: ", _jsx("code", { className: "bg-yellow-100 px-1 rounded", children: "cd backend/src && uvicorn app.main:app --reload --port 8173" })] })] })), _jsx(ErrorMessage, { message: displayError, onDismiss: () => setDismissedError(error || null) }), _jsx(TodoForm, { onSubmit: handleCreateTodo, loading: loading }), loading && todos.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", role: "status", "aria-live": "polite", children: "Loading..." })) : (_jsx(TodoList, { todos: todos, onToggleComplete: handleToggleComplete, onUpdate: handleUpdateTodo, onDelete: handleDeleteTodo, loading: loading }))] }) }));
}
export default App;
