import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ErrorMessage = ({ message, onDismiss }) => {
    if (!message)
        return null;
    return (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between", role: "alert", children: [_jsx("p", { className: "text-red-800", children: message }), onDismiss && (_jsx("button", { onClick: onDismiss, className: "text-red-600 hover:text-red-800", "aria-label": "Dismiss error", children: "\u00D7" }))] }));
};
