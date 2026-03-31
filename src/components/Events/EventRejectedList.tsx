/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import { approveEventApi, rejectEventApi, deleteEventSubmissionApi, getEventSubmissionsByStatusApi } from "../../api/eventSubmissionApi";

export default function EventRejectedList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getEventSubmissionsByStatusApi("rejected");

      const filtered = res.data.data.filter(
        (item: any) => !item.isDeleted
      );

      setData(filtered);

      const rejected = res.data.data.filter(
        (item: any) => item.status === "rejected" && !item.isDeleted
      );

      setData(rejected);
    } catch {
      toast.error("Failed to load rejected events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (
    id: string,
    value: "approved" | "rejected"
  ) => {
    try {
      setActionId(id);

      if (value === "approved") {
        await approveEventApi(id);
        toast.success("Event approved");
      } else {
        await rejectEventApi(id);
        toast.success("Event rejected");
      }

      await loadData();
    } catch {
      toast.error("Status update failed");
    } finally {
      setActionId(null);
    }
  };

  const confirmRemove = (id: string) => {
    setDeleteId(id);
  };

  const handleSoftDelete = async () => {
    if (!deleteId) return;

    try {
      setModalLoading(true);
      setActionId(deleteId);

      await deleteEventSubmissionApi(deleteId);

      toast.success("Moved to deleted events");

      setDeleteId(null);
      setOpenMenu(null);
      await loadData();
    } catch {
      toast.error("Delete failed");
    } finally {
      setModalLoading(false);
      setActionId(null);
    }
  };

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

  return (
    <div className="p-4 bg-white rounded-xl shadow">

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading rejected events...
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rejected events
        </div>
      )}

      {/* List */}
      {!loading && data.length > 0 && (
        <div className="space-y-4">
          {data.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl p-4 flex gap-4 items-start"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover border"
              />

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500">
                  📍 {item.location}
                </p>

                <p className="text-sm text-gray-500">
                  📅 {new Date(item.date).toLocaleDateString()}
                </p>

                <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                  rejected
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {/* Status */}
                <select
                  value={item.status}
                  disabled={actionId === item._id}
                  onChange={(e) =>
                    handleStatusChange(
                      item._id,
                      e.target.value as "approved" | "rejected"
                    )
                  }
                  className="border rounded-lg px-2 py-1 text-sm"
                >
                  {actionId === item._id ? (
                    <option>Updating...</option>
                  ) : (
                    <>
                      <option value="approved">Approve</option>
                      <option value="rejected" disabled>
                        Rejected
                      </option>
                    </>
                  )}
                </select>

                {/* Menu */}
                <div className="relative submission-menu">
                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu === item._id ? null : item._id
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === item._id && (
                    <div className="absolute right-0 top-10 w-32 bg-white border rounded shadow z-20">

                      {/* View */}
                      <button
                        onClick={() => {
                          setViewItem(item);
                          setOpenMenu(null);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        View
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => confirmRemove(item._id)}
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
      )}

      {/* VIEW MODAL */}
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
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Category badge — bottom-left of image */}
              <span className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-widest bg-[#83261D] text-white px-3 py-1 rounded-full">
                {viewItem.categories}
              </span>

              {/* Close button */}
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

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4">
                {viewItem.title}
              </h2>

              {/* Date & Location row */}
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

              {/* Divider */}
              <div className="border-t border-gray-100 mb-4" />

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  About the Event
                </p>
                <p className="text-sm text-gray-600 leading-relaxed max-h-28 overflow-y-auto pr-1">
                  {viewItem.description}
                </p>
              </div>

              {/* Footer */}
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

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!deleteId}
        title="Remove Event"
        message="This will move to deleted events. You can recover later."
        confirmText="Remove"
        loading={modalLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleSoftDelete}
      />
    </div>
  );
}