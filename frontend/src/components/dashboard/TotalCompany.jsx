import { useEffect, useState } from "react";
import { Card, Typography, Select, Skeleton } from "antd";
import http from "../../utils/http";
const { Text } = Typography;

const TotalCompany = () => {
  const [alignValue, setAlignValue] = useState("today");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    {
      key: "today",
      label: "Today",
      data: 0,
    },
    {
      key: "week",
      label: "Week",
      data: 0,
    },
    {
      key: "month",
      label: "Month",
      data: 0,
    },
    {
      key: "year",
      label: "Year",
      data: 0,
    },
    {
      key: "all-time",
      label: "All Time",
      data: 0,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const todayResponse = await http.get(
          "/aio-analysis/company-total?interval=today"
        );
        const weekResponse = await http.get(
          "/aio-analysis/company-total?interval=weekly"
        );
        const monthResponse = await http.get(
          "/aio-analysis/company-total?interval=monthly"
        );
        const yearResponse = await http.get(
          "/aio-analysis/company-total?interval=yearly"
        );
        const allTimeResponse = await http.get(
          "/aio-analysis/company-total?interval=all-time"
        );

        setItems([
          {
            key: "today",
            label: "Today",
            data: todayResponse.data[0].total_companies,
          },
          {
            key: "week",
            label: "Week",
            data: weekResponse.data[0].total_companies,
          },
          {
            key: "month",
            label: "Month",
            data: monthResponse.data[0].total_companies,
          },
          {
            key: "year",
            label: "Year",
            data: yearResponse.data[0].total_companies,
          },
          {
            key: "all-time",
            label: "All Time",
            data: allTimeResponse.data[0].total_companies,
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (value) => {
    setAlignValue(value);
  };

  return loading ? (
    <Card bordered={false} className="flex flex-col h-full">
      <Skeleton active />
    </Card>
  ) : (
    <Card bordered={false} className="flex flex-col h-full">
      <div className="flex flex-col h-40">
        <div className="flex justify-between">
          <div className="flex flex-col w-1/2">
            <Text className="text-lg font-normal text-neutral-500 ">Total</Text>
            <Text className="text-xl font-bold -mt-1">Company</Text>
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
          {items.map((item) =>
            alignValue === item.key ? (
              <div key={item.key}>
                <div className="flex flex-col items-center justify-center h-full ">
                  <Text className="text-5xl font-semibold">{item.data}</Text>
                  <Text className="text-xl">Company</Text>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </Card>
  );
};

export default TotalCompany;
