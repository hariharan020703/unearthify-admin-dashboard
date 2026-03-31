/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { createArtDetailApi, updateArtDetailApi } from "../../api/artDetailApi";
import api from "../../api/artDetailApi";
import { useLocation } from "react-router";

type ArtForm = {
  _id: string;
  name: string;
};

type Category = {
  _id: string;
  name: string;
  artTypes: ArtForm[];
};

export default function AddArtDetail() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [artForms, setArtForms] = useState<ArtForm[]>([]);

  const [form, setForm] = useState({
    categoryId: "",
    artTypeId: "",
    language: "",
    state: "",
    materials: "",
    region: "",
    famousArtist: "",
    performers: "",
    typicalLength: "",
    origin: "",
    website: "",
  });

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const editingItem = location.state as any;
  const isEdit = Boolean(editingItem);

  /* ===== LOAD CATEGORIES ===== */
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await api.get("/categories");
        setCategories(res.data.data);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  /* ===== CATEGORY CHANGE ===== */
  function handleCategoryChange(categoryId: string) {
    const selected = categories.find((c) => c._id === categoryId);

    setForm({ ...form, categoryId, artTypeId: "" });
    setArtForms(selected ? selected.artTypes : []);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Edit
  useEffect(() => {
    if (isEdit) {
      setForm({
        categoryId: editingItem.category._id,
        artTypeId: editingItem.artType._id,
        language: editingItem.language || "",
        state: editingItem.state || "",
        materials: editingItem.materials || "",
        region: editingItem.region || "",
        famousArtist: editingItem.famousArtist || "",
        performers: editingItem.contemporaryPerformers || "",
        typicalLength: editingItem.typicalLength || "",
        origin: editingItem.origin || "",
        website: editingItem.websiteLink || "",
      });

      const selected = categories.find(
        (c) => c._id === editingItem.category._id,
      );
      setArtForms(selected ? selected.artTypes : []);
    }
  }, [isEdit, editingItem, categories]);

  /* ===== SUBMIT ===== */
  async function handleSubmit() {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);

      const payload = {
        categoryId: form.categoryId,
        artTypeId: form.artTypeId,
        language: form.language,
        state: form.state,
        materials: form.materials,
        region: form.region,
        famousArtist: form.famousArtist,
        contemporaryPerformers: form.performers,
        typicalLength: form.typicalLength,
        origin: form.origin,
        websiteLink: form.website,
      };

      if (isEdit) {
        await updateArtDetailApi(editingItem._id, payload);
        toast.success("Updated successfully");
      } else {
        await createArtDetailApi(payload);
        toast.success("Created successfully");
      }

      navigate("/art-details");
    } catch {
      toast.error(isEdit ? "Update failed" : "Create failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Basic Information */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-700">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* CATEGORY */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            {loadingCategories && (
              <p className="text-xs sm:text-sm text-gray-400">Loading categories...</p>
            )}

            <select
              value={form.categoryId}
              disabled={loadingCategories}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none bg-white">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ART TYPE */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">
              Art Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.artTypeId}
              onChange={(e) => setForm({ ...form, artTypeId: e.target.value })}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none bg-white disabled:bg-gray-100"
              disabled={!form.categoryId}>
              <option value="">Select art type</option>
              {artForms.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-2 sm:space-y-3">
        <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-700">
          Classification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Language */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Language</label>
            <input
              name="language"
              placeholder="Eg: Malayalam"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.language}
              onChange={handleChange}
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">State</label>
            <input
              name="state"
              placeholder="Eg: Kerala"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.state}
              onChange={handleChange}
            />
          </div>

          {/* Materials */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Materials</label>
            <input
              name="materials"
              placeholder="Eg: Bamboo, natural pigments, fabrics"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.materials}
              onChange={handleChange}
            />
          </div>

          {/* Region */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Region</label>
            <input
              name="region"
              placeholder="Eg: South Region"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.region}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Artists & Performance */}
      <div className="space-y-2 sm:space-y-3">
        <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-700">
          Artists & Performance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Famous Artist */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Famous Artist</label>
            <input
              name="famousArtist"
              placeholder="Eg: Kalamandalam Gopi"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.famousArtist}
              onChange={handleChange}
            />
          </div>

          {/* Contemporary Performers */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Contemporary Performers</label>
            <input
              name="performers"
              placeholder="Eg: Modern Kathakali artists"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.performers}
              onChange={handleChange}
            />
          </div>

          {/* Typical Length */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Typical Length</label>
            <input
              name="typicalLength"
              placeholder="Eg: 2 to 4 hours"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.typicalLength}
              onChange={handleChange}
            />
          </div>

          {/* Origin */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium">Origin</label>
            <input
              name="origin"
              placeholder="Eg: Kerala temples and royal courts"
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              value={form.origin}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="space-y-2 sm:space-y-3">
        <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-700">
          Reference
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium">Website Link</label>
          <input
            name="website"
            placeholder="Eg: https://kathakali.org"
            className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
            value={form.website}
            onChange={handleChange}
          />
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
            Include https:// or http://
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
        <button
          onClick={() => navigate("/art-details")}
          className="order-2 sm:order-1 px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg text-xs sm:text-sm hover:bg-gray-600 transition-colors">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`order-1 sm:order-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm transition ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed opacity-80"
              : "bg-[#83261D] hover:bg-[#6a1e17]"
          }`}>
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Update Art Detail"
              : "Save Art Detail"}
        </button>
      </div>
    </div>
  );
}