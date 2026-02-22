import { useEffect, useState } from "react"

const severityConfig = {
  Low: { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
  Moderate: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  High: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  Critical: { color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
};

const disasterIcons = {
  earthquake: "🌍",
  flood: "🌊",
  landslide: "⛰️",
  fire: "🔥",
  cyclone: "🌀",
  default: "⚠️",
};

const OfficialCard = ({ item }) => {
  const c = item.content;
  const severity = severityConfig[c.severity] || severityConfig.Moderate;
  const icon = disasterIcons[c.disasterType?.toLowerCase()] || disasterIcons.default;

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${severity.border}`,
      borderLeft: `4px solid ${severity.color}`,
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      gap: "14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      position: "relative",
      transition: "box-shadow 0.2s",
    }}>
      {/* Unread dot */}
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
            background: severity.bg, padding: "2px 8px",
            borderRadius: 20, border: `1px solid ${severity.border}`
          }}>{c.severity}</span>
          <span style={{
            fontSize: 11, color: "#94a3b8", textTransform: "capitalize"
          }}>{c.disasterType}</span>
        </div>

        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15, color: "#1e293b" }}>
          {c.message}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: 13, color: "#64748b" }}>
          <span>📍 {c.location}</span>
          <span>📞 {c.contact}</span>
        </div>

        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#cbd5e1" }}>
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const AdminCard = ({ item }) => {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderLeft: "4px solid #6366f1",
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      gap: "14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
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
            textTransform: "uppercase", color: "#6366f1",
            background: "#eef2ff", padding: "2px 8px",
            borderRadius: 20, border: "1px solid #c7d2fe"
          }}>Official Report</span>
        </div>

        <p style={{ margin: "6px 0 0", fontWeight: 600, fontSize: 15, color: "#1e293b" }}>
          {item.content}
        </p>

        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#cbd5e1" }}>
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Card for User — receives alert from admin/official
const UserCard = ({ item }) => {
  const c = item.content;
  const icon = disasterIcons[c.disasterType?.toLowerCase()] || disasterIcons.default;

  return (
    <div style={{
      background: "linear-gradient(135deg, #fff7ed 0%, #fff 60%)",
      border: "1px solid #fed7aa",
      borderLeft: "4px solid #f97316",
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      gap: "14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
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
            textTransform: "uppercase", color: "#f97316",
            background: "#fff7ed", padding: "2px 8px",
            borderRadius: 20, border: "1px solid #fed7aa"
          }}>🚨 Alert</span>
        </div>

        <p style={{ margin: "6px 0 4px", fontWeight: 600, fontSize: 15, color: "#1e293b" }}>
          {c.message}
        </p>

        <div style={{ fontSize: 13, color: "#64748b" }}>
          📍 {c.location}
        </div>

        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#cbd5e1" }}>
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Decide which card to render based on receiverType
const NotificationCard = ({ item }) => {
  const type = item.receiverType?.toLowerCase();
  if (type === "official") return <OfficialCard item={item} />;
  if (type === "admin") return <AdminCard item={item} />;
  if (type === "user") return <UserCard item={item} />;
  return null;
};

const Inbox = ({message}) => {
  const userType = localStorage.getItem("userType");
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMessages = async () => {
    try {
      const res = await fetch(`http://localhost:3000/getMessages/${userType}`);
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

  return (
    <div style={{ maxWidth: 640, padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Inbox
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
          {allMessages.length} notification{allMessages.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 60 }}>Loading...</p>
      ) : allMessages.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 60 }}>No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-12">
          {allMessages.map((item) => (
            <NotificationCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;