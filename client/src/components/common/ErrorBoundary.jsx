import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can send error telemetry here if desired
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component tree:', error, info);
  }

  handleReload = () => {
    // Try a soft reset: clear app token and reload
    try {
      localStorage.removeItem('supabase_access_token');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-20 max-w-2xl rounded-card border border-red-light bg-white p-6 text-center shadow-card">
          <h2 className="mb-2 text-lg font-semibold text-charcoal">Something went wrong</h2>
          <p className="mb-4 text-sm text-gray-mid">An unexpected error occurred while rendering the application.</p>
          <details className="mx-auto mb-4 max-w-full whitespace-pre-wrap text-left text-xs text-gray-mid">
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.info?.componentStack}
          </details>
          <div className="flex items-center justify-center gap-3">
            <button onClick={this.handleReload} className="rounded-btn bg-teal-deep px-4 py-2 text-sm font-medium text-white">Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
