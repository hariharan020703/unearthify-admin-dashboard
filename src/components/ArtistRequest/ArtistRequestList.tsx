import { useEffect, useState, useRef } from "react";
import { MoreVertical, X, User, Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { approveArtistRequestApi, getAllArtistRequestsApi, rejectArtistRequestApi } from "../../api/artistRequest";
import { PiSlidersHorizontalBold } from "react-icons/pi";

interface Artist {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    specialization: string[];
    experience: string;
    about: string;
    status: "pending" | "approved" | "rejected";
}

const ArtistRequestsList = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewArtist, setViewArtist] = useState<Artist | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);

    const [statusFilter, setStatusFilter] = useState("");
    const [tempStatus, setTempStatus] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const filteredArtists = artists.filter((a) => {
        const value = search.toLowerCase();

        const matchesSearch =
            a.name.toLowerCase().includes(value) ||
            a.email.toLowerCase().includes(value) ||
            a.phone.toLowerCase().includes(value);

        const matchesStatus = statusFilter
            ? a.status === statusFilter
            : true;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);

    const currentArtists = filteredArtists.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const fetchArtists = async () => {
        try {
            const res = await getAllArtistRequestsApi();
            setArtists(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load artist requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtists();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // APPROVE
    const handleApprove = async (id: string) => {
        try {
            setApprovingId(id);
            await approveArtistRequestApi(id);
            setArtists((prev) =>
                prev.map((a) =>
                    a._id === id ? { ...a, status: "approved" } : a
                )
            );
            toast.success("Artist approved successfully");
            setOpenMenuId(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to approve artist");
        } finally {
            setApprovingId(null);
        }
    };

    // REJECT
    const handleReject = async (id: string) => {
        try {
            setRejectingId(id);
            await rejectArtistRequestApi(id);
            setArtists((prev) =>
                prev.map((a) =>
                    a._id === id ? { ...a, status: "rejected" } : a
                )
            );
            toast.success("Artist rejected");
            setOpenMenuId(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to reject artist");
        } finally {
            setRejectingId(null);
        }
    };

    if (loading) {
        return (
            <div className="relative bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 text-sm sm:text-base">Loading...</p>
                </div>
            </div>
        );
    }

    const applyFilters = () => {
        setStatusFilter(tempStatus);
        setShowFilter(false);
    };

    const clearFilters = () => {
        setStatusFilter("");
        setTempStatus("");
        setShowFilter(false);
    };

    return (
        <div className="relative bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow overflow-x-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">

                {/* Search */}
                <div className="flex flex-col w-full lg:flex-1">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone..."
                        className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
                    />

                    {/* Filter chip */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {statusFilter && (
                            <span className="bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                Status: {statusFilter}
                                <button onClick={() => setStatusFilter("")}>×</button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC]"
                    >
                        Clear Filters
                    </button>

                    <button
                        onClick={() => setShowFilter((p) => !p)}
                        className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm filter-btn"
                    >
                        <PiSlidersHorizontalBold size={14} /> Filter
                    </button>
                </div>

                <div className="relative">
                    {showFilter && (
                        <div className="absolute right-0 mt-4 w-72 bg-white border rounded-xl shadow p-4 z-30 filter-box">
                            <h4 className="text-sm font-medium mb-3">Filter Artists</h4>

                            <select
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="px-3 py-1 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={applyFilters}
                                    className="px-3 py-1 bg-[#83261D] text-white rounded"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-2 sm:my-3" />
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Artist Name</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Email</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Phone</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Location</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Experience</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Specialization</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Status</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {artists.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500 text-sm">
                                    No pending artist requests found
                                </td>
                            </tr>
                        ) : (
                            currentArtists.map((artist) => (
                                <tr key={artist._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800 font-medium">
                                        {artist.name || "-"}
                                    </td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        {artist.email || "-"}
                                    </td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        {artist.phone || "-"}
                                    </td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        {artist.city && artist.state ? `${artist.city}, ${artist.state}` : artist.city || artist.state || "-"}
                                    </td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        {artist.experience || "-"}
                                    </td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        <div className="flex flex-wrap gap-1">
                                            {artist.specialization && artist.specialization.length > 0 ? (
                                                artist.specialization.slice(0, 2).map((spec, idx) => (
                                                    <span key={idx} className="inline-flex px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                                        {spec}
                                                    </span>
                                                ))
                                            ) : (
                                                "-"
                                            )}
                                            {artist.specialization && artist.specialization.length > 2 && (
                                                <span className="inline-flex px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                                    +{artist.specialization.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        {artist.status === "pending" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                                                Pending
                                            </span>
                                        ) : artist.status === "approved" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                                                Rejected
                                            </span>
                                        )}
                                    </td>

                                    {/* Three-dot Actions */}
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        <div className="relative" ref={openMenuId === artist._id ? menuRef : null}>
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === artist._id ? null : artist._id)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>

                                            {/* Dropdown */}
                                            {openMenuId === artist._id && (
                                                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                                                    {/* View */}
                                                    <button
                                                        onClick={() => {
                                                            setViewArtist(artist);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm transition-colors"
                                                    >
                                                        View
                                                    </button>

                                                    {/* Approve */}
                                                    <button
                                                        onClick={() => handleApprove(artist._id)}
                                                        disabled={approvingId === artist._id}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm transition-colors"
                                                    >
                                                        {approvingId === artist._id ? "Approving..." : "Approve"}
                                                    </button>

                                                    {/* Reject */}
                                                    <button
                                                        onClick={() => handleReject(artist._id)}
                                                        disabled={rejectingId === artist._id}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm transition-colors"
                                                    >
                                                        {rejectingId === artist._id ? "Rejecting..." : "Reject"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">

                        {/* Prev */}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1
                                    ? "bg-[#83261D] text-white border-[#83261D]"
                                    : "bg-gray-200"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewArtist && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setViewArtist(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header with Gradient */}
                        <div className="sticky top-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] flex items-center justify-between p-5 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <User size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Artist Request Details</h2>
                                    <p className="text-xs text-white/70 mt-0.5">Review artist information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewArtist(null)}
                                className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 hover:rotate-90"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex justify-center">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${viewArtist.status === "pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                                    viewArtist.status === "approved" ? "bg-green-100 text-green-700 border border-green-200" :
                                        "bg-red-100 text-red-700 border border-red-200"
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${viewArtist.status === "pending" ? "bg-yellow-500" :
                                        viewArtist.status === "approved" ? "bg-green-500" :
                                            "bg-red-500"
                                        }`}></div>
                                    Status: {viewArtist.status.charAt(0).toUpperCase() + viewArtist.status.slice(1)}
                                </div>
                            </div>

                            {/* Personal Information Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Information</p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100">
                                    <DetailRow icon={<User size={14} />} label="Full Name" value={viewArtist.name} />
                                    <DetailRow icon={<Mail size={14} />} label="Email Address" value={viewArtist.email} />
                                    <DetailRow icon={<Phone size={14} />} label="Phone Number" value={viewArtist.phone} />
                                    <DetailRow icon={<MapPin size={14} />} label="Location" value={`${viewArtist.city || ""} ${viewArtist.state || ""}`.trim() || "-"} />
                                </div>
                            </div>

                            {/* Professional Information Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Professional Information</p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100">
                                    <DetailRow icon={<Briefcase size={14} />} label="Experience" value={viewArtist.experience} />
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#83261D] mt-0.5 shrink-0"><BookOpen size={14} /></span>
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="text-xs text-gray-500 font-medium min-w-[80px]">Specialization:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {viewArtist.specialization && viewArtist.specialization.length > 0 ? (
                                                    viewArtist.specialization.map((spec, idx) => (
                                                        <span key={idx} className="inline-flex px-2.5 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-[#83261D] rounded-lg text-xs font-medium border border-[#83261D]/20">
                                                            {spec}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-800">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            {viewArtist.about && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About the Artist</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {viewArtist.about}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer with Action Buttons */}
                        <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-5 border-t border-gray-100">
                            <button
                                onClick={() => setViewArtist(null)}
                                className="px-6 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleApprove(viewArtist._id);
                                    setViewArtist(null);
                                }}
                                disabled={approvingId === viewArtist._id}
                                className="px-6 py-2.5 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {approvingId === viewArtist._id ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        Approve
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    handleReject(viewArtist._id);
                                    setViewArtist(null);
                                }}
                                disabled={rejectingId === viewArtist._id}
                                className="px-6 py-2.5 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {rejectingId === viewArtist._id ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        Reject
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable detail row for the modal
const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
        <div className="flex items-center gap-2">
            <span className="text-[#83261D] shrink-0">{icon}</span>
            <span className="text-xs text-gray-500 font-medium min-w-[80px]">{label}:</span>
        </div>
        <span className="text-xs text-gray-800 font-medium break-words sm:ml-0 ml-6">{value || "-"}</span>
    </div>
);

export default ArtistRequestsList;