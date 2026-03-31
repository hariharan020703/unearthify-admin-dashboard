/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import {
  getDeletedArtistsApi,
  recoverArtistApi,
  permanentDeleteArtistApi,
} from "../../api/artistApi";
import {
  getDeletedSubmissionsApi,
  recoverSubmissionApi,
  permanentDeleteSubmissionApi,
} from "../../api/artistSubmissionApi";

export default function DeletedArtists() {
  const [artists, setArtists] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [recoverTarget, setRecoverTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const artistRes = await getDeletedArtistsApi();
      const submissionRes = await getDeletedSubmissionsApi();

      setArtists(artistRes.data.data || []);
      setSubmissions(submissionRes.data.data || []);
    } catch {
      toast.error("Failed to load deleted items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recover
  const confirmRecover = async () => {
    if (!recoverTarget) return;

    try {
      setModalLoading(true);

      if (recoverTarget.type === "artist") {
        await recoverArtistApi(recoverTarget.id);
      } else {
        await recoverSubmissionApi(recoverTarget.id);
      }

      toast.success("Recovered successfully");

      setRecoverTarget(null);
      loadData();
    } catch {
      toast.error("Recover failed");
    } finally {
      setModalLoading(false);
    }
  };

  // Permanent Delete
  const confirmPermanentDelete = async () => {
    if (!deleteTarget) return;

    try {
      setModalLoading(true);

      if (deleteTarget.type === "artist") {
        await permanentDeleteArtistApi(deleteTarget.id);
      } else {
        await permanentDeleteSubmissionApi(deleteTarget.id);
      }

      toast.success("Deleted permanently");

      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error("Delete failed");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 sm:py-10 text-gray-500 text-sm sm:text-base">
          Loading deleted items...
        </div>
      )}

      {/* Empty State */}
      {!loading && artists.length === 0 && submissions.length === 0 && (
        <div className="text-center py-8 sm:py-10 text-gray-500 text-sm sm:text-base">
          No deleted items
        </div>
      )}

      {/* Deleted Items List */}
      {!loading && (artists.length > 0 || submissions.length > 0) && (
        <div className="space-y-3 sm:space-y-4">
          {[
            ...artists.map((a) => ({ ...a, type: "artist" })),
            ...submissions.map((s) => ({ ...s, type: "submission" })),
          ].map((item) => (
            <div
              key={item._id}
              className="border rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              
              {/* Left Section - Image and Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border"
                />
                
                {/* Info */}
                <div>
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {item.artTypeName} • {item.state}
                  </p>
                  <span className="inline-block mt-1 text-[10px] sm:text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    {item.type === "artist" ? "Artist" : "Submission"}
                  </span>
                </div>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex flex-row gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                {/* Recover Button */}
                <button
                  onClick={() =>
                    setRecoverTarget({ id: item._id, type: item.type })
                  }
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm hover:bg-green-700 transition-colors whitespace-nowrap">
                  Recover
                </button>

                {/* Delete Permanently Button */}
                <button
                  onClick={() =>
                    setDeleteTarget({ id: item._id, type: item.type })
                  }
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm hover:bg-red-700 transition-colors whitespace-nowrap">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recover Confirmation Modal */}
      <ConfirmModal
        open={!!recoverTarget}
        title="Recover Item"
        message="This will move back to pending section."
        confirmText="Recover"
        loading={modalLoading}
        onCancel={() => setRecoverTarget(null)}
        onConfirm={confirmRecover}
      />

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Permanent Delete"
        message="Delete permanently from database. This action cannot be undone."
        confirmText="Delete"
        loading={modalLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmPermanentDelete}
      />
    </div>
  );
}