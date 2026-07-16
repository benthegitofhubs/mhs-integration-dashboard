"use client";

export default function NavBar({
  search,
  onSearchChange,
  showSearch,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  showSearch?: boolean;
} = {}) {
  return (
    <div style={{ borderBottom: "1px solid #e5e3de", backgroundColor: "white", position: "sticky", top: 0, zIndex: 50 }}
      className="px-8 py-3 flex items-center justify-between gap-6">
      <a href="/hundredday" className="flex items-center gap-3 shrink-0" style={{ textDecoration: "none" }}>
        <span className="text-sm font-bold tracking-tight" style={{ color: "#1a1a1a" }}>Radial</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span className="text-sm" style={{ color: "#9ca3af" }}>MHS Integration Tracker</span>
      </a>

      {showSearch && onSearchChange && (
        <div className="relative flex-1" style={{ maxWidth: "440px" }}>
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by keyword…"
            className="w-full text-sm rounded-lg focus:outline-none"
            style={{ border: "1px solid #e5e3de", backgroundColor: "white", color: "#1a1a1a", padding: "7px 30px 7px 12px" }}
          />
          {search && (
            <button onClick={() => onSearchChange("")} aria-label="Clear search"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "14px", lineHeight: 1 }}>
              ✕
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs shrink-0" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        <span>20 LOCATIONS</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span>CA / TX / WA</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span>100-DAY PLAN</span>
      </div>
    </div>
  );
}
