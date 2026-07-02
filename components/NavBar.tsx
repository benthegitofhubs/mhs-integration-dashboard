"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const path = usePathname();

  const tabs = [
    { href: "/",            label: "6-Month Plan" },
    { href: "/hundredday",  label: "100-Day Plan" },
  ];

  return (
    <div style={{ borderBottom: "1px solid #e5e3de", backgroundColor: "white" }}
      className="px-8 py-0 flex items-center justify-between">
      <div className="flex items-center gap-3 py-3">
        <span className="text-sm font-bold tracking-tight">Radial</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span className="text-sm" style={{ color: "#9ca3af" }}>MHS Integration</span>
      </div>

      <div className="flex items-center gap-0">
        {tabs.map((tab) => {
          const active = path === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="text-xs px-4 py-3 transition-colors"
              style={{
                color: active ? "#1a5c3a" : "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
                fontWeight: active ? 600 : 400,
                borderBottom: active ? "2px solid #1a5c3a" : "2px solid transparent",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs py-3" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        <span>21 LOCATIONS</span>
        <span style={{ color: "#c8c5be" }}>·</span>
        <span>CA / TX / WA</span>
      </div>
    </div>
  );
}
