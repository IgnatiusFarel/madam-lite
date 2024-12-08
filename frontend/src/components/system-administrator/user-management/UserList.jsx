import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Input, Layout, Table, Typography } from "antd";
import AddUser from "./AddUser";
import DeleteUser from "./DeleteUser";
import DetailUser from "./DetailUser";
import http from "../../../utils/http";

const { Text } = Typography;
const { Search } = Input;
const { Content } = Layout;

const UserList = () => {
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openDetailUser, setOpenDetailUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

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
          String(record.name)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase()) ||
          String(record.username)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase())
        );
      },
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Name
        </Text>
      ),
      key: "name",
      dataIndex: "name",
      sorter: true,
    },
    {
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
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Role
        </Text>
      ),
      key: "role",
      dataIndex: "role",
      sorter: true,
    },

    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Updated at
        </Text>
      ),
      key: "updated_at",
      dataIndex: "updated_at",
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
      width: "20%",
    },
    {
      title: <Text className="text-gray-500 font-normal">Action</Text>,
      dataIndex: "",
      key: "action",
      width: "20%",
      render: (text, record) => (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            key={`detail-${record.id}`}
            className="bg-amber-400 hover:bg-amber-300 text-white px-4 rounded-lg mr-1"
            style={{ paddingTop: 5, paddingBottom: 5 }}
            onClick={() => handleDetail(record)}
          >
            Detail
          </Button>
          <Button
            type="primary"
            key={`delete-${record.id}`}
            onClick={() => handleDeleteUser(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = (page, shouldFetchData) => {
    if (shouldFetchData) {
      setLoading(true);
      let url = `/users?page=${page}&search=${search}`;
      if (sortField && sortOrder) {
        url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      }
      http
        .get(url)
        .then((response) => {
          setData(response.data);
          setTotalData(response.totalUsers);
          setLoading(false);
        })
        .catch((error) => error);
    }
  };

  useEffect(() => {
    fetchData(page, true);
  }, [page, search, openDeleteUser, openAddUser, sortField, sortOrder]);

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
    setSelectedUser(record);
    setOpenDetailUser(true);
  };

  const handleDeleteUser = (record) => {
    setSelectedUser(record);
    setOpenDeleteUser(true);
  };

  return (
    <>
      <Content className="p-6">
        <Text className="text-2xl font-normal">System Administrator</Text>
        <br />
        <div className="flex items-center justify-between w-full h-auto">
          <Search
            placeholder="Search User"
            className="mt-2 mb-2"
            style={{
              width: 250,
            }}
            onSearch={(value) => setSearch(value)}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Button
            type="primary"
            className="rounded-xl focus:outline-none focus:shadow-outline items-center justify-center py-4 md:h-10 md:py-2 md:px-4 flex items-center"
            onClick={() => setOpenAddUser(true)}
          >
            <FiPlus className="mr-2" />
            Add User
          </Button>
        </div>

        <Table
          className="mt-3 overflow-x-auto max-w-full"
          columns={columns}
          rowKey={(record) => record.user_id}
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
            onClick: () => setSelectedUser(record),
          })}
          onChange={handleTableChange}
        />
        <DetailUser
          open={openDetailUser}
          setOpen={setOpenDetailUser}
          userData={selectedUser}
          fetchData={fetchData}
          setPage={setPage}
        />
        <DeleteUser
          open={openDeleteUser}
          setOpen={setOpenDeleteUser}
          userData={selectedUser}
          fetchData={fetchData}
        />
        <AddUser open={openAddUser} setOpen={setOpenAddUser} />
      </Content>
    </>
  );
};

export default UserList;
