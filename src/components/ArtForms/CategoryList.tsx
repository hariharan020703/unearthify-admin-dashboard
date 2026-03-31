/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MoreVertical } from "lucide-react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import {
  deleteCategoryApi,
  getAllCategoriesApi,
  deleteArtTypeApi,
} from "../../api/artCategoryApi";
import toast from "react-hot-toast";

type ArtType = {
  _id?: string;
  name: string;
  description: string;
  image: string;
};

type Category = {
  _id: string;
  name: string;
  description: string;
  image: string;
  artTypes: ArtType[];
};

type ViewArt = ArtType & { category: Category };

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewArt, setViewArt] = useState<ViewArt | null>(null);

  const [sortKey, setSortKey] = useState<"name" | "count" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filterOpen, setFilterOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [deletingArtTypeId, setDeletingArtTypeId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const navigate = useNavigate();

  /* ---------- LOAD ---------- */
  async function load() {
    try {
      setLoading(true);
      const res = await getAllCategoriesApi();
      setCategories(res.data.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------- OUTSIDE CLICK FILTER ---------- */
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setFilterOpen(false);
      }
    }

    if (filterOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  /* ---------- OUTSIDE CLICK MENU ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".cat-menu")) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearFilters = () => {
    setAppliedCategory("");
    setTempCategory("");
    setFilterOpen(false);
  };

  /* ---------- FILTER + SORT ---------- */
  const filteredCategories = categories
    .filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = appliedCategory
        ? cat.name === appliedCategory
        : true;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA: any;
      let valB: any;

      if (sortKey === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (sortKey === "count") {
        valA = a.artTypes.length;
        valB = b.artTypes.length;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  async function handleDelete(id: string) {
    try {
      setDeletingCategoryId(id);
      await deleteCategoryApi(id);
      toast.success("Category deleted");
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingCategoryId(null);
    }
  }

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

const start = (page - 1) * ITEMS_PER_PAGE;
const paginatedCategories = filteredCategories.slice(start, start + ITEMS_PER_PAGE);

useEffect(() => {
  setPage(1);
}, [search, appliedCategory]);

useEffect(() => {
  if (page > totalPages) {
    setPage(totalPages || 1);
  }
}, [filteredCategories, totalPages]);

  async function handleDeleteType() {
    try {
      setDeletingArtTypeId(viewArt!._id as string);
      await deleteArtTypeApi(viewArt!.category._id, viewArt!._id as string);
      toast.success("Art type deleted");
      setViewArt(null);
      await load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingArtTypeId(null);
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-end mb-3 sm:mb-4">
        <button
          onClick={() => navigate("/categories/add")}
          className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
          + Add Categories
        </button>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Left Section - Search and Filter Chips */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full sm:w-72 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
          />

          {/* Applied Category Filter Chip */}
          {appliedCategory && (
            <div className="flex items-center gap-2 bg-[#F8E7DC] text-[#83261D] px-3 py-1.5 rounded-full text-xs sm:text-sm border border-red-200 w-fit">
              <span>Category: {appliedCategory}</span>
              <button
                onClick={() => {
                  setAppliedCategory("");
                  setTempCategory("");
                }}
                className="font-bold hover:text-black">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2 relative self-end lg:self-auto">
          {/* Clear Filter Button */}
          <button
            onClick={clearFilters}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filter
          </button>

          {/* Filter Button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1 sm:gap-2 border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm filter-btn whitespace-nowrap">
            <PiSlidersHorizontalBold size={14} />
            Filter
          </button>

          {/* Filter Dropdown */}
          {filterOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded-xl shadow-xl p-4 z-30 filter-box">
              <p className="text-sm font-semibold mb-2">Filter by Category</p>

              <select
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4 text-sm">
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 border rounded-lg text-sm">
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setAppliedCategory(tempCategory);
                    setFilterOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#83261D] text-white rounded-lg text-sm">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="my-2 sm:my-3" />

      {loading && (
        <div className="py-8 sm:py-12 text-center text-gray-500 font-medium text-sm sm:text-base">
          Loading categories...
        </div>
      )}

      {!loading && (
        /* Table - Responsive with horizontal scroll */
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm border border-[#F1EEE7] min-w-[900px] lg:min-w-full">
            <thead className="bg-white">
              <tr>
                <th className="p-2 sm:p-3 text-left">Image</th>

                <th
                  className="p-2 sm:p-3 text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortKey("name");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <div className="flex flex-col leading-none">
                      <TiArrowSortedUp
                        size={14}
                        className={
                          sortKey === "name" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                      <TiArrowSortedDown
                        size={14}
                        className={
                          sortKey === "name" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </th>

                <th className="p-2 sm:p-3 text-left">Description</th>

                <th
                  className="p-2 sm:p-3 text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortKey("count");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}>
                  <div className="flex items-center gap-1">
                    <span>Art Types</span>
                    <div className="flex flex-col leading-none">
                      <TiArrowSortedUp
                        size={14}
                        className={
                          sortKey === "count" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                      <TiArrowSortedDown
                        size={14}
                        className={
                          sortKey === "count" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </th>

                <th className="p-2 sm:p-3 text-right"></th>
              </tr>
            </thead>

            <tbody>
              {paginatedCategories.map((cat) => {
                return (
                  <tr key={cat._id} className="border-t align-top">
                    <td className="p-2 sm:p-3">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover border"
                      />
                    </td>

                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">
                      {cat.name}
                    </td>

                    <td className="p-2 sm:p-3 text-gray-600 text-justify text-xs sm:text-sm max-w-xs">
                      <p className="line-clamp-2">{cat.description}</p>
                    </td>

                    <td className="p-2 sm:p-3 text-gray-700">
                      {cat.artTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {cat.artTypes.map((a) => (
                            <span
                              key={a._id}
                              onClick={() => setViewArt({ ...a, category: cat })}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded text-[10px] sm:text-xs cursor-pointer hover:bg-gray-200 whitespace-nowrap">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px] sm:text-xs">
                          No art types
                        </span>
                      )}
                    </td>

                    <td className="p-2 sm:p-3 text-right relative cat-menu">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === cat._id ? null : cat._id)
                        }>
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === cat._id && (
                        <div className="absolute right-2 sm:right-3 top-8 sm:top-9 w-24 sm:w-28 bg-white border rounded-lg shadow z-20 text-xs sm:text-sm">
                          <button
                            onClick={() =>
                              navigate("/categories/add", { state: cat })
                            }
                            className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                            Update
                          </button>

                          <button
                            disabled={deletingCategoryId === cat._id}
                            onClick={() => handleDelete(cat._id)}
                            className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50">
                            {deletingCategoryId === cat._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400 text-xs sm:text-sm">
                    No categories found
                  </td>
                </tr>
              )}
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
        className={`px-3 py-1 border rounded ${
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
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>

  </div>
)}
        </div>
      )}

      {/* View Art Type Modal - Responsive */}
      {viewArt && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setViewArt(null)}>
          <div
            className="bg-white w-full max-w-[95%] sm:max-w-xl max-h-[90vh] rounded-xl sm:rounded-2xl md:rounded-[32px] overflow-y-auto relative shadow-xl border border-white/20 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}>

            {/* Close Button */}
            <button
              onClick={() => setViewArt(null)}
              className="absolute top-3 sm:top-5 right-3 sm:right-5 z-50 bg-black hover:bg-[#83261D] backdrop-blur-md text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300 shadow-xl group border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform"
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

            {/* Image Section */}
            <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-gray-100">
              <img
                src={viewArt.image}
                alt={viewArt.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
              />
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-8 pt-4 sm:pt-6 md:pt-8">
              {/* Label */}
              <span className="inline-block mb-1 sm:mb-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#83261D] uppercase">
                Art Type
              </span>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold leading-none mb-3 sm:mb-4 md:mb-6">
                {viewArt.name}
              </h2>

              {/* Description Label */}
              <span className="inline-block mb-1 sm:mb-2 text-sm sm:text-base md:text-xl font-bold tracking-widest text-[#83261D] uppercase">
                Type Description
              </span>

              {/* Description Text */}
              <div className="relative">
                <p className="text-xs sm:text-sm md:text-base font-normal leading-relaxed text-justify text-gray-800">
                  {viewArt.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 sm:gap-3 m-4 sm:m-6 md:m-8">
              <button
                onClick={() =>
                  navigate("/categories/add", {
                    state: { mode: "editArtType", data: viewArt },
                  })
                }
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#83261D] text-white rounded-lg text-xs sm:text-sm">
                Update
              </button>
              <button
                disabled={deletingArtTypeId === viewArt._id}
                onClick={() => handleDeleteType()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-red-600 text-xs sm:text-sm disabled:opacity-50">
                {deletingArtTypeId === viewArt._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}