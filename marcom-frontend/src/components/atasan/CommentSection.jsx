import { Send } from "lucide-react";
import { useState } from "react";

export default function CommentSection({
  comments,
  onSubmit,
}) {
  const [comment, setComment] =
    useState("");

  const submit = async () => {
    if (!comment.trim()) return;

    await onSubmit(comment);

    setComment("");
  };

  return (
    <div className="mt-6">

      <h3 className="font-semibold mb-4">
        Komentar & Arahan
      </h3>

      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">

        {comments.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 rounded-lg p-3"
          >

            <div className="font-medium text-sm">
              {item.name}
            </div>

            <div className="text-sm text-gray-700 mt-1">
              {item.comment}
            </div>

          </div>
        ))}

      </div>

      <div className="flex gap-2">

        <input
          type="text"
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          onKeyDown={(e) => {
            console.log("KEY:", e.key);

            if (e.key === "Enter") {
              console.log("ENTER DETECTED");
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Tuliskan komentar/arahan..."
          className="
            flex-1
            border
            border-gray-300
            rounded-lg
            px-4
            py-2
          "
        />

        <button
          onClick={submit}
          className="
            bg-orange-500
            hover:bg-orange-600
            text-white
            rounded-lg
            px-4
          "
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  );
}