import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../layouts/Dashboard.layout";
import DemographList from "../../components/master-data/demograph/DemographList";

const Demograph = () => {
  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>Demograph - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <DemographList />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default Demograph;