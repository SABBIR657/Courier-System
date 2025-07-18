import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const MyParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/parcels/my");
        setParcels(res.data.parcels || res.data); // adjust based on API
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load parcels");
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading parcels...</p>;

  if (error)
    return (
      <p className="text-red-600 mt-6 text-center" role="alert">
        {error}
      </p>
    );

  if (parcels.length === 0)
    return <p className="text-center mt-6">No parcels found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6">My Parcels</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Parcel ID</th>
            <th className="border p-2 text-left">Pickup Address</th>
            <th className="border p-2 text-left">Delivery Address</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">COD Amount</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((parcel) => (
            <tr key={parcel._id || parcel.id}>
              <td className="border p-2">{parcel._id || parcel.id}</td>
              <td className="border p-2">{parcel.pickupAddress}</td>
              <td className="border p-2">{parcel.deliveryAddress}</td>
              <td className="border p-2">{parcel.status}</td>
              <td className="border p-2">
                {parcel.isPrepaid ? "Prepaid" : parcel.codAmount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyParcels;
