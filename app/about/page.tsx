export default function AboutPage() {
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0d1117",
      color: "#e6edf3",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>About</h1>
      <p style={{ color: "#8b949e", marginTop: "12px" }}>
        Solana Trading Bot — Alpha AI
      </p>
    </main>
  );
}
