import { useEffect, useState } from "react";
import { Input, Layout, Table, Typography } from "antd";
import http from "../../utils/http";

const { Text } = Typography;
const { Search } = Input;
const { Content } = Layout;

const ActivityHistoryList = () => {
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const role = JSON.parse(sessionStorage.getItem("userData"))?.role;

  const columns = [
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          No
        </Text>
      ),
      key: "no",
      width: "7%",
      render: (text, record, index) => (page - 1) * 10 + index + 1,
      filteredValue: [search],
      onFilter: (value, record) => {
        return (
          String(record.username)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase()) ||
          String(record.activity)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase())
        );
      },
    },
    role === "superadmin" && {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Username
        </Text>
      ),
      key: "username",
      dataIndex: "username",
      sorter: true,
    },
    {
      title: <Text className="text-gray-500 font-normal">Activity </Text>,
      key: "activity",
      dataIndex: "activity",
    },
    {
      title: <Text className="text-gray-500 font-normal">Time at</Text>,
      key: "created_at",
      dataIndex: "created_at",
      sorter: true,
      render: (text) => {
        const date = new Date(text);
        return `${
          date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
        }/${
          date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1
        }/${date.getFullYear()} ${
          date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
        }:${
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
        }:${
          date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
        }`;
      },
      width: "20%",
    },
  ].filter(Boolean);

  const fetchData = (page, shouldFetchData) => {
    if (shouldFetchData) {
      setLoading(true);
      let url = `/activity-history?page=${page}&search=${search}&size=${size}`;
      if (sortField && sortOrder) {
        url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      }
      http
        .get(url)
        .then((response) => {
          setData(response.data);
          setTotalData(response.totalActivityHistory);
          setLoading(false);
        })
        .catch((error) => error.response);
    }
  };

  useEffect(() => {
    fetchData(page, true);
  }, [page, search, size, sortField, sortOrder]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPage(pagination.current);
    setSize(pagination.pageSize);
    if (sorter.field && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === "ascend" ? "ASC" : "DESC");
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

  return (
    <>
      <Content className="p-6">
        <Text className="text-2xl font-normal">Activity History</Text>
        <br />
        <div className="flex items-center justify-between w-full h-auto">
          <Search
            placeholder="Search Activity"
            className="mt-2 mb-2"
            style={{
              width: 250,
            }}
            onSearch={(value) => setSearch(value)}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
        <Table
          className="mt-3 overflow-x-auto max-w-full"
          columns={columns}
          rowKey={(record) => record.activity_history_id}
          dataSource={data}
          pagination={{
            pageSize: size,
            total: totalData,
            current: page,
            onChange: (page) => {
              setPage(page);
            },
            onShowSizeChange: (current, size) => {
              setSize(size);
            },
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Content>
    </>
  );
};

export default ActivityHistoryList;
