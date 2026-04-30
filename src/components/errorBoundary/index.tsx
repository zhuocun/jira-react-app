import { Button, Result } from "antd";
import React from "react";

import { microcopy } from "../../constants/microcopy";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: (error: Error, retry: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * Top-level error boundary used by routed pages. Recovers via remount on
 * Retry. Implements Phase 3.7 of the optimization plan and Nielsen heuristic
 * #9 (help users recover from errors).
 */
class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(_error: Error) {
        // Intentionally silent. Production telemetry should be wired in
        // via a context-injected logger, not via console (which the
        // linter forbids and which floods test output).
    }

    handleRetry = () => {
        this.setState({ error: null });
    };

    render() {
        const { error } = this.state;
        const { children, fallback } = this.props;
        if (!error) return children;
        if (fallback) return fallback(error, this.handleRetry);
        return (
            <Result
                status="error"
                title="Something went wrong"
                subTitle={error.message || microcopy.feedback.loadFailed}
                extra={
                    <Button onClick={this.handleRetry} type="primary">
                        {microcopy.actions.retry}
                    </Button>
                }
            />
        );
    }
}

export default ErrorBoundary;
