/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { getContactRequestsApi, deleteContactRequestApi } from "../../api/userContactApi";
import { MoreVertical, X, User, Phone, Mail, Palette, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { PiSlidersHorizontalBold } from "react-icons/pi";

const ContactRequestsList = () => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewContact, setViewContact] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [artTypeFilter, setArtTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [tempArtType, setTempArtType] = useState("");
    const [tempCategory, setTempCategory] = useState("");

    const [showFilter, setShowFilter] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const getCategoryName = (category: any) =>
        typeof category === "object" ? category?.name : category || "-";

    const artTypeOptions = [
        ...new Set(
            contacts
                .map((c) => c.artTypeName)
                .filter((name) => name && name !== "-")
        ),
    ];

    const categoryOptions = [
        ...new Set(
            contacts
                .map((c) => getCategoryName(c.category))
                .filter((name) => name && name !== "-")
        ),
    ];

    const filteredContacts = contacts.filter((c) => {
        const matchesSearch =
            c.artistName?.toLowerCase().includes(search.toLowerCase()) ||
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.toLowerCase().includes(search.toLowerCase());

        const matchesArtType =
            !artTypeFilter || c.artTypeName === artTypeFilter;

        const matchesCategory =
            !categoryFilter ||
            getCategoryName(c.category) === categoryFilter;

        return matchesSearch && matchesArtType && matchesCategory;
    });

    const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, artTypeFilter, categoryFilter]);

    useEffect(() => {
        fetchContacts();
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


    const fetchContacts = async () => {
        try {
            const res = await getContactRequestsApi();
            setContacts(res.data.data || res.data);
        } catch (err) {
            console.error("Error fetching contacts", err);
            toast.error("Failed to load contact requests");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await deleteContactRequestApi(id);
            setContacts((prev) => prev.filter((c) => c._id !== id));
            toast.success("Contact request deleted");
            setOpenMenuId(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete contact request");
        } finally {
            setDeletingId(null);
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

    return (
        <div className="relative bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow overflow-x-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">

                {/* LEFT SIDE */}
                <div className="flex flex-col w-full lg:flex-1">

                    {/* Search */}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone..."
                        className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
                    />

                    <div className="flex gap-2 mt-2 flex-wrap">

                        {artTypeFilter && (
                            <span className="bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                Art Type: {artTypeFilter}
                                <button onClick={() => setArtTypeFilter("")}>×</button>
                            </span>
                        )}

                        {categoryFilter && (
                            <span className="bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                Category: {categoryFilter}
                                <button onClick={() => setCategoryFilter("")}>×</button>
                            </span>
                        )}

                    </div>

                </div>

                {/* RIGHT SIDE BUTTONS */}
                <div className="flex gap-2">

                    <button
                        onClick={() => {
                            setSearch("");
                            setArtTypeFilter("");
                            setCategoryFilter("");
                        }}
                        className="px-3 py-2 text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC]"
                    >
                        Clear Filters
                    </button>

                    <button
                        onClick={() => setShowFilter((p) => !p)}
                        className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
                    >
                        <PiSlidersHorizontalBold size={14} /> Filter
                    </button>

                </div>

                {/* FILTER DROPDOWN */}
                <div className="relative">

                    {showFilter && (
                        <div className="absolute right-0 mt-4 w-72 bg-white border rounded-xl shadow p-4 z-30">

                            <h4 className="text-sm font-medium mb-3">Filter Contacts</h4>

                            {/* ART TYPE */}
                            <select
                                value={tempArtType}
                                onChange={(e) => setTempArtType(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                            >
                                <option value="">All Art Types</option>
                                {artTypeOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {/* CATEGORY */}
                            <select
                                value={tempCategory}
                                onChange={(e) => setTempCategory(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All Categories</option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2 mt-4">

                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="px-3 py-1 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        setArtTypeFilter(tempArtType);
                                        setCategoryFilter(tempCategory);
                                        setShowFilter(false);
                                    }}
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
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Category</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Art Type</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">User Name</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Phone</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Email</th>
                            <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentContacts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500 text-sm">
                                    {contacts.length === 0 ? "No contact requests found" : "No results match your filters"}
                                </td>
                            </tr>
                        ) : (
                            currentContacts.map((c) => (
                                <tr key={c._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{c.artistName || "-"}</td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{getCategoryName(c.category)}</td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{c.artTypeName || "-"}</td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{c.name || "-"}</td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{c.phone || "-"}</td>
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{c.email || "-"}</td>

                                    {/* Three-dot Actions */}
                                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">
                                        <div className="relative" ref={openMenuId === c._id ? menuRef : null}>
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === c._id ? null : c._id)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>

                                            {/* Dropdown */}
                                            {openMenuId === c._id && (
                                                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                                                    {/* View */}
                                                    <button
                                                        onClick={() => {
                                                            setViewContact(c);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        View
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(c._id)}
                                                        disabled={deletingId === c._id}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        {deletingId === c._id ? "Deleting..." : "Delete"}
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

                        {/* Numbers */}
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
            {viewContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 sm:p-5 border-b">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Contact Request Details</h2>
                            <button
                                onClick={() => setViewContact(null)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-5 space-y-4">

                            {/* Artist Info */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Artist Info</p>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <DetailRow icon={<User size={14} />} label="Artist Name" value={viewContact.artistName} />
                                    <DetailRow icon={<Palette size={14} />} label="Category" value={getCategoryName(viewContact.category)} />
                                    <DetailRow icon={<Palette size={14} />} label="Art Type" value={viewContact.artTypeName} />
                                </div>
                            </div>

                            {/* User Info */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">User Info</p>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <DetailRow icon={<User size={14} />} label="Name" value={viewContact.name} />
                                    <DetailRow icon={<Phone size={14} />} label="Phone" value={viewContact.phone} />
                                    <DetailRow icon={<Mail size={14} />} label="Email" value={viewContact.email} />
                                </div>
                            </div>

                            {/* Message */}
                            {viewContact.message && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                                    <div className="bg-gray-50 rounded-lg p-3 flex gap-2">
                                        <MessageSquare size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-700">{viewContact.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 p-4 sm:p-5 border-t">
                            <button
                                onClick={() => setViewContact(null)}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
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
    <div className="flex items-start gap-2">
        <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
        <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium min-w-[80px]">{label}:</span>
            <span className="text-xs text-gray-800">{value || "-"}</span>
        </div>
    </div>
);

export default ContactRequestsList;