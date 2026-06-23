import { useEffect, useState } from "react";
import CommentSection from "../components/atasan/CommentSection";
import AtasanSidebar from "../components/atasan/AtasanSidebar";


import {
  ArrowLeft,
  Star,
} from "lucide-react";

import {
  getRequestById,
  togglePriority,
} from "../services/atasan_requestService";

import {
  getComments,
  addComment,
} from "../services/atasan_commentService";

import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

export default function AtasanRequestDetailPage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const source =
    location.state?.source ||
    "request";

  const [request, setRequest] =
    useState(null);

  const [comments, setComments] =
    useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {

    try {

      const [
        requestRes,
        commentRes,
      ] = await Promise.all([
        getRequestById(id),
        getComments(id),
      ]);

      setRequest(requestRes.data);
      setComments(commentRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  const handlePriority =
    async () => {

      try {

        await togglePriority(id);
        await loadData();

      } catch (err) {
        console.error(err);
      }
    };

  const handleSubmitComment =
    async (commentText) => {

      if (!commentText.trim()) return;

      try {

        const user =
          JSON.parse(
            localStorage.getItem("user")
          );

        await addComment({
          request_id: id,
          user_id: user.id,
          comment: commentText,
        });

        await loadData();

      } catch (err) {
        console.error(err);
      }
    };

  if (!request) {

    return (
      <div className="flex h-screen bg-[#F6F8FB]">
        <AtasanSidebar
          activeMenu={
            source === "dashboard"
              ? "dashboard"
              : "request"
          }
        />
      </div>
    );
  }

  return (

    <div className="flex h-screen bg-[#F6F8FB]">

     <AtasanSidebar activeMenu={source === "dashboard" ? "dashboard" : "request"}/>

      <div className="flex-1 overflow-auto">

        {/* HEADER */}

        <div
          className="
            bg-white
            border-b
            border-gray-200
            px-8
            py-5
            flex
            justify-between
            items-center
          "
        >

          <div>

            <h1
              className="
                text-xl
                font-semibold
                text-slate-900
              "
            >
              Detail Request
            </h1>

            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              {request.letter_number}
            </p>

          </div>

          <button
            onClick={() => navigate(
                source === "dashboard"
                  ? "/atasan/dashboard"
                  : "/atasan/request"
              )}
            className="
              flex
              items-center
              gap-2
              text-sm
              text-slate-600
              hover:text-slate-900
            "
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

        </div>

        <div className="p-8">

          {/* DETAIL CARD */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-gray-200
              p-6
            "
          >

            <div className="flex justify-between items-start">

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-3
                    flex-wrap
                  "
                >

                  <span
                    className="
                      text-sm
                      text-slate-400
                    "
                  >
                    {request.request_code}
                  </span>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-blue-50
                      text-blue-600
                      text-xs
                      font-medium
                    "
                  >
                    {request.status}
                  </span>

                  {request.is_priority && (

                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        bg-yellow-100
                        text-yellow-700
                        text-xs
                        font-medium
                      "
                    >
                      Prioritas
                    </span>

                  )}

                </div>

                <h2
                  className="
                    text-2xl
                    font-semibold
                    text-slate-900
                  "
                >
                  {request.title}
                </h2>

              </div>

              <button
                onClick={handlePriority}
                className="
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-yellow-300
                  bg-yellow-50
                  text-yellow-700
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  hover:bg-yellow-100
                  transition
                "
              >

                <Star
                  size={18}
                  fill={
                    request.is_priority
                      ? "#facc15"
                      : "none"
                  }
                  className="text-yellow-500"
                />

                {request.is_priority
                  ? "Batalkan Prioritas"
                  : "Jadikan Prioritas"}

              </button>

            </div>

            {/* INFORMASI */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
                mt-8
              "
            >

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Nomor Surat
                </p>
                <p className="text-sm font-medium">
                  {request.letter_number}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Tanggal Masuk
                </p>
                <p className="text-sm font-medium">
                  {new Date(
                    request.entry_date
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Deadline
                </p>
                <p className="text-sm font-medium">
                  {new Date(
                    request.deadline
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Divisi Pengaju
                </p>
                <p className="text-sm font-medium">
                  {request.requester_division}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Platform Target
                </p>
                <p className="text-sm font-medium">
                  {request.platform_target}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  PIC
                </p>
                <p className="text-sm font-medium">
                  {request.pic_name || "-"}
                </p>
              </div>

            </div>

            <hr className="my-8 border-gray-200" />

            {/* DESKRIPSI */}

            <div>

              <p
                className="
                  text-xs
                  text-slate-400
                  mb-2
                "
              >
                Deskripsi Kebutuhan
              </p>

              <p  className="  text-sm  leading-7  text-slate-700  whitespace-pre-wrap  ">
                {request.description}
              </p>

            </div>

            {/* INFO */}

            <div
              className="  mt-8  bg-blue-50  border  border-orange-200  rounded-xl  p-4  text-sm  text-orange-700  ">
              Anda hanya dapat memberikan komentar dan mengatur prioritas. Perubahan data request dilakukan oleh anggota Marketing Communication.
            </div>

          </div>

          {/* KOMENTAR */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-gray-200
              p-6
              mt-6
            "
          >

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