// Standalone replacement for Lovable's built-in error reporting integration.
// Swap this out for a real error-monitoring service (Sentry, LogRocket, etc.)
// when deploying outside of Lovable.
export function reportLovableError(error: unknown, context?: Record<string, unknown>) {
  console.error("[ErrorBoundary]", error, context);
}
