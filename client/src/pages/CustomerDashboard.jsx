import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const CustomerDashboard = () => {
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // New state for error handling
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true at the start of fetch
      setError(""); // Clear previous errors
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Fetch user parcels
          const parcelsRes = await axiosInstance.get("/parcels/my");
          setParcels(parcelsRes.data || []);
        } else {
          // No user in localStorage, redirect to login
          navigate("/login");
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data."
        );
        // If there's an error and no user, still redirect to login
        if (!localStorage.getItem("user")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const totalCod = parcels.reduce((sum, p) => {
    if (p.isPrepaid) return sum;
    return sum + (parseFloat(p.codAmount) || 0);
  }, 0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Loading spinner for initial load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
      {/* Header with Welcome Message and Logout Button */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center sm:text-left mb-4 sm:mb-0">
          Welcome,{" "}
          <span className="text-blue-600">{user?.name || "Customer"}</span>!
        </h1>
        <button
          onClick={handleLogout}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Logout
        </button>
      </header>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Profile + Summary + Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Profile Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Profile Information
          </h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {user?.email || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {user?.phone || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {user?.address || "N/A"}
            </p>
          </div>
        </div>

        {/* Parcel Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Parcel Summary
          </h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Total Parcels:</span>{" "}
              {parcels.length}
            </p>
            <p>
              <span className="font-semibold">Total COD Amount:</span> ৳
              {totalCod.toLocaleString()}
            </p>
            {/* You can add more summary metrics here if available */}
          </div>
        </div>

        {/* Action Buttons Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Quick Actions
          </h2>
          <button
            onClick={() => navigate("/book-parcel")}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m-4-2h8m-4 2h.01"
              ></path>
            </svg>
            Book New Parcel
          </button>
          <button
            onClick={() => navigate("/my-parcel")}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 16l4-4m0 0l-4-4m4 4H7"
              ></path>
            </svg>
            View My Parcels
          </button>
        </div>
      </section>

      {/* Recent Bookings Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          Recent Bookings
        </h2>
        {parcels.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative text-center">
            <strong className="font-bold">No Bookings Yet!</strong>
            <span className="block sm:inline">
              {" "}
              You haven't booked any parcels.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Parcel ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Delivery Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parcels.slice(0, 5).map((p) => (
                  <tr key={p._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.deliveryAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          p.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : p.status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.isPrepaid
                        ? "Prepaid"
                        : `৳${p.codAmount?.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerDashboard;
