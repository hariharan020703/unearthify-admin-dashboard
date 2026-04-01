/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import api from "../../api/axios";

type AppEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  visibleFrom: string;
  location: string;
  categories: string;
  image: string;
  recurrence: "none" | "monthly" | "yearly";
};

type Category = {
  _id: string;
  name: string;
};

export default function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const editEvent = location.state as AppEvent | null;

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    categories: "",
    recurrence: "none" as "none" | "monthly" | "yearly",
    visibleFrom: "",
  });

  const [existingImage, setExistingImage] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- PREFILL ---------- */
  useEffect(() => {
    if (editEvent) {
      setForm({
        title: editEvent.title,
        description: editEvent.description,
        date: editEvent.date ? editEvent.date.slice(0, 10) : "",
        visibleFrom: editEvent.visibleFrom
          ? editEvent.visibleFrom.slice(0, 10)
          : editEvent.date?.slice(0, 10) || "",
        location: editEvent.location,
        categories: editEvent.categories,
        recurrence: editEvent.recurrence || "none",
      });
      setExistingImage(editEvent.image);
      setPreviewUrl(editEvent.image || null);
    }
  }, [editEvent]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");

        let categoryArray: any[] = [];

        if (Array.isArray(res.data)) {
          categoryArray = res.data;
        } else if (Array.isArray(res.data.data)) {
          categoryArray = res.data.data;
        } else if (Array.isArray(res.data.categories)) {
          categoryArray = res.data.categories;
        }

        setCategories(categoryArray);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load categories");
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  /* ---------- IMAGE ---------- */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      return;
    }

    setImageError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setExistingImage(undefined);
    setImageError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------- INPUT ---------- */
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ---------- SUBMIT ---------- */
  async function handleSubmit() {
  if (isSubmitting) return;
  const { title, description, date, location, categories } = form;

  if (!title || !description || !date || !location || !categories) {
    toast.error("All fields are required");
    return;
  }

  if (!editEvent && !imageFile) {
    toast.error("Image is required");
    return;
  }

  try {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("location", location);
    formData.append("categories", categories);
    formData.append("recurrence", form.recurrence);
    formData.append("visibleFrom", form.visibleFrom);

    if (imageFile) formData.append("image", imageFile);

    if (editEvent) {
      // ✅ Update via event api (same as before)
      await api.put(`/events/${editEvent._id}`, formData);
      toast.success("Event updated");
    } else {
      // ✅ Create via admin submission endpoint (like artist bulkCreate)
      await api.post("/events", formData);
      toast.success("Event created");
    }

    navigate("/events");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <div className="relative bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">
          {editEvent ? "Update Event" : "Add New Event"}
        </h2>
      </div>

      {/* EVENT DETAILS SECTION */}
      <div className="bg-white rounded-lg sm:rounded-xl border p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-sm sm:text-base font-medium">Event Details</h3>
        <hr className="my-2 sm:my-3" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Category Select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Select Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categories"
              value={form.categories}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none bg-white">
              <option value="">-- Select category --</option>
              {categories.length > 0 &&
                categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Event Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Eg: Classical Dance Festival"
            />
          </div>

          {/* Event Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
            />
          </div>

          {/* Recurring Event */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Recurring Event
            </label>
            <select
              name="recurrence"
              value={form.recurrence}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none bg-white">
              <option value="none">None</option>
              <option value="monthly">Every Month</option>
              <option value="yearly">Every Year</option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Eg: Kerala Kalamandalam, Thrissur"
            />
          </div>

          {/* Visible From (conditional) */}
          {form.recurrence !== "none" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Visible From
              </label>
              <input
                type="date"
                name="visibleFrom"
                value={form.visibleFrom}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              />
            </div>
          )}

          {/* Description - Full Width */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none h-20 sm:h-24 md:h-28 resize-none"
              placeholder="Write full event details..."
            />
          </div>
        </div>
      </div>

      {/* EVENT IMAGE SECTION */}
      <div className="bg-white rounded-lg sm:rounded-xl border p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-sm sm:text-base font-medium">Event Image</h3>
        <hr className="my-2 sm:my-3" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Image Upload Button */}
          <label className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 w-fit text-xs sm:text-sm whitespace-nowrap">
            {previewUrl || existingImage ? "Change Image" : "Choose Image"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Image Preview */}
          {(previewUrl || existingImage) && (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <img
                src={previewUrl || existingImage || ""}
                alt="Event preview"
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors">
                ×
              </button>
            </div>
          )}

          {/* Image Hint */}
          <p className="text-[10px] sm:text-xs text-gray-400">
            Max file size: 2MB
          </p>
        </div>

        {imageError && (
          <p className="text-red-500 text-xs sm:text-sm mt-2">{imageError}</p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          onClick={() => navigate("/events")}
          className="order-2 sm:order-1 px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg text-xs sm:text-sm hover:bg-gray-600 transition-colors">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`order-1 sm:order-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm transition ${isSubmitting
              ? "bg-gray-400 cursor-not-allowed opacity-80"
              : "bg-[#83261D] hover:bg-[#6a1e17]"
            }`}>
          {isSubmitting
            ? editEvent
              ? "Updating..."
              : "Adding..."
            : editEvent
              ? "Update Event"
              : "Add Event"}
        </button>
      </div>
    </div>
  );
}