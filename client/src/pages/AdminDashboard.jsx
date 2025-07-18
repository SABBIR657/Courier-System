import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [parcelId, setParcelId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [assignError, setAssignError] = useState(""); // To display assignment errors
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true); // Loading state for metrics
  const [isAssigning, setIsAssigning] = useState(false); // Loading state for agent assignment
  const [user, setUser] = useState(null); // User state for authentication check
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false); // Loading state for CSV download
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false); // Loading state for PDF download
  // New state for assigned parcel location and agent name
  const [assignedParcelLocation, setAssignedParcelLocation] = useState(null);
  const [assignedAgentName, setAssignedAgentName] = useState("");

  // New states for displaying all parcels and agents
  const [allParcels, setAllParcels] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [isLoadingAllParcels, setIsLoadingAllParcels] = useState(true);
  const [isLoadingAllAgents, setIsLoadingAllAgents] = useState(true);
  const [lastAssignedParcelId, setLastAssignedParcelId] = useState(null); // To highlight assigned parcel

  useEffect(() => {
    // Check user role and redirect if not admin
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "admin") {
      // Redirect to login or unauthorized page
      window.location.href = "/login";
    } else {
      setUser(userData);
      fetchMetrics(); // Fetch metrics only if user is an admin
      fetchAllParcels(); // Fetch all parcels
      fetchAllAgents(); // Fetch all agents
    }
  }, []);

  /**
   * Fetches dashboard metrics from the API.
   */
  const fetchMetrics = async () => {
    setIsLoadingMetrics(true); // Set loading state to true
    try {
      const res = await axiosInstance.get("/parcels/dashboard/metrics");
      setMetrics(res.data);
    } catch (error) {
      console.error("Failed to load metrics:", error);
      // Optionally, set an error state to display to the user
    } finally {
      setIsLoadingMetrics(false); // Set loading state to false
    }
  };

  /**
   * Fetches all parcels from the API.
   */
  const fetchAllParcels = async () => {
    setIsLoadingAllParcels(true);
    try {
      const res = await axiosInstance.get("/parcels"); // Assuming this endpoint returns all parcels
      setAllParcels(res.data);
    } catch (error) {
      console.error("Failed to load all parcels:", error);
      // Handle error for fetching parcels
    } finally {
      setIsLoadingAllParcels(false);
    }
  };

  /**
   * Fetches all agents from the API.
   */
  const fetchAllAgents = async () => {
    setIsLoadingAllAgents(true);
    try {
      // Assuming an endpoint that returns users with role 'agent'
      const res = await axiosInstance.get("/parcels/agents");
      setAllAgents(res.data);
    } catch (error) {
      console.error("Failed to load all agents:", error);
      // Handle error for fetching agents
    } finally {
      setIsLoadingAllAgents(false);
    }
  };

  /**
   * Handles assigning an agent to a parcel.
   * @param {Event} e - The form submission event.
   */
  const handleAssignAgent = async (e) => {
    e.preventDefault();
    setAssignMessage(""); // Clear previous messages
    setAssignError(""); // Clear previous errors
    setAssignedParcelLocation(null); // Clear previous parcel location
    setAssignedAgentName(""); // Clear previous agent name
    setLastAssignedParcelId(null); // Clear previous highlight
    setIsAssigning(true); // Set assigning state to true

    try {
      const res = await axiosInstance.patch("/parcels/assign-agent", {
        parcelId,
        agentId,
      });
      setAssignMessage(res.data.message || "Agent assigned successfully!");
      setParcelId(""); // Clear input fields on success
      setAgentId("");

      // Update state with new parcel location and assigned agent name
      if (res.data.parcel && res.data.parcel.currentLocation) {
        setAssignedParcelLocation(res.data.parcel.currentLocation);
      }
      if (res.data.parcel && res.data.parcel.assignedAgent) {
        setAssignedAgentName(res.data.parcel.assignedAgent.name);
      }
      setLastAssignedParcelId(res.data.parcel._id); // Set the ID for highlighting

      // Refresh parcel and agent lists to reflect the assignment
      fetchAllParcels();
      fetchAllAgents(); // Agents might be updated if their assigned parcels count changes
    } catch (error) {
      console.error("Failed to assign agent:", error);
      setAssignError(
        error.response?.data?.message ||
          "Failed to assign agent. Please try again."
      );
    } finally {
      setIsAssigning(false); // Set assigning state to false
    }
  };

  /**
   * Downloads the CSV report using axios to include authentication headers.
   */
  const downloadCSV = async () => {
    setIsDownloadingCSV(true);
    try {
      const response = await axiosInstance.get("/parcels/export/csv", {
        responseType: "blob", // Important for file downloads
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "parcels.csv"); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the DOM
      window.URL.revokeObjectURL(url); // Release the object URL
    } catch (error) {
      console.error("Failed to download CSV:", error);
      alert("Failed to download CSV. Please ensure you are authorized."); // Using alert for simplicity, consider a custom modal
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  /**
   * Downloads the PDF report using axios to include authentication headers.
   */
  const downloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const response = await axiosInstance.get("/parcels/export/pdf", {
        responseType: "blob", // Important for file downloads
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "parcels.pdf"); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the DOM
      window.URL.revokeObjectURL(url); // Release the object URL
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please ensure you are authorized."); // Using alert for simplicity, consider a custom modal
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  /**
   * Handles user logout.
   */
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from local storage
    window.location.href = "/login"; // Redirect to login page
  };

  // Render nothing or a loading spinner if user is not yet determined
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
      {/* Header with Welcome Message and Logout Button */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center sm:text-left mb-4 sm:mb-0">
          Admin Dashboard
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

      {/* Metrics Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Dashboard Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingMetrics ? (
            // Loading skeleton for metrics
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <MetricCard
                title="Today’s Bookings"
                value={metrics.totalBookingsToday || 0}
                unit=""
                bgColor="bg-blue-50"
                textColor="text-blue-700"
              />
              <MetricCard
                title="Failed Deliveries"
                value={metrics.failedDeliveries || 0}
                unit=""
                bgColor="bg-red-50"
                textColor="text-red-700"
              />
              <MetricCard
                title="Total COD Amount"
                value={`৳${metrics.codAmount?.toLocaleString() || 0}`}
                unit=""
                bgColor="bg-green-50"
                textColor="text-green-700"
              />
            </>
          )}
        </div>
      </section>

      {/* All Parcels Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          All Parcels Overview
        </h2>
        {isLoadingAllParcels ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading parcels...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-2"></div>
          </div>
        ) : allParcels.length === 0 ? (
          <p className="text-gray-600 text-center">No parcels found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assigned Agent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allParcels.map((parcel) => (
                  <tr key={parcel._id}>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        lastAssignedParcelId === parcel._id
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {parcel._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.assignedAgent
                        ? parcel.assignedAgent.name
                        : "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* All Agents Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          Available Agents
        </h2>
        {isLoadingAllAgents ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading agents...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-2"></div>
          </div>
        ) : allAgents.length === 0 ? (
          <p className="text-gray-600 text-center">No agents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Agent ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Agent Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allAgents.map((agent) => (
                  <tr key={agent._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agent._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Assign Agent Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          Assign Agent to Parcel
        </h2>
        <form onSubmit={handleAssignAgent} className="space-y-5">
          <div>
            <label
              htmlFor="parcelId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parcel ID
            </label>
            <input
              type="text"
              id="parcelId"
              placeholder="e.g., 68769b034709b71cc326254a"
              value={parcelId}
              onChange={(e) => setParcelId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="agentId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Agent ID
            </label>
            <input
              type="text"
              id="agentId"
              placeholder="e.g., 68769e6f2164f9faae06745f"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isAssigning}
          >
            {isAssigning ? (
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
              "Assign Agent"
            )}
          </button>
        </form>
        {assignMessage && (
          <p className="mt-4 text-green-600 font-semibold text-center sm:text-left">
            {assignMessage}
          </p>
        )}
        {assignError && (
          <p className="mt-4 text-red-600 font-semibold text-center sm:text-left">
            {assignError}
          </p>
        )}

        {/* Display Parcel Location and Assigned Agent after successful assignment */}
        {assignedParcelLocation && assignedAgentName && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">
              Assigned Parcel Details
            </h3>
            <p className="text-lg text-blue-700 mb-2">
              Assigned Agent:{" "}
              <span className="font-semibold">{assignedAgentName}</span>
            </p>
            <p className="text-lg text-blue-700 mb-4">
              Current Location: Lat {assignedParcelLocation.lat}, Lng{" "}
              {assignedParcelLocation.lng}
            </p>
            <div className="w-full h-64 rounded-md overflow-hidden shadow-md border border-blue-300">
              <iframe
                title="Parcel Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${assignedParcelLocation.lat},${assignedParcelLocation.lng}&z=15&output=embed`}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              ></iframe>
            </div>
          </div>
        )}
      </section>

      {/* Export Options Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-5">
          Export Parcel Reports
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadCSV}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isDownloadingCSV}
          >
            {isDownloadingCSV ? (
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
              "Download CSV"
            )}
          </button>
          <button
            onClick={downloadPDF}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isDownloadingPDF}
          >
            {isDownloadingPDF ? (
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
              "Download PDF"
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, unit, bgColor, textColor }) => (
  <div
    className={`relative ${bgColor} rounded-xl shadow-md p-6 overflow-hidden transform transition duration-300 hover:scale-105`}
  >
    <div
      className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 ${textColor}`}
    ></div>
    <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
    <p className={`text-4xl font-bold ${textColor}`}>
      {value}
      {unit && <span className="text-2xl font-normal ml-1">{unit}</span>}
    </p>
  </div>
);

// Skeleton Loader for Metric Cards
const MetricCardSkeleton = () => (
  <div className="bg-gray-200 rounded-xl shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
  </div>
);

export default AdminDashboard;
