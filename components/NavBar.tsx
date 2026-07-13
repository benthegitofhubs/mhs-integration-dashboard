"use client";

export default function NavBar() {
  return (
    <div style={{ borderBottom: "1px solid #e5e3de", backgroundColor: "white" }}
      className="px-8 py-3 flex items-center justify-between">
      <a href="/hundredday" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
        <span className="text-sm font-bold tracking-tight" style={{ color: "#1a1a1a" }}>Radial</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span className="text-sm" style={{ color: "#9ca3af" }}>MHS Integration Tracker</span>
      </a>
      <div className="flex items-center gap-4 text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        <span>21 LOCATIONS</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span>CA / TX / WA</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span>100-DAY PLAN</span>
      </div>
    </div>
  );
}
