import { useState, useEffect } from "react";
import { Card, Typography, Select, Skeleton } from "antd";
import http from "../../utils/http";

const { Text } = Typography;

const TotalSubmitted = () => {
  const [alignValue, setAlignValue] = useState("today");
  const [loading, setLoading] = useState(false);

  const handleSelectChange = (value) => {
    setAlignValue(value);
  };

  const [itemsData, setItemsData] = useState([
    { key: "today", label: "Today", data: 0 },
    { key: "week", label: "Week", data: 0 },
    { key: "month", label: "Month", data: 0 },
    { key: "year", label: "Year", data: 0 },
    { key: "all-time", label: "All Time", data: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const todayResponse = await http.get(
          "/aio-analysis/submit-total?interval=today"
        );
        const weekResponse = await http.get(
          "/aio-analysis/submit-total?interval=weekly"
        );
        const monthResponse = await http.get(
          "/aio-analysis/submit-total?interval=monthly"
        );
        const yearResponse = await http.get(
          "/aio-analysis/submit-total?interval=yearly"
        );
        const allTimeResponse = await http.get(
          "/aio-analysis/submit-total?interval=all-time"
        );

        setItemsData([
          { key: "today", label: "Today", data: todayResponse.data },
          { key: "week", label: "Week", data: weekResponse.data },
          { key: "month", label: "Month", data: monthResponse.data },
          { key: "year", label: "Year", data: yearResponse.data },
          { key: "all-time", label: "All Time", data: allTimeResponse.data },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return loading ? (
    <Card bordered={false} className="flex flex-col h-full">
      <Skeleton active />
    </Card>
  ) : (
    <Card bordered={false} className="h-full flex flex-col justify-center">
      <div className="flex flex-col h-40">
        <div className="flex justify-between">
          <div className="flex flex-col w-1/2">
            <Text className="text-lg font-normal text-neutral-500 ">Total</Text>
            <Text className="text-xl font-bold -mt-1">Submitted</Text>
          </div>
          <div className="w-1/2 flex justify-end">
            <Select
              className="w-24"
              defaultValue="today"
              onChange={handleSelectChange}
            >
              <Select.Option value="today">Today</Select.Option>
              <Select.Option value="week">Week</Select.Option>
              <Select.Option value="month">Month</Select.Option>
              <Select.Option value="year">Year</Select.Option>
              <Select.Option value="all-time">All Time</Select.Option>
            </Select>
          </div>
        </div>

        <div className="flex-grow flex h-full items-center justify-center">
          {itemsData.map((item) =>
            alignValue === item.key ? (
              <div key={item.key}>
                <div className="flex flex-col items-center justify-center h-full">
                  <Text className="text-5xl font-semibold">{item.data}</Text>
                  <Text className="text-xl"> Submitted</Text>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </Card>
  );
};

export default TotalSubmitted;
