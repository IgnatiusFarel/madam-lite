import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/login/Login.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import SystemAdministrator from "../pages/system-administrator/SystemAdministrator.jsx";
import AioAnalysis from "../pages/data-analysis/AioAnalysis.jsx";
import History from "../pages/data-analysis/History.jsx";
import Demograph from "../pages/master-data/Demograph.jsx";
import Psychograph from "../pages/master-data/Psychograph.jsx";
import ActivityHistory from "../pages/activity-history/ActivityHistory.jsx";
import ExportPDFPage from "../components/data-analysis/history/ExportPDFPage.jsx";
import NotFound from "../pages/NotFound.jsx";

function checkAuthorization(roleRequired, userRole) {
  return roleRequired.includes(userRole);
}

function ProtectedRoute({ requiredRole }) {
  const userRole = JSON.parse(sessionStorage.getItem("userData")).role;

  if (!checkAuthorization(requiredRole, userRole)) {
    return <Navigate to="/dashboard" />;
  }
  return <Outlet />;
}

function AuthRoute() {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}

function RoutesIndex() {
  return (
    <Routes>
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/activity-history" element={<ActivityHistory />} />
      <Route
        element={
          <ProtectedRoute requiredRole={["user", "admin", "superadmin"]} />
        }
      >
        <Route path="/aio-analysis" element={<AioAnalysis />} />
        <Route path="/history" element={<History />} />
      </Route>
      <Route
        element={<ProtectedRoute requiredRole={["admin", "superadmin"]} />}
      >
        <Route path="/demograph" element={<Demograph />} />
        <Route path="/psychograph" element={<Psychograph />} />
        <Route path="/system-administrator" element={<SystemAdministrator />} />
      </Route>
      <Route
        element={
          <ProtectedRoute requiredRole={["user", "admin", "superadmin"]} />
        }
      >
        <Route path="/history/export-pdf/:id" element={<ExportPDFPage />} />
      </Route>

      <Route path="/" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default RoutesIndex;
