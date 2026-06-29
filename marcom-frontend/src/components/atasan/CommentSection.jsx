import { Send } from "lucide-react";
import { useState } from "react";

export default function CommentSection({ comments }) {
  return (
    <div className="mt-2 text-xs flex flex-col">
      
      <div className="space-y-2.5 pr-1">
        {comments && comments.length > 0 ? (
          comments.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex gap-3 items-start"
            >
              <div className="w-7 h-7 bg-[#006DC3] text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">
                {item.name ? item.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {item.name}
                  </span>
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
          <p className="text-slate-400 italic text-[11px] py-2">
            Belum ada komentar untuk request ini.
          </p>
        )}
      </div>

    </div>
  );
}