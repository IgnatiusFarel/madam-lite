import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../layouts/Dashboard.layout";
import ActivityHistoryList from "../../components/activity-history/ActivityHistoryList";

const ActivityHistory = () => {
  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>Activity History - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <ActivityHistoryList />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default ActivityHistory;