import React from "react";

export default function NotificationPopup({ notifications, onClose, onNotificationClick }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px]">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="font-bold text-sm text-slate-800">Notifikasi Komentar</span>
          <span className="text-[10px] text-blue-600 font-medium">Terbaru</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Tidak ada riwayat notifikasi komentar.
            </div>
          ) : (
            notifications.map((notif) => {
              // Validasi ketat untuk tipe data boolean dari database
              const isRead = notif.is_read === true || String(notif.is_read) === "true";

              return (
                <div
                  key={notif.notification_id}
                  onClick={() => onNotificationClick(notif)}
                  className={`p-4 transition-colors duration-150 cursor-pointer text-left text-xs ${
                    !isRead ? "bg-green-50/70 hover:bg-green-100/50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-xs ${
                      !isRead ? "font-extrabold text-slate-900" : "font-semibold text-slate-500"
                    }`}>
                      {notif.commenter_name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(notif.created_at).toLocaleDateString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className={`mt-1 line-clamp-2 ${
                    !isRead 
                      ? "font-bold text-slate-900 not-italic" 
                      : "font-normal text-slate-400 italic"
                  }`}>
                    "{notif.comment_text}"
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}