/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import {
  recoverEventApi,
  permanentDeleteEventApi,
  getDeletedEventsApi,
} from "../../api/eventApi";

import {
  getDeletedEventSubmissionsApi,
  recoverEventSubmissionApi,
  permanentDeleteEventSubmissionApi,
} from "../../api/eventSubmissionApi";

export default function DeletedEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [recoverTarget, setRecoverTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
  try {
    setLoading(true);

    const [eventRes, submissionRes] = await Promise.all([
      getDeletedEventsApi(),
      getDeletedEventSubmissionsApi(),
    ]);

    const deletedEvents = eventRes.data.data || [];
    const deletedSubmissions = submissionRes.data.data || [];

    // ✅ Key fix: if an event has a linked submission in deleted,
    // show ONLY the submission (not both)
    const submissionEventIds = new Set(
      deletedSubmissions
        .filter((s: any) => s.approvedEventId)
        .map((s: any) => s.approvedEventId?.toString())
    );

    const standaloneEvents = deletedEvents.filter(
      (e: any) => !submissionEventIds.has(e._id?.toString())
    );

    setEvents(standaloneEvents);
    setSubmissions(deletedSubmissions);
  } catch (err) {
    console.error("Load deleted events error:", err);
    toast.error("Failed to load deleted events");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  // RECOVER
  const confirmRecover = async () => {
  if (!recoverTarget) return;
  try {
    setModalLoading(true);

    // ✅ Add log to confirm which API is being called
    console.log("Recovering:", recoverTarget.type, recoverTarget.id);

    if (recoverTarget.type === "event") {
      await recoverEventApi(recoverTarget.id);       // → /events/:id/recover
    } else {
      await recoverEventSubmissionApi(recoverTarget.id); // → /event-submissions/:id/recover
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

  const confirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    try {
      setModalLoading(true);
      if (deleteTarget.type === "event") {
        await permanentDeleteEventApi(deleteTarget.id);
      } else {
        await permanentDeleteEventSubmissionApi(deleteTarget.id);
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
    <div className="p-4 bg-white rounded-xl shadow">

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading deleted events...
        </div>
      )}

      {!loading && events.length === 0 && submissions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No deleted events
        </div>
      )}

      {!loading && (events.length > 0 || submissions.length > 0) && (
        <div className="space-y-4">
          {/* Merge both and render together */}
          {[
            ...events.map((e: any) => ({ ...e, _type: "event" })),
            ...submissions.map((s: any) => ({ ...s, _type: "submission" })),
          ].map((item) => (
            <div
              key={item._id}
              className="border rounded-xl p-4 flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover border"
                />
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.categories} • {item.location}
                  </p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full mt-1 inline-block">
                    {item._type === "event" ? "Event" : "Submission"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setRecoverTarget({ id: item._id, type: item._type })}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Recover
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: item._id, type: item._type })}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recover Modal */}
      <ConfirmModal
        open={!!recoverTarget}
        title="Recover Event"
        message="Move back to pending section."
        confirmText="Recover"
        loading={modalLoading}
        onCancel={() => setRecoverTarget(null)}
        onConfirm={confirmRecover}
      />

      {/* Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Permanent Delete"
        message="This action cannot be undone."
        confirmText="Delete"
        loading={modalLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmPermanentDelete}
      />
    </div>
  );
}