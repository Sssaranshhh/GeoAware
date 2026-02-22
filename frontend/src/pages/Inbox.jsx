import { useEffect, useState } from "react"

const severityConfig = {
  Low: { color: "#22c55e", darkBg: "#052e16", lightBg: "#f0fdf4", border: "#16a34a" },
  Moderate: { color: "#f59e0b", darkBg: "#2d1a00", lightBg: "#fffbeb", border: "#d97706" },
  High: { color: "#ef4444", darkBg: "#2d0a0a", lightBg: "#fef2f2", border: "#dc2626" },
  Critical: { color: "#a78bfa", darkBg: "#1e0a3c", lightBg: "#faf5ff", border: "#7c3aed" },
};

const disasterIcons = {
  earthquake: "🌍",
  flood: "🌊",
  landslide: "⛰️",
  fire: "🔥",
  cyclone: "🌀",
  default: "⚠️",
};

const OfficialCard = ({ item, darkMode }) => {
  const c = item.content;
  const severity = severityConfig[c.severity] || severityConfig.Moderate;
  const icon = disasterIcons[c.disasterType?.toLowerCase()] || disasterIcons.default;
  const bg = darkMode ? severity.darkBg : severity.lightBg;
  const cardBg = darkMode ? "#242424" : "#ffffff";
  const textMain = darkMode ? "#ededed" : "#1e293b";
  const textSub = darkMode ? "#94a3b8" : "#64748b";
  const textTime = darkMode ? "#6b7280" : "#94a3b8";

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${severity.border}`,
      borderLeft: `4px solid ${severity.color}`,
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      gap: "14px",
      boxShadow: darkMode ? "0 1px 6px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.06)",
      position: "relative",
      transition: "box-shadow 0.2s",
    }}>
      {!item.read && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          width: 8, height: 8, borderRadius: "50%",
          background: severity.color, display: "block"
        }} />
      )}

      <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: severity.color,
            background: bg, padding: "2px 8px",
            borderRadius: 20, border: `1px solid ${severity.border}`
          }}>{c.severity}</span>
          <span style={{ fontSize: 11, color: textSub, textTransform: "capitalize" }}>
            {c.disasterType}
          </span>
        </div>

        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15, color: textMain }}>
          {c.message}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: 13, color: textSub }}>
          <span>📍 {c.location}</span>
          <span>📞 {c.contact}</span>
        </div>

        <p style={{ margin: "8px 0 0", fontSize: 11, color: textTime }}>
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const AdminCard = ({ item, darkMode }) => {
  const cardBg = darkMode ? "#242424" : "#ffffff";
  const textMain = darkMode ? "#ededed" : "#1e293b";
  const textTime = darkMode ? "#6b7280" : "#94a3b8";
  const badgeBg = darkMode ? "#1e1e3a" : "#eef2ff";
  const badgeBorder = darkMode ? "#4338ca" : "#c7d2fe";

  return (
    <div style={{
      background: cardBg,
      border: darkMode ? "1px solid #3a3a3a" : "1px solid #e2e8f0",
      borderLeft: "4px solid #6366f1",
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      gap: "14px",
      boxShadow: darkMode ? "0 1px 6px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.06)",
      position: "relative",
    }}>
      {!item.read && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          width: 8, height: 8, borderRadius: "50%",
          background: "#6366f1", display: "block"
        }} />
      )}

      <div style={{ fontSize: 32, lineHeight: 1 }}>📋</div>

      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#818cf8",
            background: badgeBg, padding: "2px 8px",
            borderRadius: 20, border: `1px solid ${badgeBorder}`
          }}>Official Report</span>
        </div>

        <p style={{ margin: "6px 0 0", fontWeight: 600, fontSize: 15, color: textMain }}>
          {item.content}
        </p>

        <p style={{ margin: "8px 0 0", fontSize: 11, color: textTime }}>
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const UserCard = ({ item, darkMode }) => {
  const c = item.content;
  const icon = disasterIcons[c.disasterType?.toLowerCase()] || disasterIcons.default;
  const cardBg = darkMode
    ? "linear-gradient(135deg, #2d1a00 0%, #242424 60%)"
    : "linear-gradient(135deg, #fff7ed 0%, #fff 60%)";
  const textMain = darkMode ? "#ededed" : "#1e293b";
  const textSub = darkMode ? "#94a3b8" : "#64748b";
  const textTime = darkMode ? "#6b7280" : "#94a3b8";

  return (
    <div style={{
      background: cardBg,
      border: darkMode ? "1px solid #92400e" : "1px solid #fed7aa",
      borderLeft: "4px solid #f97316",
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      gap: "14px",
      boxShadow: darkMode ? "0 1px 6px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.06)",
      position: "relative",
    }}>
      {!item.read && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          width: 8, height: 8, borderRadius: "50%",
          background: "#f97316", display: "block"
        }} />
      )}

      <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>

      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#fb923c",
            background: darkMode ? "#2d1a00" : "#fff7ed", padding: "2px 8px",
            borderRadius: 20, border: darkMode ? "1px solid #92400e" : "1px solid #fed7aa"
          }}>🚨 Alert</span>
        </div>

        <p style={{ margin: "6px 0 4px", fontWeight: 600, fontSize: 15, color: textMain }}>
          {c.message}
        </p>

        <div style={{ fontSize: 13, color: textSub }}>
          📍 {c.location}
        </div>

        <p style={{ margin: "8px 0 0", fontSize: 11, color: textTime }}>
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const NotificationCard = ({ item, darkMode }) => {
  const type = item.receiverType?.toLowerCase();
  if (type === "official") return <OfficialCard item={item} darkMode={darkMode} />;
  if (type === "admin") return <AdminCard item={item} darkMode={darkMode} />;
  if (type === "user") return <UserCard item={item} darkMode={darkMode} />;
  return null;
};

const Inbox = ({ message, darkMode }) => {
  const userType = localStorage.getItem("userType");
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMessages = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/getMessages/${userType}`);
      const response = await res.json();
      if (response.success) setAllMessages(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMessages();
  }, [message]);

  const textPrimary = darkMode ? "#ededed" : "#0f172a";
  const textMuted = darkMode ? "#8a8a8a" : "#94a3b8";

  return (
    <div style={{ maxWidth: 640, padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0 }}>
          Inbox
        </h1>
        <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>
          {allMessages.length} notification{allMessages.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p style={{ color: textMuted, textAlign: "center", marginTop: 60 }}>Loading...</p>
      ) : allMessages.length === 0 ? (
        <p style={{ color: textMuted, textAlign: "center", marginTop: 60 }}>No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {allMessages.map((item) => (
            <NotificationCard key={item._id} item={item} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;