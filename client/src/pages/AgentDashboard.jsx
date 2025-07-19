import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import ParcelCard from "../components/Agent/ParcelCard";
import ParcelCardSkeleton from "../components/Agent/ParcelCardSkeleton";

const AgentDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignedParcels, setAssignedParcels] = useState([]);
  const [isLoadingParcels, setIsLoadingParcels] = useState(true);
  const [parcelFetchError, setParcelFetchError] = useState("");
  const [updateStatusParcelId, setUpdateStatusParcelId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Picked Up");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const [updateLocationParcelId, setUpdateLocationParcelId] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState("");

  // Allowed parcel statuses
  const allowedStatuses = ["Picked Up", "In Transit", "Delivered", "Failed"];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "agent") {
      window.location.href = "/login"; // Redirect if not an agent
    } else {
      setUser(userData);
      fetchAssignedParcels();
    }
  }, []);

  const fetchAssignedParcels = async () => {
    setIsLoadingParcels(true);
    setParcelFetchError("");
    try {
      const res = await axiosInstance.get("/parcels/assigned");
      setAssignedParcels(res.data);
    } catch (error) {
      console.error("Failed to load assigned parcels:", error);
      setParcelFetchError(
        error.response?.data?.message ||
          "Failed to load assigned parcels. Please try again."
      );
    } finally {
      setIsLoadingParcels(false);
    }
  };

  /**
   * Handles updating the status of a parcel.
   * @param {Event} e - The form submission event.
   */
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setStatusError("");
    setIsUpdatingStatus(true);

    try {
      const res = await axiosInstance.patch("/parcels/status", {
        parcelId: updateStatusParcelId,
        status: selectedStatus,
      });
      setStatusMessage(
        res.data.message || "Parcel status updated successfully!"
      );

      fetchAssignedParcels();
      setUpdateStatusParcelId("");
    } catch (error) {
      console.error("Failed to update status:", error);
      setStatusError(
        error.response?.data?.message ||
          "Failed to update status. Please try again."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Handles updating the location of a parcel.
   * @param {Event} e - The form submission event.
   */
  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    setLocationMessage("");
    setLocationError("");
    setIsUpdatingLocation(true);

    try {
      const res = await axiosInstance.patch("/parcels/update-location", {
        parcelId: updateLocationParcelId,
        lat: parseFloat(newLat),
        lng: parseFloat(newLng),
      });
      setLocationMessage(
        res.data.message || "Parcel location updated successfully!"
      );

      fetchAssignedParcels();
      setUpdateLocationParcelId("");
      setNewLat("");
      setNewLng("");
    } catch (error) {
      console.error("Failed to update location:", error);
      setLocationError(
        error.response?.data?.message ||
          "Failed to update location. Please try again."
      );
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(""); // Clear previous errors
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLat(position.coords.latitude.toFixed(6)); // Format to 6 decimal places
          setNewLng(position.coords.longitude.toFixed(6));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          let errorMessage = "Failed to get current location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location permission denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out.";
              break;
            default:
              errorMessage =
                "An unknown error occurred while getting location.";
              break;
          }
          setLocationError(errorMessage);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setIsGettingLocation(false);
    }
  };

  /**
   * Handles user logout.
   */
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from local storage
    window.location.href = "/login"; // Redirect to login page
  };

  if (!user && localStorage.getItem("user")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-700">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center sm:text-left mb-4 sm:mb-0">
          Agent Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          {user && (
            <p className="text-lg text-gray-700 font-medium">
              Welcome,{" "}
              <span className="font-semibold text-blue-600">{user.name}</span>!
            </p>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Your Assigned Parcels
        </h2>
        {isLoadingParcels ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ParcelCardSkeleton />
            <ParcelCardSkeleton />
            <ParcelCardSkeleton />
          </div>
        ) : parcelFetchError ? (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {parcelFetchError}</span>
          </div>
        ) : assignedParcels.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong className="font-bold">No Parcels!</strong>
            <span className="block sm:inline">
              {" "}
              You currently have no parcels assigned.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedParcels.map((parcel) => (
              <ParcelCard key={parcel._id} parcel={parcel} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          Update Parcel Status
        </h2>
        <form onSubmit={handleUpdateStatus} className="space-y-5">
          <div>
            <label
              htmlFor="updateStatusParcelId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parcel ID
            </label>
            <input
              type="text"
              id="updateStatusParcelId"
              placeholder="Enter Parcel ID"
              value={updateStatusParcelId}
              onChange={(e) => setUpdateStatusParcelId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="selectedStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select New Status
            </label>
            <select
              id="selectedStatus"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
              required
            >
              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Update Status"
            )}
          </button>
        </form>
        {statusMessage && (
          <p className="mt-4 text-green-600 font-semibold text-center sm:text-left">
            {statusMessage}
          </p>
        )}
        {statusError && (
          <p className="mt-4 text-red-600 font-semibold text-center sm:text-left">
            {statusError}
          </p>
        )}
      </section>

      {/* Update Parcel Location Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          Update Parcel Location
        </h2>
        <form onSubmit={handleUpdateLocation} className="space-y-5">
          <div>
            <label
              htmlFor="updateLocationParcelId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parcel ID
            </label>
            <input
              type="text"
              id="updateLocationParcelId"
              placeholder="Enter Parcel ID"
              value={updateLocationParcelId}
              onChange={(e) => setUpdateLocationParcelId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="newLat"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                id="newLat"
                placeholder="e.g., 23.7806"
                value={newLat}
                onChange={(e) => setNewLat(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
                required
              />
            </div>
            <div>
              <label
                htmlFor="newLng"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                id="newLng"
                placeholder="e.g., 90.4074"
                value={newLng}
                onChange={(e) => setNewLng(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
                required
              />
            </div>
          </div>
          <button
            type="button" // Changed to type="button" to prevent form submission
            onClick={handleGetCurrentLocation}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Get Current Location"
            )}
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isUpdatingLocation}
          >
            {isUpdatingLocation ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Update Location"
            )}
          </button>
        </form>
        {locationMessage && (
          <p className="mt-4 text-green-600 font-semibold text-center sm:text-left">
            {locationMessage}
          </p>
        )}
        {locationError && (
          <p className="mt-4 text-red-600 font-semibold text-center sm:text-left">
            {locationError}
          </p>
        )}
      </section>
    </div>
  );
};

<>
  <ParcelCard />
  <ParcelCardSkeleton />
</>;

export default AgentDashboard;
