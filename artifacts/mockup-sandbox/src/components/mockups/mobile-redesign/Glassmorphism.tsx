import { useState } from "react";

const PROJECTS = [
  { id: 1, title: "STM32 Flight Controller", cat: "Embedded", tags: ["C", "FreeRTOS"], glyph: "✈" },
  { id: 2, title: "PCB Motor Driver v3", cat: "PCB Design", tags: ["KiCad", "Power"], glyph: "⚡" },
  { id: 3, title: "Gripper Arm Control", cat: "Robotics", tags: ["C++", "Python"], glyph: "⚙" },
  { id: 4, title: "LIDAR Navigation", cat: "Sensors", tags: ["Python", "ROS"], glyph: "◎" },
];

const NAVICONS = ["⌂", "◈", "⚙", "✉"];

export function Glassmorphism() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div style={{
      width: 390,
      minHeight: 844,
      background: "#08091A",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#E2E8F0",
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* Background gradient blobs */}
      <div style={{
        position: "fixed", top: -120, left: -80, width: 350, height: 350,
        background: "radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 65%)",
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: 200, right: -100, width: 280, height: 280,
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: 200, left: -60, width: 240, height: 240,
        background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)",
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
      }} />

      {/* Status bar */}
      <div style={{
        height: 44, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        position: "relative", zIndex: 5,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>9:41</span>
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ fontSize: 12 }}>📶 🔋</span>
        </div>
      </div>

      {/* Glass Navbar */}
      <div style={{
        margin: "0 16px",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "12px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 44, zIndex: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #22D3EE, #6366F1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: "#fff",
            boxShadow: "0 0 12px rgba(34,211,238,0.35)",
          }}>∞</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: "#F8FAFC" }}>Infinity Tech</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.18)",
            borderRadius: 8, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, color: "#22D3EE",
          }}>EN</div>
          <div style={{
            width: 32, height: 32,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>☰</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "28px 20px 0", position: "relative", zIndex: 2 }}>

        {/* Hero glass card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 28,
          padding: "28px 24px",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          {/* Inner glow */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160,
            background: "radial-gradient(circle, rgba(34,211,238,0.18), transparent)",
            borderRadius: "50%",
          }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.16)",
            borderRadius: 99, padding: "4px 12px", marginBottom: 18,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22D3EE", display: "inline-block", boxShadow: "0 0 6px #22D3EE" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#22D3EE", letterSpacing: "1px", textTransform: "uppercase" }}>Open to Projects</span>
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-1.2px", marginBottom: 10,
            background: "linear-gradient(160deg, #F8FAFC 30%, #94A3B8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Design.<br />Precision.<br />
            <span style={{
              background: "linear-gradient(90deg, #22D3EE, #6366F1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Performance.</span>
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, marginBottom: 22, maxWidth: 260 }}>
            Embedded systems & PCB design specialist crafting next-gen hardware solutions.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              flex: 1, padding: "13px",
              background: "linear-gradient(135deg, #22D3EE, #0EA5E9)",
              border: "none", borderRadius: 14,
              fontWeight: 800, fontSize: 13, color: "#08091A",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(34,211,238,0.35)",
            }}>View Projects</button>
            <button style={{
              padding: "13px 16px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 14, color: "#A5B4FC",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>Resume</button>
          </div>
        </div>

        {/* Metric pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[
            { v: "12+", l: "Projects", c: "#22D3EE" },
            { v: "4L", l: "PCB Layers", c: "#6366F1" },
            { v: "M4", l: "ARM Core", c: "#EC4899" },
          ].map((m, i) => (
            <div key={i} style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "14px 10px",
              textAlign: "center",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: m.c, letterSpacing: "-0.5px" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.l}</div>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px", color: "#F1F5F9" }}>Projects</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#22D3EE" }}>View all →</span>
        </div>

        {/* Glass project cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 110 }}>
          {PROJECTS.map((p, idx) => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: "16px 18px",
              display: "flex", gap: 14, alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Card inner glow */}
              <div style={{
                position: "absolute", top: -20, right: -20, width: 80, height: 80,
                background: idx % 2 === 0
                  ? "radial-gradient(circle, rgba(34,211,238,0.08), transparent)"
                  : "radial-gradient(circle, rgba(99,102,241,0.08), transparent)",
                borderRadius: "50%",
              }} />
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}>{p.glyph}</div>
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "#F1F5F9",
                  marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{p.title}</div>
                <div style={{ fontSize: 11, color: "#22D3EE", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                  {p.cat}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{
                      fontSize: 10, fontWeight: 600, color: "#475569",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 6, padding: "2px 8px",
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <span style={{ color: "#22D3EE", fontSize: 16, flexShrink: 0, opacity: 0.7 }}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glassmorphism bottom nav */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        width: 390,
        padding: "12px 32px 20px",
        background: "rgba(8,9,26,0.85)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around",
        zIndex: 20,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
      }}>
        {NAVICONS.map((icon, i) => (
          <button key={i} onClick={() => setActiveNav(i)} style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer",
            padding: "6px 12px",
            borderRadius: 16,
          }}>
            <span style={{
              fontSize: 22,
              color: i === activeNav ? "#22D3EE" : "#334155",
              filter: i === activeNav ? "drop-shadow(0 0 8px rgba(34,211,238,0.8))" : "none",
              transition: "all 0.2s",
            }}>{icon}</span>
            {i === activeNav && (
              <div style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "#22D3EE",
                boxShadow: "0 0 6px #22D3EE",
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
