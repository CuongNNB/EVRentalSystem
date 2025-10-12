import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Đã xảy ra lỗi</h2>
            <p className="error-message">
              Có lỗi xảy ra khi tải component. Vui lòng thử lại.
            </p>
            <button 
              className="error-button"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Chi tiết lỗi (Development)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
