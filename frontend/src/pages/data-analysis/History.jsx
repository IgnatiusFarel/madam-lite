import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../layouts/Dashboard.layout";
import HistoryList from "../../components/data-analysis/history/HistoryList";

const History = () => {
  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>History - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <HistoryList />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default History;
