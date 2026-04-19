import { useState } from "react";

const PROJECTS = [
  { id: 1, title: "STM32 Flight Controller", category: "Embedded", tags: ["C", "FreeRTOS"], status: "active" },
  { id: 2, title: "PCB Motor Driver v3", category: "PCB", tags: ["KiCad", "Power"], status: "completed" },
  { id: 3, title: "Gripper Arm Control", category: "Robotics", tags: ["C++", "Python"], status: "active" },
  { id: 4, title: "LIDAR Navigation Stack", category: "Sensors", tags: ["Python", "ROS"], status: "completed" },
];

const NAV = [
  { icon: "⌂", label: "Home" },
  { icon: "◈", label: "Projects" },
  { icon: "⚙", label: "Skills" },
  { icon: "✉", label: "Contact" },
];

export function DarkMinimal() {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="relative flex flex-col"
      style={{
        width: 390,
        minHeight: 844,
        background: "#0F172A",
        fontFamily: "'Inter', sans-serif",
        color: "#E2E8F0",
        overflowX: "hidden",
      }}
    >
      {/* Status bar */}
      <div style={{ height: 44, background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>●●●</span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>WiFi</span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>100%</span>
        </div>
      </div>

      {/* Navbar */}
      <div style={{
        height: 56,
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,211,238,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 44,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: "linear-gradient(135deg, #22D3EE, #0891B2)",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>∞</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#F1F5F9", letterSpacing: "-0.3px" }}>Infinity Tech</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{
            fontSize: 11, fontWeight: 600, color: "#22D3EE",
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.2)",
            borderRadius: 6, padding: "4px 10px",
          }}>EN</button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ width: 20, height: 2, background: menuOpen ? "#22D3EE" : "#94A3B8", borderRadius: 1, transition: "all 0.2s" }} />
              <div style={{ width: 14, height: 2, background: menuOpen ? "#22D3EE" : "#94A3B8", borderRadius: 1, transition: "all 0.2s" }} />
              <div style={{ width: 20, height: 2, background: menuOpen ? "#22D3EE" : "#94A3B8", borderRadius: 1, transition: "all 0.2s" }} />
            </div>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ padding: "48px 24px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.15)",
            borderRadius: 20,
            padding: "4px 12px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22D3EE", boxShadow: "0 0 6px #22D3EE" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#22D3EE", letterSpacing: "0.8px", textTransform: "uppercase" }}>
              Hardware Engineer
            </span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12, color: "#F8FAFC" }}>
            Design.<br />
            <span style={{ color: "#22D3EE" }}>Precision.</span><br />
            Performance.
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 28, maxWidth: 280 }}>
            Embedded systems & PCB design specialist building next-gen hardware solutions.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{
              padding: "12px 22px",
              background: "#22D3EE",
              color: "#0F172A",
              border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(34,211,238,0.3)",
            }}>View Projects</button>
            <button style={{
              padding: "12px 22px",
              background: "transparent",
              color: "#22D3EE",
              border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 10,
              fontWeight: 600, fontSize: 13,
              cursor: "pointer",
            }}>Resume</button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px 32px" }}>
        {[
          { value: "12+", label: "Projects" },
          { value: "4L", label: "PCB Layers" },
          { value: "M4", label: "ARM Core" },
        ].map((m, i) => (
          <div key={i} style={{
            flex: 1,
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            paddingRight: 16, paddingLeft: i > 0 ? 16 : 0,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#22D3EE", letterSpacing: "-0.5px" }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 500, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.3px" }}>Recent Projects</span>
        <span style={{ fontSize: 12, color: "#22D3EE", fontWeight: 600 }}>See all →</span>
      </div>

      {/* Project Cards */}
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 100 }}>
        {PROJECTS.map(p => (
          <div key={p.id} style={{
            background: "rgba(30,41,59,0.6)",
            border: "1px solid rgba(51,65,85,0.8)",
            borderRadius: 14,
            padding: "16px",
            display: "flex", gap: 14, alignItems: "flex-start",
            cursor: "pointer",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>⚡</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{p.title}</span>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: p.status === "active" ? "#22D3EE" : "#475569",
                  boxShadow: p.status === "active" ? "0 0 6px #22D3EE" : "none",
                  flexShrink: 0, marginLeft: 8,
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#22D3EE", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>{p.category}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {p.tags.map(t => (
                  <span key={t} style={{
                    fontSize: 10, fontWeight: 600,
                    color: "#94A3B8",
                    background: "rgba(148,163,184,0.08)",
                    border: "1px solid rgba(148,163,184,0.12)",
                    borderRadius: 6, padding: "2px 8px",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        width: 390,
        height: 72,
        background: "rgba(15,23,42,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(34,211,238,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: 8,
        zIndex: 20,
      }}>
        {NAV.map((n, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
              background: "none", border: "none",
              cursor: "pointer",
              color: i === activeTab ? "#22D3EE" : "#475569",
              transition: "color 0.2s",
              minWidth: 52,
            }}
          >
            <span style={{
              fontSize: 20,
              filter: i === activeTab ? "drop-shadow(0 0 4px #22D3EE)" : "none",
            }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.3px" }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
