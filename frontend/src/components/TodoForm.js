import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AceternityButton } from './ui/aceternity-button';
export const TodoForm = ({ onSubmit, loading = false }) => {
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const validateDescription = (desc) => {
        const trimmed = desc.trim();
        if (!trimmed) {
            return 'Description cannot be empty or whitespace-only';
        }
        if (trimmed.length > 500) {
            return 'Description cannot exceed 500 characters';
        }
        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const validationError = validateDescription(description);
        if (validationError) {
            setError(validationError);
            return;
        }
        try {
            await onSubmit({
                description: description.trim(),
                priority,
                due_date: dueDate || undefined,
                category: category.trim() || undefined,
            });
            setDescription('');
            setPriority('Medium');
            setDueDate('');
            setCategory('');
            setError(null);
            setShowAdvanced(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create todo');
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "mb-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [_jsx("input", { type: "text", value: description, onChange: (e) => {
                            setDescription(e.target.value);
                            setError(null);
                        }, onKeyDown: (e) => {
                            if (e.key === 'Enter' && !loading && description.trim()) {
                                handleSubmit(e);
                            }
                        }, placeholder: "Enter a new TODO item...", className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: loading, maxLength: 500, "aria-label": "TODO item description" }), _jsxs(AceternityButton, { type: "submit", variant: "add", disabled: loading || !description.trim(), "aria-label": "Add TODO item", children: [_jsx(Plus, { className: "w-4 h-4" }), loading ? 'Adding...' : 'Add'] })] }), _jsx("div", { className: "mt-2", children: _jsx("button", { type: "button", onClick: () => setShowAdvanced(!showAdvanced), className: "text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1", children: showAdvanced ? 'Hide options' : 'More options (Priority, Date, Category)' }) }), showAdvanced && (_jsxs("div", { className: "mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Priority" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm", children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" })] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Due Date" }), _jsx("input", { type: "datetime-local", value: dueDate, onChange: (e) => setDueDate(e.target.value), className: "px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Category" }), _jsx("input", { type: "text", value: category, onChange: (e) => setCategory(e.target.value), placeholder: "e.g. Work, Personal", className: "px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" })] })] })), error && (_jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: error })), description.length > 0 && (_jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [description.length, "/500 characters"] }))] }));
};
