import { useEffect } from "react";
import OverviewGrid from "../components/Dashboard/OverviewGrid";
import RevenueChart from "../components/Dashboard/RevenueChart";
import Greeting from "../components/Dashboard/Greeting";
import OverviewPayments from "../components/Dashboard/OverviewPayments";
import OverviewClients from "../components/Dashboard/OverviewClients";

const Overview = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pr-[2vw]">
      <Greeting />
      <OverviewGrid />
      {/* <RevenueChart /> */}
      <div className="grid mt-8 grid-cols-1 gap-[8vw] md:gap-[2vw] lg:grid-cols-2">
        <div>
          {/* <OverviewClients /> */}
        </div>
        <div>
          <OverviewPayments />
        </div>
      </div>
    </div>
  );
};

export default Overview;
