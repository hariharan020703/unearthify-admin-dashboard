/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import toast from "react-hot-toast";
import {
  getApplicationApi,
  deleteApplicationApi,
} from "../../api/applicationApi";

export type Application = {
  _id: string;
  artFormName: string;
  name: string;
  phoneNumber: string;
  age: number;
  location: string;
  gender: string;
  address: string;
};

type SortKey = "name" | "phoneNumber" | "artFormName" | "location";

export default function ApplicationList() {
  const [data, setData] = useState<Application[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [genderFilter, setGenderFilter] = useState("");
  const [tempGender, setTempGender] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewApplication, setViewApplication] = useState<Application | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadApplications();
  }, []);

  /* ---------- OUTSIDE CLICK HANDLER ---------- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenu(null);
      }

      if (filterRef.current && !filterRef.current.contains(target)) {
        setShowFilter(false);
      }

      if (modalRef.current && !modalRef.current.contains(target)) {
        setViewApplication(null);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await getApplicationApi();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SORT ---------- */
  const sortData = (key: SortKey) => {
    const newOrder = sortKey === key && order === "asc" ? "desc" : "asc";
    setSortKey(key);
    setOrder(newOrder);

    const sorted = [...data].sort((a: Application, b: Application) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return newOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return newOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setData(sorted);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <div className="flex flex-col leading-none">
      <TiArrowSortedUp
        size={14}
        className={
          sortKey === col && order === "asc" ? "text-black" : "text-gray-300"
        }
      />
      <TiArrowSortedDown
        size={14}
        className={
          sortKey === col && order === "desc" ? "text-black" : "text-gray-300"
        }
      />
    </div>
  );

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteApplicationApi(id);
      setData((prev) => prev.filter((item) => item._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "phoneNumber", label: "Phone" },
    { key: "artFormName", label: "Art Form" },
    { key: "location", label: "Location" },
  ];

  /* ---------- FILTER ---------- */
  const filteredData = data.filter((d) => {
    const value = search.toLowerCase();

    const matchesSearch =
      d.name.toLowerCase().includes(value) ||
      d.phoneNumber.includes(search) ||
      d.artFormName.toLowerCase().includes(value) ||
      d.location.toLowerCase().includes(value);

    const matchesGender = genderFilter
      ? d.gender.toLowerCase() === genderFilter.toLowerCase()
      : true;

    return matchesSearch && matchesGender;
  });

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filteredData.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, genderFilter]);

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Search & Filter Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Left Section - Search and Filter Chips */}
        <div className="flex flex-col w-full lg:flex-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, art form..."
              className="w-full sm:w-72 border rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            {genderFilter && (
              <span className="flex items-center gap-1 sm:gap-2 bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                Gender: {genderFilter}
                <button 
                  onClick={() => setGenderFilter("")} 
                  className="font-bold hover:text-red-600">
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex gap-2 self-end lg:self-auto">
          <button
            onClick={() => {
              setGenderFilter("");
              setTempGender("");
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filters
          </button>

          <button
            onClick={() => setShowFilter((p) => !p)}
            className="flex items-center gap-1 sm:gap-2 border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm filter-btn whitespace-nowrap">
            <PiSlidersHorizontalBold size={14} /> Filter
          </button>
        </div>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* FILTER BOX */}
      <div className="relative">
        {showFilter && (
          <div
            ref={filterRef}
            className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-3 sm:p-4 z-30 filter-box">
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Filter Applications</h4>

            <div>
              <label className="text-xs sm:text-sm text-gray-600">Gender</label>
              <select
                value={tempGender}
                onChange={(e) => setTempGender(e.target.value)}
                className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mt-1">
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-3 sm:mt-4">
              <button
                onClick={() => setShowFilter(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg">
                Cancel
              </button>

              <button
                onClick={() => {
                  setGenderFilter(tempGender);
                  setShowFilter(false);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#83261D] text-white rounded-lg">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center py-6 sm:py-8 text-gray-500 font-medium text-sm sm:text-base">
          Loading Applications...
        </p>
      )}

      {!loading && (
        /* Table - Responsive with horizontal scroll */
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm border text-gray-500 min-w-[700px] lg:min-w-full">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h.key}
                    onClick={() => sortData(h.key)}
                    className="p-2 sm:p-3 cursor-pointer text-left">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span>{h.label}</span>
                      <SortIcon col={h.key} />
                    </div>
                  </th>
                ))}
                <th className="p-2 sm:p-3"></th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 text-xs sm:text-sm">
                    No Applications found
                  </td>
                </tr>
              )}

              {paginated.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="p-2 sm:p-3 font-medium text-gray-800 text-xs sm:text-sm">
                    {a.name}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{a.phoneNumber}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[150px] truncate">
                    {a.artFormName}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[150px] truncate">
                    {a.location}
                  </td>

                  <td className="p-2 sm:p-3 text-right relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === a._id ? null : a._id)
                      }>
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === a._id && (
                      <div
                        className="absolute right-0 sm:right-2 top-8 sm:top-10 w-24 sm:w-28 md:w-32 bg-white border rounded-lg shadow z-20 text-xs sm:text-sm"
                        ref={menuRef}>
                        <button
                          onClick={() => {
                            setViewApplication(a);
                            setOpenMenu(null);
                          }}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                          View
                        </button>

                        <button
                          onClick={() => handleDelete(a._id)}
                          disabled={deletingId === a._id}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50">
                          {deletingId === a._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
     {totalPages > 1 && (
  <div className="flex justify-center items-center mt-4 sm:mt-6 gap-2 flex-wrap">

    {/* Prev */}
    <button
      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      disabled={page === 1}
      className="px-3 py-1 text-xs sm:text-sm border rounded disabled:opacity-50"
    >
      Prev
    </button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => setPage(i + 1)}
        className={`px-3 py-1 text-xs sm:text-sm border rounded ${
          page === i + 1
            ? "bg-[#83261D] text-white border-[#83261D]"
            : "hover:bg-gray-100"
        }`}
      >
        {i + 1}
      </button>
    ))}

    {/* Next */}
    <button
      onClick={() =>
        setPage((prev) => Math.min(prev + 1, totalPages))
      }
      disabled={page === totalPages}
      className="px-3 py-1 text-xs sm:text-sm border rounded disabled:opacity-50"
    >
      Next
    </button>

  </div>
)}    

      {/* View Modal - Responsive */}
      {viewApplication && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div
            className="bg-white w-full max-w-[95%] sm:max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative"
            ref={modalRef}>
            
            {/* Header with Brand Color */}
            <div className="bg-[#83261D] p-4 sm:p-5 md:p-6 text-white relative">
              <button
                onClick={() => setViewApplication(null)}
                className="absolute right-3 sm:right-4 top-3 sm:top-4 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xl sm:text-2xl">
                ×
              </button>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl sm:text-2xl font-bold">{viewApplication.name}</h2>
                <div className="mt-1 sm:mt-2 inline-flex items-center w-fit px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-lg text-[10px] sm:text-xs">
                  🎨 {viewApplication.artFormName}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100">
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 uppercase font-bold mb-0.5 sm:mb-1 tracking-tight">
                    Age
                  </p>
                  <p className="text-gray-800 font-semibold text-xs sm:text-sm">
                    {viewApplication.age} Years
                  </p>
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100">
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 uppercase font-bold mb-0.5 sm:mb-1 tracking-tight">
                    Gender
                  </p>
                  <p className="text-gray-800 font-semibold text-xs sm:text-sm">
                    {viewApplication.gender}
                  </p>
                </div>
              </div>

              {/* Detailed Info List */}
              <div className="space-y-3 sm:space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center text-[#83261D] shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium">
                      Phone Number
                    </p>
                    <p className="text-gray-700 font-medium text-xs sm:text-sm break-words">
                      {viewApplication.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center text-[#83261D] shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium">
                      Location
                    </p>
                    <p className="text-gray-700 font-medium text-xs sm:text-sm break-words">
                      {viewApplication.location}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center text-[#83261D] shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium">
                      Residential Address
                    </p>
                    <p className="text-gray-700 leading-relaxed text-justify text-xs sm:text-sm break-words max-h-24 sm:max-h-32 overflow-y-auto">
                      {viewApplication.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}