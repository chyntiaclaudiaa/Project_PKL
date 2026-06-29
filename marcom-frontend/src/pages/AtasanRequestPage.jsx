import { useEffect, useState, useRef } from "react";
import AtasanSidebar from "../components/atasan/AtasanSidebar";
import RequestFilterBar from "../components/atasan/RequestFilterBar";
import RequestTable from "../components/atasan/RequestTable";
import AtasanRequestDetailPage from "./AtasanRequestDetailPage"; 
import { getAllRequests, togglePriority } from "../services/atasan_requestService";

export default function AtasanRequestPage() {
  const [search, setSearch] = useState(() => sessionStorage.getItem("req_search") || "");
  const [status, setStatus] = useState(() => sessionStorage.getItem("req_status") || "");
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  
  const mainContainerRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("req_search", search);
    sessionStorage.setItem("req_status", status);
    loadRequests();
  }, [search, status]);

  useEffect(() => {
    const savedScrollTop = sessionStorage.getItem("req_scroll_top");
    const container = mainContainerRef.current;

    if (savedScrollTop && container) {
      setTimeout(() => {
        container.scrollTop = parseInt(savedScrollTop, 10);
      }, 100);
    }

    const handleScroll = () => {
      if (container) {
        sessionStorage.setItem("req_scroll_top", container.scrollTop);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [requests]);

  const loadRequests = async () => {
    try {
      const res = await getAllRequests({ search, status });
      
      console.log("Full API Response:", res); 

      let dataTarget = [];
      
      if (Array.isArray(res)) {
        dataTarget = res; 
      } else if (res && Array.isArray(res.data)) {
        dataTarget = res.data; 
      } else if (res && res.data && Array.isArray(res.data.data)) {
        dataTarget = res.data.data;
      } else if (res && Array.isArray(res.requests)) {
          dataTarget = res.requests; 
      } else {
        console.error("Gagal menemukan struktur Array pada respons API. Lihat log 'Full API Response'.");
      }

      setRequests(dataTarget);

    } catch (err) {
      console.error("Gagal mengambil data request:", err);
    }
  };

  const handlePriority = async (id) => {
    try {
      await togglePriority(id);
      await loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] relative overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="sticky top-0 h-screen z-20">
        <AtasanSidebar activeMenu="request" />
      </div>

      <div ref={mainContainerRef} className="flex-1 h-screen flex flex-col overflow-y-auto scroll-smooth">
        
        <header className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 md:px-8 shrink-0 z-10 ">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Semua Request</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Monitoring seluruh request konten Marketing Communication
          </p>
        </header>

        {/* AREA KONTEN UTAMA */}
        <main className="p-4 md:p-8 space-y-6 flex-1">
          <RequestFilterBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />

          {/* PARAMETER ID TABEL KE STATE MODAL */}
          <RequestTable 
            data={requests} 
            onTogglePriority={handlePriority} 
            onOpenDetail={(id) => setSelectedRequestId(id)} 
          />
        </main>
      </div>

      {/* MODAL DETAIL */}
      {selectedRequestId && (
        <AtasanRequestDetailPage 
          requestId={selectedRequestId} 
          onClose={() => {
            setSelectedRequestId(null);
            loadRequests(); 
          }} 
        />
      )}
    </div>
  );
}