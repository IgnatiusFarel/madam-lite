import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../layouts/Dashboard.layout";
import AioIndex from "../../components/data-analysis/aio-analysis/AioIndex";

const AioAnalysis = () => {
  return (
    <HelmetProvider>
      <DashboardLayout>
        <Helmet>
          <title>AIO Analysis - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <AioIndex />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default AioAnalysis;
