import { DatePicker, Space, Card, Typography, Select, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import http from "../../utils/http";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Chart = () => {
  const [type, setType] = useState("month");
  const [loading, setLoading] = useState(true);
  const [loadChart, setLoadChart] = useState(true);
  const [date, setDate] = useState(dayjs());
  const [year, month] = date
    ? dayjs(date).format("YYYY-MM").toString().split("-")
    : [null, null];
  const [customDate, setCustomDate] = useState([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);
  const [dateWeek, setDateWeek] = useState(dayjs());
  const [yearWeek, week] = dateWeek
    ? dayjs(dateWeek).format("YYYY-W").toString().split("-")
    : [null, null];
  const [lineData, setLineData] = useState(null);

  const fetchData = async () => {
    setLoadChart(true);
    let url = `/aio-analysis/chart-company-analysis?chartInterval=${type}`;
    if (type === "month") {
      month ? (url = url + `&month=${month}`) : null;
      year ? (url = url + `&year=${year}`) : null;
    } else if (type === "custom") {
      url =
        url +
        `&startDate=${dayjs(customDate[0]).format(
          "YYYY-MM-DD"
        )}&endDate=${dayjs(customDate[1]).format("YYYY-MM-DD")}`;
    } else if (type === "week") {
      url = url + `&week=${week}&year=${yearWeek}`;
    } else if (type === "year") {
      date ? (url = url + `&year=${dayjs(date).format("YYYY")}`) : null;
    }
    console.log(url);
    await http
      .get(url)
      .then((response) => {
        setLineData({
          labels: response.labels.map((label) => label.toString()),
          datasets: [
            {
              label: "Total Company Analysis",
              data: response.data,
              borderColor: "red",
              tension: 0.2,
            },
          ],
        });
        setLoadChart(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoadChart(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [type, date, dateWeek, customDate]);

  useEffect(() => {
    date == null ? setDate(dayjs()) : null;
    customDate == null
      ? setCustomDate([dayjs().subtract(14, "day"), dayjs()])
      : null;
    dateWeek == null ? setDateWeek(dayjs()) : null;
  }, [type]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, []);

  const PickerWithType = ({ type }) => {
    const handleDateChange = (date) => {
      if (type === "week") {
        setDateWeek(date);
      } else if (type === "month") {
        setDate(date);
      } else if (type === "custom") {
        null;
      } else if (type === "year") {
        setDate(date);
      }
    };

    const disabledDate = (current) => {
      const currentYear = current.year();
      return currentYear < 2024 || current > dayjs();
    };

    if (type === "custom") {
      return null;
    } else if (type === "week") {
      return (
        <DatePicker
          value={dateWeek ? dateWeek : undefined}
          picker={type}
          onChange={handleDateChange}
          format="YYYY MMM wo"
          disabledDate={disabledDate}
        />
      );
    } else if (type === "month") {
      return (
        <DatePicker
          value={date ? date : undefined}
          picker={type}
          onChange={handleDateChange}
          disabledDate={disabledDate}
          format="MMM YYYY"
        />
      );
    }
    return (
      <DatePicker
        value={date ? date : undefined}
        picker={type}
        onChange={handleDateChange}
        disabledDate={disabledDate}
      />
    );
  };

  const handleTypeChange = (value) => {
    setType(value);
  };

  const handleDateCustomChange = (value) => {
    setCustomDate([value?.[0], value?.[1]]);
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        //min:0,
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
      x: {
        offset: 10,
        grid: {
          display: false,
          borderColor: "transparent",
          borderWidth: 0.1,
        },
      },
    },
  };

  return loading ? (
    <Card
      bordered={false}
      // style={{
      //   margin: "15px 15px 10px 15px",
      //   background: "#fff",
      //   minWidth: "65%",
      // }}
    >
      <Skeleton
        active
        paragraph={{
          rows: 7,
        }}
      />
    </Card>
  ) : (
    <Card
      bordered={false}
      // style={{
      //   margin: "15px 15px 10px 15px",
      //   background: "#fff",
      //   minWidth: "65%",
      // }}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <Text className="text-lg font-normal text-neutral-500 -mb-1">
              Total
            </Text>
            <Text className="text-xl font-bold">Company Analysis</Text>
          </div>
          <div className="flex">
            <div className="mr-2"></div>
            <Space>
              <Select
                value={type}
                onChange={handleTypeChange}
                style={{ width: "100px" }}
                defaultValue={type}
              >
                <Option value="custom">Custom</Option>
                <Option value="week">Week</Option>
                <Option value="month">Month</Option>
                <Option value="year">Year</Option>
              </Select>
              <PickerWithType type={type} />
              {type === "custom" && (
                <RangePicker
                  value={customDate ? customDate : undefined}
                  style={{ width: 250 }}
                  onChange={handleDateCustomChange}
                  disabledDate={(current) => {
                    const currentYear = current.year();
                    return currentYear < 2024 || current > dayjs();
                  }}
                />
              )}
            </Space>
          </div>
        </div>
        <div className="min-h-52 md:min-h-80">
          {loadChart ? (
            <div>
              <Skeleton active />
              <Skeleton active className="mt-6" />
            </div>
          ) : lineData ? (
            <Line data={lineData} options={options} />
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default Chart;
