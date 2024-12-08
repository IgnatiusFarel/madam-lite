import { useState } from "react";
import { Button, Table, Typography } from "antd";
import DeletePsychograph from "./DeletePsychograph";
import EditPsychograph from "./EditPsychograph";

const { Text } = Typography;

const ActivityList = ({
  data,
  loading,
  page,
  setPage,
  totalData,
  fetchData,
  search,
  setSortField,
  setSortOrder,
}) => {
  const [selectedPsychograph, setSelectedPsychograph] = useState(null);
  const [openEditPsychograph, setOpenEditPsychograph] = useState(false);
  const [openDeletePsychograph, setOpenDeletePsychograph] = useState(false);

  const columns = [
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          No
        </Text>
      ),
      key: "no",
      width: "7%",
      filteredValue: [search],
      render: (text, record, index) => (page - 1) * 10 + index + 1,
      onFilter: (value, record) => {
        return String(record.option_value)
          .toLocaleLowerCase()
          .includes(value.toLocaleLowerCase());
      },
    },
    {
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Option Name
        </Text>
      ),
      key: "option_value",
      dataIndex: "option_value",
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
      title: (
        <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">
          Action
        </Text>
      ),
      dataIndex: "",
      key: "action",
      width: "20%",
      render: (text, record) => (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            className="bg-amber-400 hover:bg-amber-300 text-white px-4 rounded-lg mr-1"
            style={{ paddingTop: 5, paddingBottom: 5 }}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            onClick={() => handleDeletePsychograph(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

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

  const handleEdit = (record) => {
    setSelectedPsychograph(record);
    setOpenEditPsychograph(true);
  };

  const handleDeletePsychograph = (record) => {
    setSelectedPsychograph(record);
    setOpenDeletePsychograph(true);
  };

  return (
    <div>
      <Table
        className="mt-3 overflow-x-auto max-w-full"
        columns={columns}
        rowKey={(record) => record.psychograph_id}
        dataSource={data}
        pagination={{
          pageSize: 10,
          total: totalData,
          current: page,
          onChange: (page) => {
            fetchData("activity", page, true);
            setPage(page);
          },
        }}
        loading={loading}
        onRow={(record) => ({
          onClick: () => setSelectedPsychograph(record),
        })}
        onChange={handleTableChange}
      />
      <EditPsychograph
        open={openEditPsychograph}
        setOpen={setOpenEditPsychograph}
        psychographData={selectedPsychograph}
        fetchData={() => fetchData("activity", page, true)}
      />
      <DeletePsychograph
        open={openDeletePsychograph}
        setOpen={setOpenDeletePsychograph}
        psychographData={selectedPsychograph}
        fetchData={() => fetchData("activity", page, true)}
      />
    </div>
  );
};

export default ActivityList;
