import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAppContext } from "../../Context/AppContext";

const MissingPersonsDesk = ({ darkMode }) => {
  const { role, userName } = useAppContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("/missing-persons");
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsFound = async (id) => {
    if (!window.confirm("Are you sure this person has been found and is safe?")) return;
    try {
      const response = await api.put(`/missing-persons/${id}/found`);
      if (response.data.success) {
        alert("✅ Status updated to Found.");
        fetchReports();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const addFieldUpdate = async (id) => {
    const note = window.prompt("Enter field update note:");
    if (!note) return;
    try {
      const response = await api.post(`/missing-persons/${id}/update`, {
        note,
        responderName: userName
      });
      if (response.data.success) {
        alert("✅ Field update added.");
        fetchReports();
      }
    } catch (error) {
      console.error("Error adding field update:", error);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.lastKnownLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cardBg = darkMode ? "#242424" : "#ffffff";
  const borderCol = darkMode ? "#3a3a3a" : "#e2e8f0";
  const textColor = darkMode ? "#ededed" : "#1e293b";
  const subTextColor = darkMode ? "#8a8a8a" : "#64748b";

  if (loading) return <div className="text-center py-10">Loading Missing Persons Desk...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl outline-none border transition"
            style={{ 
              backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
              borderColor: borderCol,
              color: textColor
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5">🔍</span>
        </div>
        
        <div className="flex items-center gap-2">
           <span style={{ color: subTextColor }}>Filter:</span>
           <select 
              className="p-2 rounded-lg outline-none border"
              style={{ backgroundColor: darkMode ? "#1a1a1a" : "#ffffff", borderColor: borderCol, color: textColor }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
           >
              <option value="All">All Cases</option>
              <option value="Missing">Still Missing</option>
              <option value="Found">Found & Safe</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredReports.length > 0 ? filteredReports.map((person) => (
          <div 
            key={person._id} 
            className="rounded-2xl border flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: cardBg, borderColor: borderCol }}
          >
            {/* Image Placeholder or Actual Image */}
            <div className="w-full sm:w-48 h-64 sm:h-auto bg-slate-200 relative">
              {person.imageUrl ? (
                <img src={person.imageUrl} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold">NO PHOTO</div>
              )}
              <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                person.status === "Missing" ? "bg-red-500 text-white" : "bg-green-500 text-white"
              }`}>
                {person.status}
              </div>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold" style={{ color: textColor }}>{person.name}</h3>
                <p className="text-sm font-medium text-blue-500 mb-2">Age: {person.age}</p>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm" style={{ color: textColor }}>
                    <span className="font-bold">Last Seen:</span> {person.lastKnownLocation}
                  </p>
                  <p className="text-sm italic" style={{ color: subTextColor }}>
                    "{person.physicalDescription}"
                  </p>
                </div>

                {person.updates && person.updates.length > 0 && (
                  <div className="mb-4 pt-3 border-t" style={{ borderColor: borderCol }}>
                    <p className="text-xs font-bold uppercase mb-2" style={{ color: subTextColor }}>Field Updates</p>
                    <div className="space-y-2 max-h-24 overflow-y-auto pr-2">
                       {person.updates.map((upd, i) => (
                         <div key={i} className="text-xs p-2 rounded bg-slate-100 dark:bg-slate-800" style={{ color: textColor }}>
                           <span className="font-bold">{upd.responderName}:</span> {upd.note}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: borderCol }}>
                {role === "responder" && person.status === "Missing" && (
                   <button 
                    onClick={() => addFieldUpdate(person._id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition"
                   >
                     Add Update
                   </button>
                )}
                {role === "admin" && person.status === "Missing" && (
                  <button 
                    onClick={() => markAsFound(person._id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition"
                  >
                    Mark as Found
                  </button>
                )}
                <a 
                  href={`tel:${person.contactNumber}`}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-bold rounded-lg flex items-center gap-2"
                  style={{ color: textColor }}
                >
                  📞 Contact Reporter
                </a>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center" style={{ color: subTextColor }}>
             <p className="text-2xl mb-2">🐚</p>
             <p>No missing person reports matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingPersonsDesk;
