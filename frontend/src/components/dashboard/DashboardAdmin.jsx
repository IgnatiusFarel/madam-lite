import Chart from "./Chart";
import TotalSubmitted from "./TotalSubmitted";
import TotalCompany from "./TotalCompany";
import RecentlyActivity from "./RecentlyActivity";

const DashboardAdmin = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:justify-between mx-4 my-4">
        <div className="lg:w-8/12 lg:h-full mb-4 lg:mb-0 lg:mr-4">
          <Chart />
        </div>
        <div className="lg:w-4/12 flex flex-col space-y-4">
          <div className="lg:h-1/2">
            <TotalSubmitted />
          </div>
          <div className="lg:h-1/2">
            <TotalCompany />
          </div>
        </div>
      </div>
      <div className="lg:w-full">
        <RecentlyActivity />
      </div>
    </>
  );
};

export default DashboardAdmin;
