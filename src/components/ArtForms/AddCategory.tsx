/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, ChangeEvent } from "react";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import {
  getAllCategoriesApi,
  updateArtTypeApi,
  addArtTypeApi,
  updateCategoryApi,
} from "../../api/artCategoryApi";
import api from "../../api/axios";

type Category = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

type ArtType = {
  id: string;
  name: string;
  description: string;
  image: File | null;
  existingImage?: string;
};

export default function AddCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryInput, setCategoryInput] = useState("");

  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImageError, setCategoryImageError] = useState("");
  const categoryFileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state as any;
  const isEditArtType = editData?.mode === "editArtType";
  const isEditCategory = !!editData && !isEditArtType;

  const [artTypes, setArtTypes] = useState<ArtType[]>([
    { id: Date.now().toString(), name: "", description: "", image: null },
  ]);

  /* ---------- LOAD ---------- */

  useEffect(() => {
    async function load() {
      try {
        setSubmitting(true);
        const res = await getAllCategoriesApi();
        setCategories(res.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed");
      } finally {
        setSubmitting(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (categoryImage)
        URL.revokeObjectURL(URL.createObjectURL(categoryImage));
      artTypes.forEach((a) => {
        if (a.image) URL.revokeObjectURL(URL.createObjectURL(a.image));
      });
    };
  }, [categoryImage, artTypes]);

  const categoryOptions = categories.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  useEffect(() => {
    if (!editData) return;

    // ART TYPE EDIT
    if (isEditArtType) {
      const { data } = editData;

      setSelectedCategory({
        value: data.category._id,
        label: data.category.name,
      });

      setCategoryDescription(data.category.description);

      setArtTypes([
        {
          id: data._id,
          name: data.name,
          description: data.description,
          image: null,
          existingImage: data.image,
        },
      ]);
    }

    // CATEGORY EDIT
    if (isEditCategory) {
      setSelectedCategory({
        value: editData._id,
        label: editData.name,
      });

      setCategoryDescription(editData.description);
    }
  }, [editData, isEditArtType, isEditCategory]);

  /* ---------- CATEGORY SELECT ---------- */
  function handleCategorySelect(option: any) {
    if (!option) {
      setSelectedCategory(null);
      setCategoryDescription("");
      setCategoryImage(null);
      return;
    }

    // NEW CATEGORY
    if (option.__isNew__) {
      const exists = categories.find(
        (c) => c.name.toLowerCase() === option.label.toLowerCase(),
      );

      if (exists) {
        toast.error("Category already exists");
        setSelectedCategory(null);
        return;
      }

      setSelectedCategory({ label: option.label, isNew: true });
      setCategoryDescription("");
      setCategoryImage(null);
    }

    // EXISTING CATEGORY
    else {
      const found = categories.find((c) => c._id === option.value);
      if (!found) return;

      setSelectedCategory({ value: found._id, label: found.name });
      setCategoryDescription(found.description);
      setArtTypes([
        { id: Date.now().toString(), name: "", description: "", image: null },
      ]);

      setCategoryImageError("");
    }
  }

  /* ---------- CATEGORY IMAGE ---------- */
  function handleCategoryImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setCategoryImageError("Image must be less than 2MB");
      return;
    }

    setCategoryImage(file);
    setCategoryImageError("");
  }

  function removeCategoryImage() {
    setCategoryImage(null);
    setCategoryImageError("");
    if (categoryFileRef.current) categoryFileRef.current.value = "";
  }

  /* ---------- ART TYPES ---------- */
  function updateArtType(id: string, key: keyof ArtType, value: any) {
    setArtTypes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
    );
  }

  function handleArtImage(id: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    updateArtType(id, "image", file);
  }

  function addArtType() {
    setArtTypes((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", description: "", image: null },
    ]);
  }

  function removeArtType(id: string) {
    setArtTypes((prev) => prev.filter((a) => a.id !== id));
  }

  /* ---------- SUBMIT ---------- */
  async function handleSubmit() {
    if (submitting) return;

    if (!selectedCategory) {
      toast.error("Select or create category");
      return;
    }

    if (!categoryDescription.trim()) {
      toast.error("Category description required");
      return;
    }

    // CATEGORY UPDATE (FIRST)
    if (isEditCategory) {
      try {
        setSubmitting(true);

        const formData = new FormData();
        formData.append("name", selectedCategory.label);
        formData.append("description", categoryDescription);

        if (categoryImage) {
          formData.append("categoryImage", categoryImage);
        }

        await updateCategoryApi(editData._id, formData);

        toast.success("Category updated");
        navigate("/categories");
        return; // 🚨 CRITICAL — stops other logic
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Update failed");
      } finally {
        setSubmitting(false);
      }
    }

    // ART TYPE UPDATE
    if (isEditArtType) {
      try {
        setSubmitting(true);
        const art = artTypes[0];

        if (!art.name || !art.description) {
          toast.error("All art type fields required");
          return;
        }

        const formData = new FormData();
        formData.append("name", art.name);
        formData.append("description", art.description);

        if (art.image) {
          formData.append("image", art.image);
        }

        await updateArtTypeApi(editData.data.category._id, art.id, formData);

        toast.success("Art type updated");
        navigate("/categories");
        return;
      } catch (err) {
        console.error(err);
        toast.error("Update failed");
      } finally {
        setSubmitting(false);
      }
    }

    // CREATE / ADD ART TYPE FLOW

    if (!selectedCategory.isNew) {
      // validate art types when adding to existing category
      for (let i = 0; i < artTypes.length; i++) {
        if (!artTypes[i].name || !artTypes[i].description) {
          toast.error("All art type fields required");
          return;
        }

        if (!artTypes[i].image) {
          toast.error("Art type image required");
          return;
        }
      }
    }

    if (selectedCategory.isNew && !categoryImage) {
      toast.error("Category image required");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append("categoryName", selectedCategory.label);
      formData.append("categoryDescription", categoryDescription);

      if (categoryImage) {
        formData.append("categoryImage", categoryImage);
      }

      const artPayload = artTypes.map((a) => ({
        name: a.name,
        description: a.description,
      }));

      formData.append("artTypes", JSON.stringify(artPayload));

      artTypes.forEach((a) => {
        if (a.image) formData.append("image", a.image);
      });

      if (selectedCategory.isNew) {
        // ✅ CREATE CATEGORY
        await api.post("/categories", formData);
        toast.success("Category created");
      } else {
        // ✅ ADD ART TYPE
        await addArtTypeApi(selectedCategory.value, formData);
        toast.success("Art type added");
      }

      navigate("/categories");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* CATEGORY SECTION */}
      <div>
        <h2 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Category</h2>

        <div className="space-y-3 sm:space-y-4">
          {/* Category Select with Tooltip */}
          <div className="space-y-1 relative">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium">
                Select or Create Category
              </label>

              <div className="group relative cursor-pointer">
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] sm:text-xs font-bold rounded-full bg-gray-200 text-gray-700">
                  i
                </span>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 sm:w-64 scale-0 group-hover:scale-100 transition-transform origin-top bg-black text-white text-[10px] sm:text-xs rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 z-50 shadow-lg">
                  Choose an existing category or type a new one to create it.
                  <br />
                  If you create a new category, description and image will be
                  required.
                </div>
              </div>
            </div>

            <CreatableSelect
              isDisabled={isEditArtType || isEditCategory}
              isClearable
              options={categoryOptions}
              value={selectedCategory}
              inputValue={categoryInput}
              onInputChange={(val) => setCategoryInput(val)}
              onChange={handleCategorySelect}
              placeholder="Select or type category..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  borderRadius: "8px",
                  fontSize: "14px",
                }),
                menu: (base) => ({
                  ...base,
                  fontSize: "14px",
                }),
              }}
            />
          </div>

          {/* Category Description */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">Category Description</label>
            <textarea
              disabled={
                isEditArtType ||
                (!isEditCategory && selectedCategory && !selectedCategory.isNew)
              }
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm h-20 sm:h-24 disabled:bg-gray-100 focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Category description"
            />
          </div>

          {/* Category Image (conditional) */}
          {(selectedCategory?.isNew || isEditCategory) && (
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium">Category Image</label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <label className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg cursor-pointer bg-gray-50 text-xs sm:text-sm whitespace-nowrap">
                  Choose Image
                  <input
                    ref={categoryFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImage}
                    className="hidden"
                  />
                </label>

                {(categoryImage || (isEditCategory && editData?.image)) && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                    <img
                      src={
                        categoryImage
                          ? URL.createObjectURL(categoryImage)
                          : editData?.image
                      }
                      alt="Category preview"
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      onClick={removeCategoryImage}
                      className="absolute -top-1.5 -right-1.5 bg-black text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors">
                      ×
                    </button>
                  </div>
                )}
              </div>

              {categoryImageError && (
                <p className="text-red-500 text-xs sm:text-sm">{categoryImageError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ART TYPES SECTION */}
      {!isEditCategory && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <h2 className="font-semibold text-base sm:text-lg">Art Types</h2>
            <button
              onClick={addArtType}
              className="bg-[#83261D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap hover:bg-[#6a1e17] transition-colors">
              + Assign another art type
            </button>
          </div>
        </>
      )}

      {/* Art Type Cards */}
      {artTypes.map((art, index) => (
        <div key={art.id} className="border rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
          {artTypes.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={() => removeArtType(art.id)}
                className="text-red-600 text-xs sm:text-sm hover:text-red-800 transition-colors">
                Remove
              </button>
            </div>
          )}

          {/* Art Type Number (if multiple) */}
          {artTypes.length > 1 && (
            <div className="text-xs sm:text-sm font-medium text-gray-500">
              Art Type #{index + 1}
            </div>
          )}

          {/* Art Type Name */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">Art Type Name</label>
            <input
              value={art.name}
              onChange={(e) => updateArtType(art.id, "name", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Art type name"
            />
          </div>

          {/* Art Type Description */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">Art Type Description</label>
            <textarea
              value={art.description}
              onChange={(e) =>
                updateArtType(art.id, "description", e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm h-20 sm:h-24 focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Art type description"
            />
          </div>

          {/* Art Type Image */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">Art Type Image</label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg cursor-pointer bg-gray-50 text-xs sm:text-sm whitespace-nowrap">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleArtImage(art.id, e)}
                  className="hidden"
                />
              </label>

              {(art.image || art.existingImage) && (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                  <img
                    src={
                      art.image
                        ? URL.createObjectURL(art.image)
                        : art.existingImage
                    }
                    alt="Art type preview"
                    className="w-full h-full object-cover rounded border"
                  />
                  <button
                    onClick={() => {
                      updateArtType(art.id, "image", null);
                      updateArtType(art.id, "existingImage", undefined);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-black text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors">
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
        <button
          onClick={() => navigate("/categories")}
          className="order-2 sm:order-1 px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg text-xs sm:text-sm hover:bg-gray-600 transition-colors">
          Cancel
        </button>

        <button
          disabled={submitting}
          onClick={handleSubmit}
          className={`order-1 sm:order-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm transition ${
            submitting
              ? "bg-gray-400 cursor-not-allowed opacity-80"
              : "bg-[#83261D] hover:bg-[#6a1e17]"
          }`}>
          {submitting
            ? isEditCategory
              ? "Updating..."
              : isEditArtType
                ? "Updating..."
                : "Saving..."
            : isEditCategory
              ? "Update Category"
              : isEditArtType
                ? "Update Art Type"
                : "Save"}
        </button>
      </div>
    </div>
  );
}