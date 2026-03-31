/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { getAllArtistsApi, softDeleteArtistApi } from "../../api/artistApi";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import Papa from "papaparse";
import { bulkCreateArtistsApi } from "../../api/artistApi";
import * as XLSX from "xlsx";

type ArtistImage = {
  url: string;
  imageId: string;
};

type Artist = {
  _id: string;
  name: string;
  category: string;
  artTypeId: string;
  artTypeName: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  image: string;
  collection: ArtistImage[];
  isFeatured: boolean;
  status: string;
  phone: string;
  email: string;
  website?: string;
};

type SortKey = "name" | "artTypeName" | "city" | "state" | "country" | "email" | "phone";

function ArtistsList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [artTypeNameFilter, setArtTypeNameFilter] = useState("");

  const [tempCity, setTempCity] = useState("");
  const [tempState, setTempState] = useState("");
  const [tempArtTypeName, setTempArtTypeName] = useState("");
  const [viewArtist, setViewArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const navigate = useNavigate();

  const loadArtists = async () => {
    try {
      setLoading(true);
      const res = await getAllArtistsApi();
      setArtists(res.data.data);
    } catch {
      toast.error("Failed to load artists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  /* ---------- OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // if click is NOT inside any action menu or 3-dot button
      if (!target.closest(".artist-menu")) {
        setOpenMenu(null);
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

    const sorted = [...artists].sort((a: any, b: any) => {
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

    setArtists(sorted);
  };

  /* ---------- DELETE ---------- */
  const confirmRemoveArtist = (id: string) => {
    setOpenMenu(null);
    setDeleteId(id);
  };

  const handleSoftDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);

      await softDeleteArtistApi(deleteId);

      toast.success("Artist moved to deleted list");

      setDeleteId(null);
      loadArtists();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
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
    { key: "artTypeName", label: "Art Type" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const filteredArtists = artists.filter((a) => {
    const value = search.toLowerCase();

    const matchSearch =
      a.name.toLowerCase().includes(value) ||
      a.artTypeName.toLowerCase().includes(value) ||
      a.city.toLowerCase().includes(value) ||
      a.state.toLowerCase().includes(value) ||
      a.country.toLowerCase().includes(value) ||
      a.email.toLowerCase().includes(value) ||
      a.phone.toLowerCase().includes(value);

    const matchCity = cityFilter
      ? a.city.toLowerCase().includes(cityFilter.toLowerCase())
      : true;

    const matchState = stateFilter
      ? a.state.toLowerCase().includes(stateFilter.toLowerCase())
      : true;

    const matchArtTypeName = artTypeNameFilter
      ? a.artTypeName.toLowerCase().includes(artTypeNameFilter.toLowerCase())
      : true;

    return matchSearch && matchCity && matchState && matchArtTypeName;
  });

  const totalPages = Math.ceil(filteredArtists.length / ITEMS_PER_PAGE);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedArtists = filteredArtists.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, cityFilter, stateFilter, artTypeNameFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [filteredArtists, totalPages]);

  const applyFilters = () => {
    setCityFilter(tempCity);
    setStateFilter(tempState);
    setArtTypeNameFilter(tempArtTypeName);
    setShowFilter(false);

    setTempCity("");
    setTempState("");
    setTempArtTypeName("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearFilters = () => {
    // clear applied filters
    setCityFilter("");
    setStateFilter("");
    setArtTypeNameFilter("");

    // clear temp inputs
    setTempCity("");
    setTempState("");
    setTempArtTypeName("");

    setShowFilter(false);
  };
  const handleExportExcel = () => {
    const exportData = filteredArtists.map((a) => ({
      Name: a.name,
      "Art Type": a.artTypeName,
      City: a.city,
      State: a.state,
      Country: a.country,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Artists");

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((r: any) => String(r[key] ?? "").length)) + 2,
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "artists.xlsx");
  };

  const removeSingleFilter = (type: "city" | "state" | "artTypeName") => {
    if (type === "city") setCityFilter("");
    if (type === "state") setStateFilter("");
    if (type === "artTypeName") setArtTypeNameFilter("");
  };

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvPreview(results.data.slice(0, 5));
        setShowCsvModal(true);
      },
    });
  };
  const handleDownloadTemplate = () => {
    const headers = [["name", "artTypeName", "city", "state", "country", "bio"]];

    const worksheet = XLSX.utils.aoa_to_sheet(headers);

    // Style header row - bold with background color
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "83261D" } },
      alignment: { horizontal: "center" },
    };

    ["A1", "B1", "C1", "D1", "E1", "F1"].forEach((cell) => {
      if (worksheet[cell]) worksheet[cell].s = headerStyle;
    });


    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Artists");
    XLSX.writeFile(workbook, "artists_template.xlsx");
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;

    try {
      const parsed: any = await new Promise((resolve) => {
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
        });
      });

      const res = await bulkCreateArtistsApi({
        artists: parsed,
      });

      const inserted = res.data.inserted || 0;
      const skipped = res.data.skipped || 0;
      const total = parsed.length;

      if (inserted === 0 && total > 0) {
        toast("All records already exist — nothing uploaded", {
          icon: "⚠️",
        });
        return;
      }

      if (inserted > 0 && skipped > 0) {
        toast.success(`Uploaded: ${inserted} • Skipped duplicates: ${skipped}`);
      }

      if (inserted > 0 && skipped === 0) {
        toast.success(`${inserted} artists uploaded successfully`);
      }

      setShowCsvModal(false);
      loadArtists();
    } catch {
      toast.error("Bulk upload failed");
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-auto">
      {/* Header Actions - Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mb-4">
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleCsvUpload}
          className="hidden"
        />
        <button
          onClick={handleDownloadTemplate}
          className="bg-[#F8E7DC] text-[#83261D] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap hover:bg-[#f0d5c8]">
          Download Template
        </button>

        <button
          onClick={handleExportExcel}
          disabled={filteredArtists.length === 0}
          className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap disabled:opacity-50">
          Export Excel
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
          Upload CSV
        </button>

        <button
          onClick={() => navigate("/artists/add")}
          className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
          + Add Artist
        </button>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* Search & Filter - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Search and Filter Chips - Left Side */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
          {/* Search input */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[250px] lg:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artist..."
              className="w-full border rounded-lg sm:rounded-xl pl-3 sm:pl-4 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
            />
          </div>

          {/* Applied filter chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {cityFilter && (
              <span className="flex items-center gap-1 sm:gap-2 bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap">
                City: {cityFilter}
                <button
                  onClick={() => removeSingleFilter("city")}
                  className="font-bold hover:text-red-600">
                  ×
                </button>
              </span>
            )}

            {stateFilter && (
              <span className="flex items-center gap-1 sm:gap-2 bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap">
                State: {stateFilter}
                <button
                  onClick={() => removeSingleFilter("state")}
                  className="font-bold hover:text-red-600">
                  ×
                </button>
              </span>
            )}

            {artTypeNameFilter && (
              <span className="flex items-center gap-1 sm:gap-2 bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap">
                Art Type: {artTypeNameFilter}
                <button
                  onClick={() => removeSingleFilter("artTypeName")}
                  className="font-bold hover:text-red-600">
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Always on Right Side for ALL devices */}
        <div className="flex gap-2 sm:flex-shrink-0 self-end sm:self-auto">
          {/* Clear filters */}
          <button
            onClick={clearFilters}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filters
          </button>

          {/* Filter button */}
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="flex items-center gap-1 sm:gap-2 border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm filter-btn whitespace-nowrap">
            <PiSlidersHorizontalBold size={14} /> Filter
          </button>
        </div>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* Filter Dropdown - Responsive */}
      <div className="relative">
        {showFilter && (
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 z-30 filter-box">
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">
              Filter Artists
            </h4>

            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="text-[10px] sm:text-xs text-gray-600">
                  City
                </label>
                <input
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-xs text-gray-600">
                  State
                </label>
                <input
                  value={tempState}
                  onChange={(e) => setTempState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-xs text-gray-600">
                  Art Form
                </label>
                <input
                  value={tempArtTypeName}
                  onChange={(e) => setTempArtTypeName(e.target.value)}
                  placeholder="Enter art type"
                  className="w-full border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-3 sm:mt-4">
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
          Loading artists...
        </div>
      )}

      {!loading && (
        <div className="w-full">
          {/* scroll wrapper */}
          <div className="relative overflow-x-auto rounded-xl border border-[#F1EEE7] bg-white">
            <table className="w-full text-xs sm:text-sm min-w-[820px]">
              {/* ================= HEADER ================= */}
              <thead className="bg-white sticky top-0 z-10">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h.key}
                      onClick={() => sortData(h.key)}
                      className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none">
                      <div className="flex items-center gap-2">
                        <span>{h.label}</span>
                        <SortIcon col={h.key} />
                      </div>
                    </th>
                  ))}

                  <th className="px-3 sm:px-4 py-3 text-right w-[60px]" />
                </tr>
              </thead>

              {/* ================= BODY ================= */}
              <tbody>
                {filteredArtists.length === 0 && (
                  <tr>
                    <td
                      colSpan={headers.length + 1}
                      className="py-10 text-center text-gray-500">
                      No artists added
                    </td>
                  </tr>
                )}

                {paginatedArtists.map((a) => (
                  <tr
                    key={a._id}
                    className="border-t hover:bg-gray-50 transition-colors">
                    {/* ===== NAME + IMAGE ===== */}
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        {a.image ? (
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 shrink-0">
                            N/A
                          </div>
                        )}

                        <span className="font-medium text-gray-800 truncate">
                          {a.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-gray-700 truncate">
                      {a.artTypeName}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-gray-700 truncate">
                      {a.city}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-gray-700 truncate">
                      {a.state}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-gray-700 truncate">
                      {a.country}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-gray-700 truncate">
                      {a.email}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-gray-700 truncate">
                      {a.phone}
                    </td>

                    {/* ===== ACTION MENU ===== */}
                    <td className="px-3 sm:px-4 py-3 text-right relative artist-menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === a._id ? null : a._id);
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === a._id && (
                        <div
                          className="absolute right-2 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden artist-menu"
                          onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setViewArtist(a);
                              setOpenMenu(null);
                            }}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-50">
                            View
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/artists/add", { state: a });
                              setOpenMenu(null);
                            }}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-50">
                            Update
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmRemoveArtist(a._id);
                            }}
                            disabled={deleteLoading && deleteId === a._id}
                            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 disabled:opacity-50">
                            {deleteLoading && deleteId === a._id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">

                {/* Prev */}
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                {/* Numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 border rounded ${page === i + 1
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
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>

              </div>
            )}
          </div>
        </div>
      )}

      {/* View Artist Modal - Responsive */}
      {viewArtist && (
        <div
          className="fixed inset-0 backdrop-blur-[0.5px] bg-white/0.8 flex items-center justify-center z-50 px-3 sm:px-4"
          onClick={() => setViewArtist(null)}>
          <div
            className="bg-white w-full max-w-[90%] sm:max-w-lg md:max-w-xl rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden relative shadow-sm"
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewArtist(null)}
              className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-20 bg-black backdrop-blur-md text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center transition-all shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
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

            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72">
              {viewArtist.image ? (
                <>
                  <img
                    src={viewArtist.image}
                    alt={viewArtist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs sm:text-sm">
                  No Image Available
                </div>
              )}
            </div>

            <div className="px-4 sm:px-5 md:px-6 lg:px-8 pb-4 sm:pb-5 md:pb-6 lg:pb-8 -mt-8 sm:-mt-10 md:-mt-12 relative z-10">
              <div className="inline-flex items-center bg-[#83261D] text-white text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-bold px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-md mb-2 sm:mb-3 shadow-md">
                <span className="mr-1">🎨</span>{" "}
                {viewArtist.artTypeName || "Artist"}
              </div>

              <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-none">
                  {viewArtist.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                  <p className="flex items-center text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-0.5 sm:mr-1 text-[#83261D]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Location
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                    <span className="bg-gray-100 text-gray-700 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium border border-gray-200">
                      {viewArtist.city}, {viewArtist.state}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium border border-gray-200">
                      {viewArtist.country}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                  <p className="flex items-center text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-0.5 sm:mr-1 text-[#83261D]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    About the Artist
                  </p>
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm text-justify leading-relaxed italic bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl">
                    "
                    {viewArtist.bio ||
                      "This artist hasn't shared their story yet."}
                    "
                  </p>
                </div>
              </div>
              {/* Contact Details */}
              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold uppercase text-gray-400">
                  Contact Details
                </p>

                <div className="flex flex-col gap-2 text-sm text-gray-700">

                  <div>
                    <span className="font-semibold">📞 Phone: </span>
                    {viewArtist.phone || "Not provided"}
                  </div>

                  <div>
                    <span className="font-semibold">📧 Email: </span>
                    {viewArtist.email || "Not provided"}
                  </div>

                  {viewArtist.website && (
                    <div>
                      <span className="font-semibold">🌐 Website: </span>
                      <a
                        href={viewArtist.website}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        {viewArtist.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!deleteId}
        title="Remove Artist"
        message="This artist will be moved to deleted list. You can recover later."
        confirmText="Remove"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleSoftDelete}
      />

      {/* CSV Preview Modal - Responsive */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3 sm:px-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 w-full max-w-[95%] sm:max-w-2xl md:max-w-3xl">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">
              CSV Preview (First 5 Records)
            </h2>

            <div className="max-h-48 sm:max-h-56 md:max-h-64 overflow-auto border rounded-lg">
              <table className="w-full text-[10px] sm:text-xs md:text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {csvPreview[0] &&
                      Object.keys(csvPreview[0]).map((key) => (
                        <th
                          key={key}
                          className="p-1.5 sm:p-2 text-left whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody>
                  {csvPreview.map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="p-1.5 sm:p-2 whitespace-nowrap">
                          {val as string}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 sm:mt-4">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg order-2 sm:order-1">
                Cancel
              </button>

              <button
                onClick={handleBulkUpload}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#83261D] text-white rounded-lg order-1 sm:order-2">
                Add All Artists
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtistsList;
