import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  groupTitle,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white text-gray-900 border border-gray-200 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              Delete this study group?
            </h3>
            {groupTitle && (
              <p className="text-xs font-semibold text-[#0056D6] mt-0.5 truncate max-w-[260px]">
                {groupTitle}
              </p>
            )}
          </div>
        </div>

        {/* Warning Text */}
        <p className="text-xs text-gray-600 leading-relaxed mb-6 pl-0.5">
          This action cannot be undone. All group information and scheduled sessions associated with this group may be removed.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Group</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
