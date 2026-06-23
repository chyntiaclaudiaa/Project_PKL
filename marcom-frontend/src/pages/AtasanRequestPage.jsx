import { useEffect, useState } from "react";

import AtasanSidebar from "../components/atasan/AtasanSidebar";

import RequestFilterBar from "../components/atasan/RequestFilterBar";
import RequestTable from "../components/atasan/RequestTable";

import {
  getAllRequests,
  togglePriority,
} from "../services/atasan_requestService";

export default function AtasanRequestPage() {

  const [requests, setRequests] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    loadRequests();
  }, [search, status]);

  const loadRequests = async () => {
  try {
    const res = await getAllRequests({ search, status });
    
    // ANTISIPASI: Jika res.data ada pakai res.data, jika tidak pakai res langsung
    const dataTarget = res && res.data ? res.data : res;

    if (Array.isArray(dataTarget)) {
      setRequests(dataTarget);
    } else {
      console.error("Data yang diterima bukan array. Periksa isi response:", res);
    }
  } catch (err) {
    console.error("Gagal mengambil data request:", err);
  }
};

  const handlePriority =
    async (id) => {

      try {

        await togglePriority(id);

        await loadRequests();

      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div className="flex h-screen bg-[#f4f6f9] ">

      <AtasanSidebar
        activeMenu="request"
      />

      <div className="flex-1 overflow-auto">

        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-8 py-5">

          <h1 className="text-2xl font-bold">
            Semua Request
          </h1>

          <p className="text-sm text-gray-500">
            Monitoring seluruh request
            konten Marketing
            Communication
          </p>

        </header>

        <main className="p-8 space-y-6">

          {/* FILTER */}
          <RequestFilterBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />

          {/* TABLE FULL WIDTH */}
          <RequestTable
            data={requests}
            onTogglePriority={
              handlePriority
            }
          />

        </main>

      </div>

    </div>
  );
}