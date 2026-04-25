import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ManagerDashboard from "./pages/ManagerDashboard";
import GtpDashboard from "./pages/GtpDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import ProtectedRoute from "./ProtectedRoute";
import CustomerProfile from "./pages/CustomerProfile";
import ServiceDashboard from "./pages/ServiceDashboard";
import VinSearch from "./pages/VinSearch";
import AccountingDashboard from "./pages/AccountingDashboard";
import SetPassword from "./pages/SetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/set-password" element={<SetPassword />} />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gtp"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "ManagerGTP"]}>
              <GtpDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mechanic"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "Mechanic"]}>
              <MechanicDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "ManagerGTP"]}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/service"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <ServiceDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/archive" element={<VinSearch />} />

        <Route path="/accounting" element={<AccountingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
