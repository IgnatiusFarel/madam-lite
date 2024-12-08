import { useEffect, useState } from "react";
import CompanyInformation from "./CompanyInformation";
import Demograph from "./demograph/Demograph";
import Psychograph from "./Psychograph";
import Summary from "./Summary";
import { FormProvider } from "./FormContext";
import { useNavigate, useParams } from "react-router-dom";

const AioIndex = () => {
  const navigate = useNavigate();
  const { page } = useParams();
  const [activePage, setActivePage] = useState(page || "company-information");

  useEffect(() => {
    if (!page) {
      navigate(`?page=company-information`, { replace: true });
    }
  }, [page]);

  const handleNext = () => {
    switch (activePage) {
      case "company-information":
        setActivePage("demograph");
        navigate(`?page=demograph`, { replace: true });
        break;
      case "demograph":
        setActivePage("psychograph");
        navigate(`?page=psychograph`, { replace: true });
        break;
      case "psychograph":
        setActivePage("summary");
        navigate(`?page=summary`, { replace: true });
        break;
      default:
        break;
    }
  };

  const handlePrevious = () => {
    switch (activePage) {
      case "demograph":
        setActivePage("company-information");
        navigate(`?page=company-information`, { replace: true });
        break;
      case "psychograph":
        setActivePage("demograph");
        navigate(`?page=demograph`, { replace: true });
        break;
      case "summary":
        setActivePage("psychograph");
        navigate(`?page=psychograph`, { replace: true });
        break;
      default:
        break;
    }
  };
  return (
    <FormProvider>
      <div>
        {activePage === "company-information" && (
          <CompanyInformation onNext={handleNext} />
        )}
        {activePage === "demograph" && (
          <Demograph onPrevious={handlePrevious} onNext={handleNext} />
        )}
        {activePage === "psychograph" && (
          <Psychograph onPrevious={handlePrevious} onNext={handleNext} />
        )}
        {activePage === "summary" && <Summary onPrevious={handlePrevious} />}
      </div>
    </FormProvider>
  );
};

export default AioIndex;
