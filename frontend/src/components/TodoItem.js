import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { AceternityButton } from './ui/aceternity-button';
import { Button } from './ui/button';
export const TodoItemComponent = ({ todo, onToggleComplete, onUpdate, onDelete, loading = false, }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(todo.description);
    const [editPriority, setEditPriority] = useState(todo.priority);
    const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
    const [editCategory, setEditCategory] = useState(todo.category || '');
    const [editError, setEditError] = useState(null);
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
    const handleSave = () => {
        setEditError(null);
        const validationError = validateDescription(editDescription);
        if (validationError) {
            setEditError(validationError);
            return;
        }
        if (onUpdate) {
            try {
                onUpdate(todo.id, {
                    description: editDescription.trim(),
                    priority: editPriority,
                    due_date: editDueDate || undefined,
                    category: editCategory.trim() || undefined,
                });
                setIsEditing(false);
                setEditError(null);
            }
            catch (err) {
                setEditError(err instanceof Error ? err.message : 'Failed to update todo');
            }
        }
    };
    const handleCancel = () => {
        setEditDescription(todo.description);
        setEditPriority(todo.priority);
        setEditDueDate(todo.due_date || '');
        setEditCategory(todo.category || '');
        setIsEditing(false);
        setEditError(null);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        else if (e.key === 'Escape') {
            handleCancel();
        }
    };
    return (_jsxs("div", { className: `flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg transition-colors ${todo.completed
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-gray-300'}`, children: [_jsx("input", { type: "checkbox", checked: todo.completed, onChange: () => onToggleComplete?.(todo.id), disabled: loading || isEditing, className: "w-5 h-5 text-blue-600 rounded focus:ring-blue-500", "aria-label": `Mark "${todo.description}" as ${todo.completed ? 'incomplete' : 'complete'}` }), _jsx("div", { className: "flex-1", children: isEditing ? (_jsxs("div", { children: [_jsx("textarea", { value: editDescription, onChange: (e) => {
                                setEditDescription(e.target.value);
                                setEditError(null);
                            }, onKeyDown: handleKeyDown, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 2, disabled: loading, maxLength: 500, autoFocus: true, "aria-label": "Edit TODO description" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2", children: [_jsxs("select", { value: editPriority, onChange: (e) => setEditPriority(e.target.value), className: "px-2 py-1 border border-gray-300 rounded text-sm outline-none", children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" })] }), _jsx("input", { type: "datetime-local", value: editDueDate, onChange: (e) => setEditDueDate(e.target.value), className: "px-2 py-1 border border-gray-300 rounded text-sm outline-none" }), _jsx("input", { type: "text", value: editCategory, onChange: (e) => setEditCategory(e.target.value), placeholder: "Category", className: "px-2 py-1 border border-gray-300 rounded text-sm outline-none" })] }), editError && (_jsx("p", { className: "mt-1 text-sm text-red-600", role: "alert", children: editError })), editDescription.length > 0 && (_jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [editDescription.length, "/500 characters"] })), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsxs(AceternityButton, { onClick: handleSave, variant: "edit", disabled: loading || !editDescription.trim(), "aria-label": "Save changes", className: "text-sm px-4 py-2", children: [_jsx(Save, { className: "w-4 h-4" }), "Save"] }), _jsxs(Button, { onClick: handleCancel, variant: "outline", disabled: loading, "aria-label": "Cancel editing", className: "text-sm", children: [_jsx(X, { className: "w-4 h-4 mr-1" }), "Cancel"] })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: `${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`, children: todo.description }), _jsxs("div", { className: "flex flex-wrap gap-2 mt-1", children: [_jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${todo.priority === 'High'
                                        ? 'bg-red-100 text-red-600'
                                        : todo.priority === 'Medium'
                                            ? 'bg-yellow-100 text-yellow-600'
                                            : 'bg-blue-100 text-blue-600'}`, children: todo.priority }), todo.category && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium", children: todo.category })), todo.due_date && (_jsxs("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-medium ${new Date(todo.due_date) < new Date()
                                        ? 'bg-red-50 text-red-500'
                                        : 'bg-green-50 text-green-600'}`, children: ["Due: ", new Date(todo.due_date).toLocaleString()] })), _jsxs("span", { className: "text-[10px] text-gray-400 py-0.5", children: ["Created: ", new Date(todo.created_at).toLocaleString()] })] })] })) }), !isEditing && (_jsxs("div", { className: "flex gap-2 w-full sm:w-auto justify-end sm:justify-start", children: [onUpdate && (_jsxs(AceternityButton, { onClick: () => setIsEditing(true), variant: "edit", disabled: loading, "aria-label": `Edit "${todo.description}"`, title: "Edit this TODO item", className: "text-sm px-4 py-2", children: [_jsx(Edit2, { className: "w-4 h-4" }), "Edit"] })), onDelete && (_jsxs(AceternityButton, { onClick: () => onDelete(todo.id), variant: "delete", disabled: loading, "aria-label": `Delete "${todo.description}"`, title: "Delete this TODO item", className: "text-sm px-4 py-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Delete"] }))] }))] }));
};
