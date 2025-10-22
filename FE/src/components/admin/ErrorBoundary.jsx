import React from "react";
export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={hasError:false, error:null}; }
  static getDerivedStateFromError(e){ return {hasError:true, error:e}; }
  componentDidCatch(e, info){ console.error("ErrorBoundary:", e, info); }
  render(){
    if (this.state.hasError) return (
      <div style={{padding:16}}>
        <h3>Dashboard gặp lỗi khi hiển thị</h3>
        <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error)}</pre>
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}
