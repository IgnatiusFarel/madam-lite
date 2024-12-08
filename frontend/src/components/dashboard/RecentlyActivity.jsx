import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Table, Button } from "antd";
import http from "../../utils/http";
import { CgMoreO } from "react-icons/cg";

const { Text } = Typography;

const RecentlyActivity = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));

  const columns = [
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          No
        </Text>
      ),
      key: "no",
      width: "7%",
      render: (text, record, index) => index + 1,
    },
    userData?.role === "superadmin"
      ? {
          title: <Text className="text-gray-500 font-normal">Username</Text>,
          key: "username",
          dataIndex: "username",
          width: "20%",
        }
      : null,
    {
      title: <Text className="text-gray-500 font-normal">Activity</Text>,
      key: "activity",
      dataIndex: "activity",
    },
    {
      title: <Text className="text-gray-500 font-normal">Time</Text>,
      key: "created_at",
      dataIndex: "created_at",

      render: (text) => {
        const date = new Date(text);
        return `${
          date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
        }/${
          date.getMonth() < 9
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1
        }/${date.getFullYear()}`;
      },
      width: "20%",
    },
  ].filter(Boolean);

  const fetchData = (shouldFetchData) => {
    if (shouldFetchData) {
      setLoading(true);
      http
        .get("/activity-history?size=5")
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => error.response);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  function handleViewMoreClick() {
    navigateTo("/activity-history");
  }

  return (
    <Card
      bordered={false}
      style={{
        margin: "15px 16px",
        background: "#fff",
      }}
    >
      <Text className="text-2xl font-normal">Recently Activity</Text>
      <Table
        className="mt-3 overflow-x-auto max-w-full min-h-64"
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={true}
        loading={loading}
        rowKey={(record) => record.activity_history_id}
      />
      {data.length >= 5 && (
        <div className="flex justify-end mt-3">
          <Button
            type="primary"
            className="rounded-xl focus:outline-none focus:shadow-outline px-4 py-2 text-white flex items-center"
            onClick={handleViewMoreClick}
          >
            <CgMoreO className="mr-2" />
            View More
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecentlyActivity;
