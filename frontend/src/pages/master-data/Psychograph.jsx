import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../layouts/Dashboard.layout";
import PsychographIndex from "../../components/master-data/psychograph/PsychographIndex";

const Psychograph = () => {
  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>Psychograph - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <PsychographIndex />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default Psychograph;
