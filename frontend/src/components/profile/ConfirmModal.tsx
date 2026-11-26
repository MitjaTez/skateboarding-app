"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-[24px] text-main-title-color">{title}</h2>
        <p className="mb-5 text-[16px] text-secondary-title-color">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl bg-brand py-2 font-semibold text-black hover:opacity-90"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 cursor-pointer rounded-xl bg-red-600 py-2 font-semibold text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
