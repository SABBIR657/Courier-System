import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/CustomerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BookParcel from "./pages/BookParcel";
import MyParcels from "./pages/MyParcels";
import CustomerDashboard from "./pages/CustomerDashboard";
import RoleBasedDashboard from "./pages/RoleBasedDashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard/>
          </ProtectedRoute>
        }
      />

      <Route path="/book-parcel" element={
        <ProtectedRoute>
          <BookParcel/>
        </ProtectedRoute>
      }/>

      <Route path="/my-parcel" element={
        <ProtectedRoute>
          <MyParcels/>
        </ProtectedRoute>
      }/>
    </Routes>
  );
}

export default App;
