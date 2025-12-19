/**
 * Legacy Root Page
 * 
 * Serves the classic dashboard.html interface.
 * This page is for users who prefer the original UI.
 */

export default function LegacyRoot() {
  return (
    <div className="legacy-container">
      <iframe
        src="/dashboard.html"
        title="Classic Disco MCP Dashboard"
        className="legacy-iframe"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  );
}
