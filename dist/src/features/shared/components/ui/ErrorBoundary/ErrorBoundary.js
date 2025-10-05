import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Modern React Error Boundary Component
 * Follows 2025 best practices with proper TypeScript typing
 */
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });
        // Call optional error callback
        this.props.onError?.(error, errorInfo);
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return (_jsxs("div", { className: "error-boundary p-6 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold text-red-800 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-red-600 mb-4", children: "An unexpected error occurred. Please try refreshing the page." }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs("details", { className: "mt-4", children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium text-red-700", children: "Error Details (Development)" }), _jsxs("pre", { className: "mt-2 p-3 bg-red-100 border border-red-300 rounded text-xs overflow-auto", children: [this.state.error.toString(), this.state.errorInfo?.componentStack] })] })), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors", children: "Refresh Page" })] }));
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map