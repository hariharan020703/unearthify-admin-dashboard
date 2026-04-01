/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getArtistSubmissionsApi,
  approveSubmissionApi,
  rejectSubmissionApi,
  deleteSubmissionApi,
} from "../../api/artistSubmissionApi";
import { MoreVertical, X } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";

export default function ArtistRejectedList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getArtistSubmissionsApi();
      const rejected = res.data.data.filter(
        (item: any) => item.status === "rejected",
      );
      setData(rejected);
    } catch {
      toast.error("Failed to load rejected submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (
    id: string,
    value: "approved" | "rejected",
    reason: string,
  ) => {
    try {
      setActionId(id);

      if (value === "approved") {
        await approveSubmissionApi(id);
        toast.success("Artist approved");
      } else {
        await rejectSubmissionApi(id, reason);
        toast.success("Submission rejected");
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

      await deleteSubmissionApi(deleteId);

      toast.success("Moved to deleted artists");

      setDeleteId(null);
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
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 sm:py-10 text-gray-500 text-sm sm:text-base">
          Loading rejections...
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="text-gray-500 py-8 sm:py-10 text-center text-sm sm:text-base">
          No rejected submissions
        </div>
      )}

      {/* Rejected Submissions List */}
      {!loading && data.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {data.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">

              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg object-cover border"
              />

              {/* Content */}
              <div className="flex-1 w-full sm:w-auto">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg">{item.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {item.artTypeName} • {item.city}
                </p>

                <span className="inline-block mt-1 sm:mt-2 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-red-100 text-red-700">
                  rejected
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {/* Status Select */}
                <select
                  value={item.status}
                  disabled={actionId === item._id}
                  onChange={(e) => {
                    const val = e.target.value as "approved" | "rejected";
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
                      <option value="approved">Approve</option>
                      <option value="rejected" disabled>
                        Rejected
                      </option>
                    </>
                  )}
                </select>

                {/* Menu Dropdown */}
                <div className="relative submission-menu">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item._id ? null : item._id)
                    }
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} />
                  </button>

                  {openMenu === item._id && (
                    <div className="absolute right-0 top-8 sm:top-10 w-28 sm:w-32 bg-white border rounded-lg shadow z-20 text-xs sm:text-sm">
                      <button
                        onClick={() => {
                          setViewItem(item);
                          setOpenMenu(null);
                        }}
                        className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                        View
                      </button>

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

      {/* View Details Modal - Responsive */}
      {viewItem && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setViewItem(null)}>
          <div
            className="bg-white w-full max-w-[95%] sm:max-w-lg md:max-w-xl h-[85vh] rounded-xl sm:rounded-2xl overflow-hidden relative shadow-xl border border-[#F3E6E4] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1">
              {/* Close Button */}
              <button
                onClick={() => setViewItem(null)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-[#F8E7DC] text-[#83261D] hover:bg-[#83261D] hover:text-white transition flex items-center justify-center text-sm sm:text-base z-10">
                ✕
              </button>

              {/* Image */}
              <img
                src={viewItem.image}
                alt={viewItem.name}
                className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg sm:rounded-xl mb-4 sm:mb-5 md:mb-6 border"
              />

              {/* Title */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#83261D] mb-4 sm:mb-5 md:mb-6">
                Artist Details
              </h2>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm">
                <div>
                  <p className="text-[#83261D] text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                    Artist Name
                  </p>
                  <p className="text-gray-800 font-medium break-words">{viewItem.name}</p>
                </div>

                <div>
                  <p className="text-[#83261D] text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                    Art Form
                  </p>
                  <p className="text-gray-800 font-medium break-words">
                    {viewItem.artTypeName}
                  </p>
                </div>

                <div>
                  <p className="text-[#83261D] text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                    City
                  </p>
                  <p className="text-gray-800 font-medium break-words">{viewItem.city}</p>
                </div>

                <div>
                  <p className="text-[#83261D] text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                    State
                  </p>
                  <p className="text-gray-800 font-medium break-words">{viewItem.state}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-[#83261D] text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                    Country
                  </p>
                  <p className="text-gray-800 font-medium break-words">
                    {viewItem.country}
                  </p>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-4 sm:mt-5 md:mt-6">
                <p className="text-[#83261D] text-[10px] sm:text-xs font-semibold uppercase mb-1 sm:mb-2 tracking-wide">
                  Bio
                </p>
                <div className="bg-[#F8E7DC] p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-800 leading-relaxed border border-[#F1D6D2] max-h-32 sm:max-h-40 overflow-y-auto">
                  {viewItem.bio}
                </div>
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

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!deleteId}
        title="Remove Submission"
        message="This will move to deleted artists. You can recover later."
        confirmText="Remove"
        loading={modalLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleSoftDelete}
      />
    </div>
  );
}