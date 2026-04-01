import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MoreVertical, X } from "lucide-react";
import {
  approveEventApi,
  deleteEventSubmissionApi,
  getEventSubmissionsByStatusApi,
  rejectEventApi,
} from "../../api/eventSubmissionApi";

type EventSubmission = {
  _id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  categories: string;
  image: string;
  status: "pending" | "approved" | "rejected";
};

export default function EventSubmissionsList() {
  const [data, setData] = useState<EventSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<EventSubmission | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  // ← Fixed: fetch pending submissions only
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getEventSubmissionsByStatusApi("pending");
      setData(res.data.data || []);
    } catch {
      toast.error("Failed to load event submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".submission-menu")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setActionId(id);
      await deleteEventSubmissionApi(id);
      toast.success("Moved to deleted events");
      await loadData();
      setOpenMenu(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setActionId(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    value: "approved" | "rejected" | "pending",
    reason: string
  ) => {
    try {
      setActionId(id);
      if (value === "approved") {
        await approveEventApi(id);
        toast.success("Event approved");
      } else if (value === "rejected") {
        await rejectEventApi(id, reason);
        toast.success("Event rejected");
      }
      await loadData();
    } catch {
      toast.error("Status update failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading event submissions...
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No pending event submissions
        </div>
      )}

      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item._id}
            className="border rounded-xl p-4 flex gap-4 items-start"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-20 h-20 rounded-lg object-cover border"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-gray-500">📍 {item.location}</p>
              <p className="text-sm text-gray-500">
                📅 {new Date(item.date).toLocaleDateString()}
              </p>
              <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                pending
              </span>
            </div>

            <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
              <select
                value={item.status}
                disabled={actionId === item._id}
                onChange={(e) => {
                  const val = e.target.value as "approved" | "rejected" | "pending";
                  if (val === "rejected") {
                    setRejectModal({ open: true, id: item._id });
                    setRejectReason("");
                  } else {
                    handleStatusChange(item._id, val, "");
                  }
                }}
                className="border rounded-lg px-2 py-1 text-sm"
              >
                {actionId === item._id ? (
                  <option>Updating...</option>
                ) : (
                  <>
                    <option value="pending" disabled={item.status !== "pending"}>
                      Pending
                    </option>
                    <option value="approved" disabled={item.status === "approved"}>
                      Approve
                    </option>
                    <option value="rejected" disabled={item.status === "rejected"}>
                      Reject
                    </option>
                  </>
                )}
              </select>

              <div className="relative submission-menu">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item._id ? null : item._id)
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenu === item._id && (
                  <div className="absolute right-0 top-10 w-32 bg-white border rounded shadow z-20">
                    <button
                      onClick={() => {
                        setViewItem(item);
                        setOpenMenu(null);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={actionId === item._id}
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {actionId === item._id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setViewItem(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
            style={{ animation: "modalIn 0.25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

            {/* Hero Image */}
            <div className="relative h-52 overflow-hidden">
              <img
                src={viewItem.image}
                alt={viewItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <span className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-widest bg-[#83261D] text-white px-3 py-1 rounded-full">
                {viewItem.categories}
              </span>

              <button
                onClick={() => setViewItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4">
                {viewItem.title}
              </h2>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 bg-[#F8E7DC] text-[#83261D] px-3 py-1.5 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(viewItem.date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </div>

                <div className="flex items-center gap-2 bg-[#F8E7DC] text-[#83261D] px-3 py-1.5 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {viewItem.location}
                </div>
              </div>

              <div className="border-t border-gray-100 mb-4" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  About the Event
                </p>
                <p className="text-sm text-gray-600 leading-relaxed max-h-28 overflow-y-auto pr-1">
                  {viewItem.description}
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setViewItem(null)}
                  className="px-5 py-2 text-sm font-medium bg-[#83261D] text-white rounded-lg hover:bg-[#6a1e17] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectModal.open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setRejectModal({ open: false, id: null })}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-between p-5 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">Reject Submission</h2>
                <p className="text-xs text-white/65 mt-0.5">Reason will be emailed to the artist</p>
              </div>
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="p-2 rounded-xl hover:bg-white/20 transition-all">
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-600">
                Please provide a reason for rejection. This will be included in the notification email sent to the artist.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
              />
              <p className="text-xs text-gray-400">
                Leave blank to use default: "Your submission did not meet our criteria"
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="px-5 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (rejectModal.id) {
                    await handleStatusChange(rejectModal.id, "rejected", rejectReason);
                    setRejectModal({ open: false, id: null });
                  }
                }}
                disabled={actionId === rejectModal.id}
                className="px-5 py-2.5 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                {actionId === rejectModal.id ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rejecting...</>
                ) : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}