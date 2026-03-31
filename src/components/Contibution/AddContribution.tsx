/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import {
  createContributionApi,
  updateContributionApi,
} from "../../api/contributionApi";

export type Contribution = {
  _id: string;
  name: string;
  mobileNumber: string;
  contributionType: string;
  description: string;
  status: string;
};

function AddContribution() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state as Contribution | null;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setMobile(editData.mobileNumber);
      setType(editData.contributionType);
      setDescription(editData.description);
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (!name || !mobile || !type || !description) {
      toast.error("All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Enter valid mobile number");
      return;
    }

    const payload = {
      name,
      mobileNumber: mobile,
      contributionType: type,
      description,
    };

    try {
      if (editData) {
        await updateContributionApi(editData._id, payload);
        toast.success("Contribution updated");
      } else {
        await createContributionApi({
          name,
          mobileNumber: mobile,
          contributionType: type,
          description,
        });
        toast.success("Contribution created");
      }

      navigate("/contributions");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {editData ? "Update Contribution" : ""}
        </h2>
      </div>

      {/* Form box */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Contributor Details</h3>
        <hr className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mobile Number</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="input mt-1"
              placeholder="Enter mobile number"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contribution Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input mt-1">
              <option value="">Select contribution type</option>
              <option>Artist Information</option>
              <option>Art Form Details</option>
              <option>Cultural Events</option>
              <option>Others</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input mt-1 h-28"
            placeholder="Write your contribution..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/contributions")}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          {editData ? "Update Contribution" : "Add Contribution"}
        </button>
      </div>
    </div>
  );
}

export default AddContribution;
