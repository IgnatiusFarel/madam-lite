import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { message } from "antd";
import DashboardLayout from "../../layouts/Dashboard.layout";
import DashboardAdmin from "../../components/dashboard/DashboardAdmin";
import DashboardUser from "../../components/dashboard/DashboardUser";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const queryParams = new URLSearchParams(location.search);
  const userData = JSON.parse(sessionStorage.getItem("userData"));

  useEffect(() => {
    const showLoginSuccess = () => {
      messageApi.open({
        type: "success",
        content: "Login Success",
      });
    };
    if (queryParams.has("loginSuccess")) {
      queryParams.delete("loginSuccess");
      navigate({
        search: queryParams.toString(),
      });
      setTimeout(showLoginSuccess, 1000);
    }
  }, []);

  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>Dashboard - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        {contextHolder}
        {userData?.role === "superadmin" || userData?.role === "admin" ? (
          <DashboardAdmin />
        ) : (
          <DashboardUser />
        )}
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default Dashboard;
