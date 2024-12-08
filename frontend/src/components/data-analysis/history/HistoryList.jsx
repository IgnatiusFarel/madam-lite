import { useEffect, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa6";
import { Button, Input, Layout, Table, Typography } from "antd";
import http from "../../../utils/http";
import DetailHistory from "./DetailHistory";
import { useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;
const { Search } = Input;
const { Content } = Layout;

const HistoryList = () => {
  const navigate = useNavigate();
  const params = useParams("page");
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    if (params) {
      navigate(``, { replace: true });
    }
  }, []);

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
          String(record.company_name)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase()) ||
          String(record.contact_person_name)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase()) ||
          String(record.industry)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase())
        );
      },
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Company Name
        </Text>
      ),
      key: "company_name",
      dataIndex: "company_name",
      sorter: true,
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Industry
        </Text>
      ),
      key: "industry",
      dataIndex: "industry",
      sorter: true,
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          {" "}
          PIC Name{" "}
        </Text>
      ),
      key: "contact_person_name",
      dataIndex: "contact_person_name",
      sorter: true,
      width: "20%",
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          AIO Score
        </Text>
      ),
      key: "total_aio_score",
      dataIndex: "total_aio_score",
      sorter: true,
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Submitted at
        </Text>
      ),
      key: "submitted_at",
      dataIndex: "submitted_at",
      sorter: true,
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
      width: "15%",
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Action
        </Text>
      ),
      dataIndex: "",
      key: "action",
      width: "18%",
      render: (text, record) => (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            key={`detail-${record.aio_analysis_response_id}`}
            className="bg-amber-400 hover:bg-amber-300 text-white px-4 rounded-lg mr-1"
            style={{ paddingTop: 5, paddingBottom: 5 }}
            onClick={() => handleDetail(record)}
          >
            Detail
          </Button>
          <Button
            type="primary"
            key={`exportPDF-${record.aio_analysis_response_id}`}
            onClick={() => handleExportPDF(record)}
          >
            PDF
            <span className="ml-2">
              <FaRegFilePdf />
            </span>
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = (page, shouldFetchData) => {
    if (shouldFetchData) {
      setLoading(true);
      let url = `/aio-analysis?page=${page}&search=${search}`;
      if (sortField && sortOrder) {
        url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      }
      http
        .get(url)
        .then((response) => {
          setData(response.data);
          setTotalData(response.totalDemograph);
          setLoading(false);
        })
        .catch((error) => error.response);
    }
  };

  useEffect(() => {
    fetchData(page, true);
  }, [page, search, sortField, sortOrder]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPage(pagination.current);
    if (sorter.field && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === "ascend" ? "ASC" : "DESC");
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search]);

  const handleDetail = (record) => {
    setSelectedHistory(record);
    setShowDetail(true);
  };

  const handleExportPDF = (record) => {
    setSelectedHistory(record);
    window.open(
      `/history/export-pdf/${record.aio_analysis_response_id}`,
      "_blank"
    );
  };

  return (
    <>
      {showDetail ? (
        <DetailHistory
          history={selectedHistory}
          setShowDetail={setShowDetail}
        />
      ) : (
        <Content className="p-6">
          <Text className="text-2xl font-normal">History</Text>
          <br />
          <div className="flex items-center justify-between w-full h-auto">
            <Search
              placeholder="Search History"
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
            rowKey={(record) => record.aio_analysis_response_id}
            dataSource={data}
            pagination={{
              pageSize: 10,
              total: totalData,
              current: page,
              onChange: (page) => {
                fetchData(page, true);
                setPage(page);
              },
            }}
            loading={loading}
            onRow={(record) => ({
              onClick: () => setSelectedHistory(record),
            })}
            onChange={handleTableChange}
          />
        </Content>
      )}
    </>
  );
};

export default HistoryList;
