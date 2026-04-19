import { useState } from "react";

const PROJECTS = [
  { id: 1, title: "STM32 Flight Controller", category: "Embedded", tags: ["C", "FreeRTOS"], icon: "🚁" },
  { id: 2, title: "PCB Motor Driver v3", category: "PCB Design", tags: ["KiCad", "Power"], icon: "⚡" },
  { id: 3, title: "Gripper Arm Control", category: "Robotics", tags: ["C++", "Python"], icon: "🦾" },
  { id: 4, title: "LIDAR Navigation Stack", category: "Sensors", tags: ["Python", "ROS"], icon: "📡" },
];

const FILTERS = ["All", "Embedded", "PCB Design", "Robotics", "Sensors"];

export function BoldTech() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeNav, setActiveNav] = useState("home");

  const filtered = activeFilter === "All"
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeFilter);

  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        background: "#060B14",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#E2E8F0",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Animated background blobs */}
      <div style={{
        position: "fixed", top: -80, left: -80, width: 280, height: 280,
        background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: 100, right: -60, width: 220, height: 220,
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "relative", zIndex: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 12 }}>📶</span>
          <span style={{ fontSize: 12 }}>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: "0 20px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 44, zIndex: 10,
        background: "rgba(6,11,20,0.9)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
            boxShadow: "0 0 16px rgba(34,211,238,0.4)",
          }}>∞</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.3px" }}>Fares Salah</div>
            <div style={{ fontSize: 10, color: "#22D3EE", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>HW Engineer</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{
            background: "rgba(34,211,238,0.1)",
            border: "1px solid rgba(34,211,238,0.25)",
            borderRadius: 8, padding: "5px 10px",
            fontSize: 11, fontWeight: 700, color: "#22D3EE", cursor: "pointer",
          }}>EN</button>
          <button style={{
            width: 36, height: 36,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>☰</button>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* Hero — Bold headline */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.06), rgba(139,92,246,0.06))",
            border: "1px solid rgba(34,211,238,0.1)",
            borderRadius: 24,
            padding: "28px 24px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(34,211,238,0.15), transparent)",
              borderRadius: "50%",
            }} />
            <div style={{
              display: "inline-block",
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
              borderRadius: 99, padding: "3px 12px", marginBottom: 16,
            }}>
              <span style={{ fontSize: 10, color: "#22D3EE", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" }}>
                ✦ Available for Work
              </span>
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-1.5px", color: "#F8FAFC", marginBottom: 8 }}>
              Build the<br />
              <span style={{
                background: "linear-gradient(90deg, #22D3EE, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Future.</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 20, maxWidth: 240 }}>
              Embedded systems & PCB design from concept to silicon.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{
                flex: 1,
                padding: "13px 16px",
                background: "linear-gradient(135deg, #22D3EE, #0891B2)",
                color: "#060B14", border: "none", borderRadius: 12,
                fontWeight: 800, fontSize: 13, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(34,211,238,0.4)",
              }}>→ Projects</button>
              <button style={{
                padding: "13px 16px",
                background: "rgba(139,92,246,0.12)",
                color: "#A78BFA", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12,
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>CV</button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ padding: "20px", display: "flex", gap: 12 }}>
          {[
            { value: "12+", label: "Projects", color: "#22D3EE" },
            { value: "98%", label: "Uptime", color: "#8B5CF6" },
            { value: "5★", label: "Rating", color: "#F59E0B" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "14px 12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.4px" }}>Projects</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#22D3EE" }}>All →</span>
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "7px 14px",
                  background: activeFilter === f ? "linear-gradient(135deg, #22D3EE, #0891B2)" : "rgba(255,255,255,0.04)",
                  color: activeFilter === f ? "#060B14" : "#64748B",
                  border: activeFilter === f ? "none" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 99, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: activeFilter === f ? "0 2px 12px rgba(34,211,238,0.3)" : "none",
                  flexShrink: 0,
                }}
              >{f}</button>
            ))}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 100 }}>
            {filtered.map(p => (
              <div key={p.id} style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "18px",
                display: "flex", gap: 14, alignItems: "center",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(139,92,246,0.12))",
                  border: "1px solid rgba(34,211,238,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{p.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#22D3EE", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    {p.category}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {p.tags.map(t => (
                      <span key={t} style={{
                        fontSize: 10, fontWeight: 600, color: "#64748B",
                        background: "rgba(100,116,139,0.08)",
                        border: "1px solid rgba(100,116,139,0.15)",
                        borderRadius: 6, padding: "2px 8px",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: "#22D3EE", fontSize: 16, flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating pill nav */}
      <div style={{
        position: "fixed",
        bottom: 24, left: "50%",
        transform: "translateX(-50%)",
        width: 280,
        height: 60,
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(34,211,238,0.12)",
        borderRadius: 99,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "0 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.05)",
        zIndex: 20,
      }}>
        {[
          { icon: "⌂", id: "home" },
          { icon: "◈", id: "projects" },
          { icon: "⚙", id: "skills" },
          { icon: "✉", id: "contact" },
        ].map(n => (
          <button key={n.id} onClick={() => setActiveNav(n.id)} style={{
            width: 44, height: 44, borderRadius: 99,
            background: activeNav === n.id
              ? "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.15))"
              : "transparent",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
            filter: activeNav === n.id ? "drop-shadow(0 0 6px #22D3EE)" : "none",
            color: activeNav === n.id ? "#22D3EE" : "#475569",
            transition: "all 0.2s",
          }}>{n.icon}</button>
        ))}
      </div>
    </div>
  );
}
