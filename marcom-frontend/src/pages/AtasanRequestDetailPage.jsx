import { useEffect, useState } from "react";
import CommentSection from "../components/atasan/CommentSection";
import { X, MessageCircle } from "lucide-react"; 

import {
  getRequestById,
} from "../services/atasan_requestService";

import {
  getComments,
  addComment,
} from "../services/atasan_commentService";

export default function AtasanRequestDetailPage({ requestId, onClose }) {
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (requestId) {
      loadData();
    }
  }, [requestId]);

  const loadData = async () => {
    try {
      const [requestRes, commentRes] = await Promise.all([
        getRequestById(requestId),
        getComments(requestId),
      ]);
      setRequest(requestRes.data);
      setComments(commentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async (commentText) => {
    if (!commentText.trim()) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await addComment({
        request_id: requestId,
        user_id: user.id,
        comment: commentText,
      });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!request) return null; 

  return (
    /* DIUBAH: Menambahkan onClick={onClose} pada div backdrop luar ini.
      Ketika pengguna mengklik area buram/gelap di luar card, fungsi onClose dijalankan.
    */
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex justify-center items-center z-[9999] p-4 overflow-hidden animate-fade-in cursor-pointer"
    >
      
      {/* CARD CONTAINER POPUP 
        DIUBAH: Menambahkan onClick={(e) => e.stopPropagation()} dan cursor-default.
        Ini krusial agar ketika area card putih diklik, event kliknya tidak "bocor/tembus" ke elemen backdrop luar.
      */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[90vh] bg-white rounded-none shadow-2xl flex flex-col overflow-hidden text-xs cursor-default"
      >
        
        {/* HEADER GRADASI HORIZONTAL */}
        <div 
          className="px-6 py-5 md:px-8 md:py-6 relative text-white flex flex-col gap-2 shrink-0 rounded-none"
          style={{
            background: 'linear-gradient(90deg, #0854AB 0%, #1868CA 100%)'
          }}
        >
          {/* ID Kode & Tombol Batal */}
          <div className="flex justify-between items-center text-[11px] font-semibold tracking-wide text-white/90">
            <span>{request.request_code || "REQ-001"}</span>
            <button 
              onClick={onClose}
              className="flex items-center gap-1 hover:text-white/70 transition-all focus:outline-none"
            >
              <X size={14} />
              <span>Batal</span>
            </button>
          </div>

          {/* Judul Utama */}
          <h2 className="text-lg md:text-xl font-bold leading-tight pr-10">
            {request.title}
          </h2>

          {/* Status Badge */}
          <div className="flex mt-1">
            <span className="px-3 py-0.5 text-[11px] font-semibold rounded-full bg-[#E0F2FE] text-[#006DC3]">
              {request.status || "Diproses"}
            </span>
          </div>
        </div>

        {/* AREA PUTIH */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-7 bg-white space-y-5">
          
          {/* GRID DATA INFORMASI */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">Nomor Surat</p>
              <p className="font-semibold text-slate-800">{request.letter_number}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">Tanggal Masuk</p>
              <p className="font-semibold text-slate-800">
                {new Date(request.entry_date).toLocaleDateString('en-CA')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">Deadline</p>
              <p className="font-semibold text-slate-800">
                {new Date(request.deadline).toLocaleDateString('en-CA')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">Divisi Pengaju</p>
              <p className="font-semibold text-slate-800">{request.requester_division || "Marketing Communication"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">Platform</p>
              <p className="font-semibold text-slate-800">{request.platform_target || "Instagram"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">PIC</p>
              <p className="font-semibold text-slate-800">{request.pic_name || "Chairun Nisaq"}</p>
            </div>
          </div>

          {/* BOX DESKRIPSI KEBUTUHAN */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mb-1.5 tracking-wide">
              Deskripsi Kebutuhan
            </p>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {request.description || "Perlu Konten untuk campaign lingkungan hidup"}
            </p>
          </div>

          {/* SEPARATOR LINE */}
          <div className="border-t border-slate-100 my-1"></div>

          {/* KOMENTAR */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-normal text-sm">
              <MessageCircle size={16} className="text-orange-500" />
              <span>Komentar</span>
            </div>
            
            <CommentSection
              comments={comments}
              onSubmit={handleSubmitComment}
            />
          </div>

        </div>

      </div>
    </div>
  );
}