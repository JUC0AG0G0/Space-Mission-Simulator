import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearSavedMission } from '../simulation/persistence/mission-save';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches unexpected render errors anywhere below it and shows a minimal
 * fallback screen instead of leaving the user on a blank page — only a class
 * component can implement `getDerivedStateFromError`/`componentDidCatch`.
 * Errors are only logged to the console: this project has no backend or
 * external API to report to (see README).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unexpected render error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = (): void => {
    // The crash may have been caused by corrupted saved data — clear it so
    // reloading doesn't immediately crash again.
    clearSavedMission();
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1 className="error-boundary__title">SOMETHING WENT WRONG</h1>
          <p className="error-boundary__message">
            An unexpected error stopped the simulation. Reloading resets the app to the main
            menu.
          </p>
          <div className="error-boundary__actions">
            <button type="button" onClick={this.handleReload}>
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
