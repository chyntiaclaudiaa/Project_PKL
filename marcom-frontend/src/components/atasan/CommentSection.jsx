import { Send, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function CommentSection({
  comments,
  onSubmit,
}) {
  const [comment, setComment] = useState("");

  const submit = async () => {
    if (!comment.trim()) return;
    await onSubmit(comment);
    setComment("");
  };

  return (
    <div className="mt-2 text-xs">
      
      {/* DAFTAR BALON CHAT / KOMENTAR */}
      <div className="space-y-2.5 mb-3 max-h-60 overflow-y-auto pr-1">
        {comments && comments.length > 0 ? (
          comments.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex gap-3 items-start"
            >
              {/* Avatar Bulat Biru Berinisial */}
              <div className="w-7 h-7 bg-[#006DC3] text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">
                {item.name ? item.name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* Isi Info Pengirim & Komentar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-[11px]">{item.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {item.created_at ? item.created_at.split('T')[0] : "2026-06-03"}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-relaxed text-xs">
                  {item.comment}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 italic text-[11px] py-2">Belum ada komentar untuk request ini.</p>
        )}
      </div>

      {/* INPUT FORM CHAT */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Tulis Balasan..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-400 text-slate-700 bg-white"
        />

        <button
          onClick={submit}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-2 flex items-center justify-center shrink-0 transition-all"
          style={{ backgroundColor: '#E75A24' }} // Memastikan warna oranye tombol kirim sesuai gambar
        >
          <Send size={14} className="transform rotate-0" />
        </button>
      </div>

    </div>
  );
}