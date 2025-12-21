import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./i18n";
import Login from "./pages/Login";
import Register from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Manager from "./pages/manager/Manager";
import Employee from "./pages/employee/Employee";
import EmployeeRequest from "./pages/EmployeeRequest";
import Home from "./pages/Home";
import CreateTeam from "./pages/CreateTeam";
import JoinTeam from "./pages/JoinTeam";
import Profile from "./pages/profile";
import BookingPage from "./pages/BookingPage";
import MembersPage from "./pages/MembersPage";
import Settings from "./pages/Setting";
import History from "./pages/History";
import Support from "./pages/Support";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminTeam from "./components/AdminTeam";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/team/:teamId/dashboard" element={<Dashboard />} />
        <Route path="/team/:teamId/manager" element={<Manager />} />
        <Route
          path="/team/:teamId/employee/:employeeId"
          element={<Employee />}
        />
        <Route path="/team/:teamId/request" element={<EmployeeRequest />} />
        <Route path="/team/:teamId/history" element={<History />} />

        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/join-team" element={<JoinTeam />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/booking-page" element={<BookingPage />} />
        <Route path="/team/:teamId/members-page" element={<MembersPage />} />
        <Route path="/team/:teamId/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
          <Route path="/admin/teams/:teamId" element={<AdminTeam />} />  
      </Routes>
    </BrowserRouter>
  );
}
