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
        // Ensure res.data is an array. If API returns { parcels: [...] }, use res.data.parcels
        setParcels(Array.isArray(res.data) ? res.data : res.data.parcels || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load parcels");
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-lg text-gray-700">Loading parcels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-red-600 text-lg font-semibold" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (parcels.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-lg text-gray-700">
          No parcels found. Book one to get started! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden mt-8">
        <h2 className="text-3xl font-extrabold text-gray-900 p-6 border-b border-gray-200">
          My Parcels 📦
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parcel ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parcels.map((parcel) => (
                <tr
                  key={parcel._id || parcel.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {parcel._id ? parcel._id.substring(0, 8) + "..." : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                    {parcel.pickupAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                    {parcel.deliveryAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        parcel.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : parcel.status === "Failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {parcel.isPrepaid ? (
                      <span className="font-semibold text-gray-600">
                        Prepaid
                      </span>
                    ) : (
                      `৳ ${parcel.codAmount?.toLocaleString() || "0"}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {parcel.currentLocation &&
                    parcel.currentLocation.lat &&
                    parcel.currentLocation.lng ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=$${parcel.currentLocation.lat},${parcel.currentLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 transition-colors duration-200"
                      >
                        View Map <span className="text-base">🗺️</span>
                      </a>
                    ) : (
                      <span className="text-gray-500">Not Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyParcels;
