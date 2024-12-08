import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../layouts/Dashboard.layout";
import UserList from "../../components/system-administrator/user-management/UserList";

const SystemAdministrator = () => {
  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>System Administrator - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <UserList />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default SystemAdministrator;
