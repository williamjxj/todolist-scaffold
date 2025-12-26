import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TodoItemComponent } from './TodoItem';
export const TodoList = ({ todos, onToggleComplete, onUpdate, onDelete, loading = false, }) => {
    if (todos.length === 0) {
        return (_jsx("div", { className: "text-center py-12 text-gray-500", role: "status", children: _jsx("p", { children: "No TODO items yet. Create one to get started!" }) }));
    }
    const pendingTodos = todos.filter((todo) => !todo.completed);
    const completedTodos = todos.filter((todo) => todo.completed);
    return (_jsxs("div", { className: "space-y-4", children: [pendingTodos.length > 0 && (_jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-semibold mb-3 text-gray-700", id: "pending-heading", children: ["Pending (", pendingTodos.length, ")"] }), _jsx("div", { className: "space-y-2", children: pendingTodos.map((todo) => (_jsx(TodoItemComponent, { todo: todo, onToggleComplete: onToggleComplete, onUpdate: onUpdate, onDelete: onDelete, loading: loading }, todo.id))) })] })), completedTodos.length > 0 && (_jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-semibold mb-3 text-gray-500", id: "completed-heading", children: ["Completed (", completedTodos.length, ")"] }), _jsx("div", { className: "space-y-2", children: completedTodos.map((todo) => (_jsx(TodoItemComponent, { todo: todo, onToggleComplete: onToggleComplete, onUpdate: onUpdate, onDelete: onDelete, loading: loading }, todo.id))) })] }))] }));
};
