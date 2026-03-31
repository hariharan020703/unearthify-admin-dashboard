import React from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<Props> = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#83261D] text-white hover:bg-[#6d1f18] disabled:opacity-50"
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;