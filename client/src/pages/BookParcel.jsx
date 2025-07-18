import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const BookParcel = () => {
  const [formData, setFormData] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    parcelSize: "Small",
    parcelType: "Documents",
    isPrepaid: true,
    codAmount: 0,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "codAmount") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post("/parcels/book", formData);
      setSuccess("Parcel booked successfully!");
      setFormData({
        pickupAddress: "",
        deliveryAddress: "",
        parcelSize: "Small",
        parcelType: "Documents",
        isPrepaid: true,
        codAmount: 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Book a Parcel</h2>

      {error && (
        <p className="text-red-600 mb-4 text-center" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 mb-4 text-center" role="alert">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Pickup Address</label>
        <input
          type="text"
          name="pickupAddress"
          value={formData.pickupAddress}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2 font-medium">Delivery Address</label>
        <input
          type="text"
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2 font-medium">Parcel Size</label>
        <select
          name="parcelSize"
          value={formData.parcelSize}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>

        <label className="block mb-2 font-medium">Parcel Type</label>
        <select
          name="parcelType"
          value={formData.parcelType}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="Documents">Documents</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Others">Others</option>
        </select>

        <div className="mb-4 flex items-center space-x-2">
          <input
            type="checkbox"
            name="isPrepaid"
            checked={formData.isPrepaid}
            onChange={handleChange}
            id="isPrepaid"
          />
          <label htmlFor="isPrepaid" className="font-medium">
            Prepaid (uncheck for COD)
          </label>
        </div>

        {!formData.isPrepaid && (
          <>
            <label className="block mb-2 font-medium">COD Amount</label>
            <input
              type="number"
              name="codAmount"
              value={formData.codAmount}
              onChange={handleChange}
              min={0}
              required={!formData.isPrepaid}
              className="w-full mb-4 p-2 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Book Parcel
        </button>
      </form>
    </div>
  );
};

export default BookParcel;
