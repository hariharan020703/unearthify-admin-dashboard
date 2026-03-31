/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import toast from "react-hot-toast";
import {
  getAllContributionsApi,
  deleteContributionApi,
} from "../../api/contributionApi";

export type Contribution = {
  _id: string;
  name: string;
  mobileNumber: string;
  contributionType: string;
  description: string;
  status: string;
};

type SortKey = "name" | "mobileNumber" | "contributionType";

export default function ContributionList() {
  const [data, setData] = useState<Contribution[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [typeFilter, setTypeFilter] = useState("");

  const [tempType, setTempType] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewContribution, setViewContribution] = useState<Contribution | null>(
    null,
  );
  const modalRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const res = await getAllContributionsApi();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- OUTSIDE CLICK (menu) ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // menu
      if (!target.closest(".contribution-menu")) {
        setOpenMenu(null);
      }

      // filter
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setShowFilter(false);
      }

      // modal
      if (modalRef.current && !modalRef.current.contains(target)) {
        setViewContribution(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- SORT ---------- */

  const sortData = (key: SortKey) => {
    const newOrder = sortKey === key && order === "asc" ? "desc" : "asc";
    setSortKey(key);
    setOrder(newOrder);

    const sorted = [...data].sort((a: any, b: any) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return newOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return newOrder === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, {
            sensitivity: "base",
          })
        : String(bVal).localeCompare(String(aVal), undefined, {
            sensitivity: "base",
          });
    });

    setData(sorted);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteContributionApi(id);
      toast.success("Deleted");
      loadContributions();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- ICON ---------- */
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

  const headers: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "mobileNumber", label: "Mobile" },
    { key: "contributionType", label: "Contribution Type" },
  ];

  /* ---------- FILTERED DATA ---------- */
  const filteredData = data.filter((d) => {
    const value = search.toLowerCase();

    const matchesSearch =
      d.name.toLowerCase().includes(value) || d.mobileNumber.includes(search);

    const matchesType = typeFilter
      ? d.contributionType.toLowerCase().includes(typeFilter.toLowerCase())
      : true;

    return matchesSearch && matchesType;
  });

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filteredData.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  /* ---------- APPLY FILTER ---------- */
  const applyFilters = () => {
    setTypeFilter(tempType);
    setShowFilter(false);
    setTempType("");
  };

  const clearFilters = () => {
    setTypeFilter("");
    setTempType("");
    setShowFilter(false);
  };

  const removeTypeFilter = () => setTypeFilter("");

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Search & filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Left Section - Search and Filter Chips */}
        <div className="flex flex-col w-full lg:flex-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone..."
              className="w-full sm:w-72 border rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            {typeFilter && (
              <span className="flex items-center gap-1 sm:gap-2 bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                Type: {typeFilter}
                <button 
                  onClick={removeTypeFilter} 
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
            onClick={clearFilters}
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

      {/* Filter box */}
      <div className="relative">
        {showFilter && (
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-3 sm:p-4 z-30 filter-box">
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Filter Contributions</h4>

            <div>
              <label className="text-xs sm:text-sm text-gray-600">Contribution Type</label>
              <select
                value={tempType}
                onChange={(e) => setTempType(e.target.value)}
                className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mt-1">
                <option value="">Select type</option>
                <option>Artist Information</option>
                <option>Art Form Details</option>
                <option>Cultural Events</option>
                <option>Others</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-3 sm:mt-4">
              <button
                onClick={() => setShowFilter(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg">
                Cancel
              </button>

              <button
                onClick={applyFilters}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#83261D] text-white rounded-lg">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="py-8 sm:py-10 text-center text-gray-500 font-medium text-sm sm:text-base">
          Loading contributions...
        </div>
      )}

      {!loading && (
        /* Table - Responsive with horizontal scroll */
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm border text-gray-500 min-w-[600px] lg:min-w-full">
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
                  <td colSpan={4} className="p-4 text-center text-gray-500 text-xs sm:text-sm">
                    No contributions found
                  </td>
                </tr>
              )}

              {paginated.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-2 sm:p-3 font-medium text-gray-800 text-xs sm:text-sm">
                    {c.name}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{c.mobileNumber}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[150px] truncate">
                    {c.contributionType}
                  </td>

                  <td className="p-2 sm:p-3 text-right relative contribution-menu">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === c._id ? null : c._id)
                      }>
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === c._id && (
                      <div className="absolute right-0 sm:right-2 top-8 sm:top-10 w-24 sm:w-28 md:w-32 bg-white border rounded-lg shadow z-20 text-xs sm:text-sm">
                        <button
                          onClick={() => {
                            setViewContribution(c);
                            setOpenMenu(null);
                          }}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                          View
                        </button>

                        <button
                          onClick={() => handleDelete(c._id)}
                          disabled={deletingId === c._id}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50">
                          {deletingId === c._id ? "Deleting..." : "Delete"}
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-2 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded disabled:opacity-40 hover:bg-gray-100 transition-colors">
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded transition-colors ${
                page === i + 1 
                  ? "bg-[#83261D] text-white border-[#83261D]" 
                  : "hover:bg-gray-100"
              }`}>
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded disabled:opacity-40 hover:bg-gray-100 transition-colors">
            Next
          </button>
        </div>
      )}

      {/* View Modal - Responsive */}
      {viewContribution && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-[95%] sm:max-w-md rounded-xl sm:rounded-2xl md:rounded-[32px] overflow-hidden relative shadow-xl border border-gray-100">
            
            {/* Close Button */}
            <button
              onClick={() => setViewContribution(null)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 text-gray-400 hover:text-gray-900 transition-colors bg-white/80 rounded-full p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header Section */}
            <div className="relative bg-[#83261D] pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 sm:w-36 md:w-40 h-32 sm:h-36 md:h-40 bg-white/10 rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {viewContribution.name}
                </h2>
                <span className="mt-1 sm:mt-2 text-white/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {viewContribution.contributionType}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-5 md:px-6 lg:px-8 pb-4 sm:pb-5 md:pb-6 lg:pb-8 -mt-6 sm:-mt-7 md:-mt-8 relative z-10">
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg border border-gray-50 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                {/* Contact Number */}
                <div className="flex justify-center">
                  <div className="space-y-0.5 sm:space-y-1 text-center">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Contact No.
                    </p>
                    <p className="text-gray-900 font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-[#83261D]">📞</span>{" "}
                      {viewContribution.mobileNumber}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Description */}
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Message/Notes
                  </p>
                  <div className="bg-gray-50/80 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed italic text-justify max-h-32 sm:max-h-40 overflow-y-auto">
                      "
                      {viewContribution.description ||
                        "No specific notes provided for this contribution."}
                      "
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