/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { getAllEventsApi, softDeleteEventApi } from "../../api/eventApi";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  categories: string;
  image: string;
};

type SortKey = "title" | "date" | "location" | "categories";

export default function EventList() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventCategories, setEventCategories] = useState<string[]>([]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [tempDate, setTempDate] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tempCategory, setTempCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  /* ---------- LOAD ---------- */

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllEventsApi();
      setEvents(res.data.data);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadEventCategories = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/categories`,
      );
      const data = await res.json();

      const names = data.data.map((c: any) => c.name);
      setEventCategories(names);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadEventCategories();
  }, []);

  useEffect(() => {
    loadEvents();

    const refresh = () => loadEvents();

    window.addEventListener("events-updated", refresh);

    return () => window.removeEventListener("events-updated", refresh);
  }, []);

  /* ---------- OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // close menu
      if (!target.closest(".event-menu")) setOpenMenu(null);

      // close filter
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setShowFilter(false);
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

    const sorted = [...events].sort((a: any, b: any) => {
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

    setEvents(sorted);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await softDeleteEventApi(id);
      toast.success("Event deleted");
      loadEvents();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- FILTER + SEARCH ---------- */
  const filtered = events.filter((e) => {
    const v = search.toLowerCase();

    const matchesSearch =
      e.title.toLowerCase().includes(v) ||
      e.description.toLowerCase().includes(v) ||
      e.location.toLowerCase().includes(v) ||
      e.date.toLowerCase().includes(v);

    const matchesDate = dateFilter
      ? new Date(e.date).toISOString().slice(0, 10) === dateFilter
      : true;

    const matchesLocation = locationFilter
      ? e.location.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesCategory = categoryFilter
      ? e.categories?.trim().toLowerCase() ===
      categoryFilter.trim().toLowerCase()
      : true;

    return matchesSearch && matchesDate && matchesLocation && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = filtered.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, dateFilter, locationFilter, categoryFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [filtered, totalPages]);

  /* ---------- FILTER ACTIONS ---------- */
  const applyFilters = () => {
    setDateFilter(tempDate);
    setLocationFilter(tempLocation);
    setCategoryFilter(tempCategory);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setDateFilter("");
    setLocationFilter("");
    setTempDate("");
    setTempLocation("");
    setCategoryFilter("");
    setTempCategory("");
    setShowFilter(false);
  };

  /* ---------- SORT ICON ---------- */
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: "categories", label: "Category" },
    { key: "title", label: "Event" },
    { key: "date", label: "Date" },
    { key: "location", label: "Location" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-end mb-3 sm:mb-4">
        <button
          onClick={() => navigate("/events/add")}
          className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
          + Add Event
        </button>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Left Section - Search and Filter Chips */}
        <div className="flex flex-col w-full lg:flex-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 border rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            {dateFilter && (
              <span className="bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs flex items-center gap-1">
                Date: {dateFilter}
                <button onClick={() => setDateFilter("")} className="font-bold hover:text-red-600">×</button>
              </span>
            )}

            {locationFilter && (
              <span className="bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs flex items-center gap-1">
                Location: {locationFilter}
                <button onClick={() => setLocationFilter("")} className="font-bold hover:text-red-600">×</button>
              </span>
            )}

            {categoryFilter && (
              <span className="bg-[#F8E7DC] text-[#83261D] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs flex items-center gap-1">
                Category: {categoryFilter}
                <button onClick={() => setCategoryFilter("")} className="font-bold hover:text-red-600">×</button>
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
            onClick={() => {
              setTempDate(dateFilter);
              setTempLocation(locationFilter);
              setTempCategory(categoryFilter);
              setShowFilter((p) => !p);
            }}
            className="flex items-center gap-1 sm:gap-2 border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm filter-btn whitespace-nowrap">
            <PiSlidersHorizontalBold size={14} /> Filter
          </button>
        </div>
      </div>

      <hr className="my-2 sm:my-3" />

      {/* FILTER BOX */}
      <div className="relative">
        {showFilter && (
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-3 sm:p-4 z-30 filter-box">
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Filter Events</h4>

            <div className="space-y-2 sm:space-y-3">
              {/* Category Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium">Category</label>
                <select
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mt-1">
                  <option value="">All Categories</option>
                  {eventCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mt-1"
                />
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium">Location</label>
                <input
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="Eg: Kerala"
                  className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm mt-1"
                />
              </div>
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
          Loading events...
        </div>
      )}

      {!loading && (
        /* Table - Responsive with horizontal scroll */
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm border border-[#F1EEE7] min-w-[900px] lg:min-w-full">
            <thead>
              <tr>
                <th className="p-2 sm:p-3 text-left">Image</th>

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
              {paginatedEvents.map((ev) => (
                <tr key={ev._id} className="border-t">
                  {/* Image */}
                  <td className="p-2 sm:p-3">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded object-cover border"
                    />
                  </td>

                  {/* Category */}
                  <td className="p-2 sm:p-3 font-medium text-[#83261D] text-xs sm:text-sm">
                    {ev.categories}
                  </td>

                  {/* Title & Description */}
                  <td className="p-2 sm:p-3">
                    <p className="font-medium text-xs sm:text-sm">{ev.title}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[240px]">
                      {ev.description}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">
                    {formatDate(ev.date)}
                  </td>

                  {/* Location */}
                  <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[120px] truncate">
                    {ev.location}
                  </td>

                  {/* Actions Menu */}
                  <td className="p-2 sm:p-3 text-right relative event-menu">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === ev._id ? null : ev._id)
                      }>
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === ev._id && (
                      <div className="absolute right-0 sm:right-2 top-8 sm:top-10 w-24 sm:w-28 md:w-32 bg-white border rounded-lg shadow z-20 text-xs sm:text-sm">
                        <button
                          onClick={() => {
                            setViewEvent(ev);
                            setOpenMenu(null);
                          }}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                          View
                        </button>

                        <button
                          onClick={() => navigate("/events/add", { state: ev })}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-gray-100">
                          Update
                        </button>

                        <button
                          disabled={deletingId === ev._id}
                          onClick={() => handleDelete(ev._id)}
                          className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50">
                          {deletingId === ev._id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 sm:p-6 text-center text-gray-400 text-xs sm:text-sm">
                    No events found
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

              {/* Page Numbers */}
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
      )}

      {/* View Event Modal - Responsive */}
      {viewEvent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setViewEvent(null)}>
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp relative">

            {/* Close Button */}
            <button
              onClick={() => setViewEvent(null)}
              className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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

            {/* Image Section */}
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
              {viewEvent.image ? (
                <>
                  <img
                    src={viewEvent.image}
                    alt={viewEvent.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Badge on Image */}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      {viewEvent.categories}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 opacity-30 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Event Preview
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="px-5 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10 -mt-8 relative z-10">
              {/* Title Card */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                  {viewEvent.title}
                </h2>
              </div>

              {/* Date and Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Date Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-lg shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</p>
                      <p className="text-sm sm:text-base font-bold text-gray-800">
                        {formatDate(viewEvent.date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-lg shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</p>
                      <p className="text-sm sm:text-base font-bold text-gray-800 break-words">
                        {viewEvent.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About the Event</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {viewEvent.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bottom-0 bg-white flex justify-end p-5 border-t border-gray-100">
              <button
                onClick={() => setViewEvent(null)}
                className="px-6 py-2.5 text-sm bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}