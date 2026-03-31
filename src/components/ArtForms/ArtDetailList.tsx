/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { MoreVertical } from "lucide-react";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import {
  getAllArtDetailsApi,
  deleteArtDetailApi,
} from "../../api/artDetailApi";

type ArtDetail = {
  _id: string;
  category: {
    _id: string;
    name: string;
  };
  artType: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
  };
  language: string;
  state: string;
  materials: string;
  region: string;
  famousArtist: string;
  contemporaryPerformers: string;
  typicalLength: string;
  origin: string;
  websiteLink: string;
};

export default function ArtDetailList() {
  const [details, setDetails] = useState<ArtDetail[]>([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<ArtDetail | null>(null);
  const [sortKey, setSortKey] = useState<
    "origin" | "region" | "artist" | "materials" | ""
  >("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [tempFilters, setTempFilters] = useState({
    region: "",
    state: "",
    origin: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    region: "",
    state: "",
    origin: "",
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const res = await getAllArtDetailsApi();
      setDetails(res.data.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------- CLOSE MENU ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".action-menu")) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- CLOSE FILTER ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- CLEAR FILTER ---------- */
  const clearFilters = () => {
    setTempFilters({ region: "", state: "", origin: "" });
    setAppliedFilters({ region: "", state: "", origin: "" });
    setFilterOpen(false);
  };

  /* ---------- FILTER + SEARCH ---------- */
  const filteredDetails = details
    .filter((d) => {
      const value = search.toLowerCase();

      const matchSearch =
        d.origin.toLowerCase().includes(value) ||
        d.materials.toLowerCase().includes(value) ||
        d.famousArtist.toLowerCase().includes(value) ||
        d.region.toLowerCase().includes(value) ||
        d.websiteLink.toLowerCase().includes(value);

      const matchRegion = appliedFilters.region
        ? d.region === appliedFilters.region
        : true;

      const matchState = appliedFilters.state
        ? d.state === appliedFilters.state
        : true;

      const matchOrigin = appliedFilters.origin
        ? d.origin === appliedFilters.origin
        : true;

      return matchSearch && matchRegion && matchState && matchOrigin;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA: any;
      let valB: any;

      if (sortKey === "origin") {
        valA = a.origin.toLowerCase();
        valB = b.origin.toLowerCase();
      }

      if (sortKey === "region") {
        valA = a.region.toLowerCase();
        valB = b.region.toLowerCase();
      }

      if (sortKey === "artist") {
        valA = a.famousArtist.toLowerCase();
        valB = b.famousArtist.toLowerCase();
      }

      if (sortKey === "materials") {
        valA = a.materials.length;
        valB = b.materials.length;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  function handleEdit(item: ArtDetail) {
    navigate("/art-details/add", { state: item });
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteArtDetailApi(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">
          Art Details List
        </h2>
        <button
          onClick={() => navigate("/art-details/add")}
          className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto">
          + Add Art Details
        </button>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4">
        {/* Left Section - Search and Filter Chips */}
        <div className="flex flex-col w-full lg:flex-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search art details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full sm:w-80 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            {Object.entries(appliedFilters).map(([key, value]) =>
              value ? (
                <div
                  key={key}
                  className="flex items-center gap-1 sm:gap-2 bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                  <span className="capitalize">
                    {key}: {value}
                  </span>
                  <button
                    onClick={() =>
                      setAppliedFilters((prev) => ({ ...prev, [key]: "" }))
                    }
                    className="font-bold hover:text-black">
                    ×
                  </button>
                </div>
              ) : null,
            )}
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="relative flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={clearFilters}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filter
          </button>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1 sm:gap-2 border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm filter-btn whitespace-nowrap">
            <PiSlidersHorizontalBold size={14} />
            Filter
          </button>

          {/* Filter Dropdown */}
          {filterOpen && (
            <div className="filter-box absolute right-0 top-full mt-2 w-64 sm:w-72 md:w-80 bg-white border rounded-xl shadow-xl p-3 sm:p-4 z-30">
              <p className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">
                Filter
              </p>

              <select
                value={tempFilters.region}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, region: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mb-2 sm:mb-3">
                <option value="">All Regions</option>
                {[...new Set(details.map((d) => d.region))].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={tempFilters.state}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, state: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mb-2 sm:mb-3">
                <option value="">All States</option>
                {[...new Set(details.map((d) => d.state))].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={tempFilters.origin}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, origin: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mb-3 sm:mb-4">
                <option value="">All Origins</option>
                {[...new Set(details.map((d) => d.origin))].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 border rounded-lg text-xs sm:text-sm">
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setAppliedFilters(tempFilters);
                    setFilterOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#83261D] text-white rounded-lg text-xs sm:text-sm">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="my-2 sm:my-3" />

      {loading && (
        <div className="py-8 sm:py-10 text-center text-gray-500 font-medium text-sm sm:text-base">
          Loading art details...
        </div>
      )}

      {!loading && (
        /* Table - Responsive with horizontal scroll */
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm border border-[#F1EEE7] min-w-[900px] lg:min-w-full">
            <thead>
              <tr className="border-b">
                <th
                  className="p-2 sm:p-3 text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortKey("origin");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                  <div className="flex items-center gap-1">
                    <span>Origin</span>
                    <div className="flex flex-col leading-none">
                      <TiArrowSortedUp
                        size={14}
                        className={
                          sortKey === "origin" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                      <TiArrowSortedDown
                        size={14}
                        className={
                          sortKey === "origin" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </th>

                {/* MATERIALS */}
                <th
                  className="p-2 sm:p-3 text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortKey("materials");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                  <div className="flex items-center gap-1">
                    <span>Materials</span>
                    <div className="flex flex-col leading-none">
                      <TiArrowSortedUp
                        size={14}
                        className={
                          sortKey === "materials" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                      <TiArrowSortedDown
                        size={14}
                        className={
                          sortKey === "materials" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </th>

                {/* FAMOUS ARTIST */}
                <th
                  className="p-2 sm:p-3 text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortKey("artist");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                  <div className="flex items-center gap-1">
                    <span>Famous Artist</span>
                    <div className="flex flex-col leading-none">
                      <TiArrowSortedUp
                        size={14}
                        className={
                          sortKey === "artist" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                      <TiArrowSortedDown
                        size={14}
                        className={
                          sortKey === "artist" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </th>

                {/* REGION */}
                <th
                  className="p-2 sm:p-3 text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortKey("region");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                  <div className="flex items-center gap-1">
                    <span>Region</span>
                    <div className="flex flex-col leading-none">
                      <TiArrowSortedUp
                        size={14}
                        className={
                          sortKey === "region" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                      <TiArrowSortedDown
                        size={14}
                        className={
                          sortKey === "region" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </th>

                <th className="p-2 sm:p-3 text-left">Website</th>
                <th className="p-2 sm:p-3 text-right"></th>
              </tr>
            </thead>

            <tbody>
              {filteredDetails.map((d) => (
                <tr key={d._id} className="border-t">
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{d.origin}</td>
                  <td className="p-2 sm:p-3 text-justify text-xs sm:text-sm max-w-xs">
                    <p className="line-clamp-2">{d.materials}</p>
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    {d.famousArtist}
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{d.region}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[150px]">
                    <a
                      href={d.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate block">
                      {d.websiteLink}
                    </a>
                  </td>

                  <td className="p-2 sm:p-3 text-right relative action-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === d._id ? null : d._id);
                      }}>
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === d._id && (
                      <div
                        className="absolute right-0 sm:right-2 top-8 sm:top-9 w-24 sm:w-28 md:w-32 bg-white border rounded-lg shadow z-20 text-xs sm:text-sm action-menu"
                        onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewItem(d);
                            setOpenMenu(null);
                          }}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                          View
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(null);
                            handleEdit(d);
                          }}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                          Update
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(d._id);
                          }}
                          disabled={deletingId === d._id}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50">
                          {deletingId === d._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDetails.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 sm:p-6 text-center text-gray-400 font-medium text-xs sm:text-sm">
                    No Details Added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal - Responsive */}
      {viewItem && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setViewItem(null)}>
          <div
            className="bg-white w-full max-w-[95%] sm:max-w-lg max-h-[90vh] rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            {/* Header Section */}
            <div className="bg-[#83261D] px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <svg width="150" height="150" viewBox="0 0 100 100">
                  <circle cx="100" cy="0" r="80" fill="white" />
                </svg>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setViewItem(null)}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white/50 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter">
                Artistic Specifications
              </h2>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    label: "Category",
                    value: viewItem.category?.name,
                    icon: "📂",
                  },
                  {
                    label: "Art Type",
                    value: viewItem.artType?.name,
                    icon: "🎵",
                  },
                  { label: "Origin", value: viewItem.origin, icon: "🌍" },
                  { label: "Region", value: viewItem.region, icon: "📍" },
                  { label: "State", value: viewItem.state, icon: "🏛️" },
                  { label: "Language", value: viewItem.language, icon: "💬" },
                  { label: "Materials", value: viewItem.materials, icon: "🎨" },
                  {
                    label: "Famous Artist",
                    value: viewItem.famousArtist,
                    icon: "🌟",
                  },
                  {
                    label: "Performers",
                    value: viewItem.contemporaryPerformers,
                    icon: "🎭",
                  },
                  {
                    label: "Typical Length",
                    value: viewItem.typicalLength,
                    icon: "⏱️",
                  },
                  {
                    label: "Website",
                    value: viewItem.websiteLink,
                    icon: "🔗",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="text-xl sm:text-2xl mr-2 sm:mr-3 md:mr-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-[#83261D] mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-gray-800 font-bold text-xs sm:text-sm md:text-base leading-tight break-words">
                        {item.value || "Not Specified"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
