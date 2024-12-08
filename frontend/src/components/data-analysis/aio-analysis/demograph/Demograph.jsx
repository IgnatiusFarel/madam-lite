import { useContext, useState } from "react";
import { Button, Empty, Table, Typography, notification, } from "antd";
import { FiPlus } from "react-icons/fi";
import { TfiArrowCircleLeft, TfiArrowCircleRight } from "react-icons/tfi";
import DemographIcon from "../../../../assets/Demograph.svg";
import AddDemograph from "./AddDemograph";
import DeleteDemograph from "./DeleteDemograph";
import EditDemograph from "./EditDemograph";
import { FormContext } from "../FormContext";

const { Text } = Typography;

const Demograph = ({ onPrevious, onNext }) => {
  const [selectedDemograph, setSelectedDemograph] = useState(null);
  const [openAddDemograph, setOpenAddDemograph] = useState(false);
  const [openDeleteDemograph, setOpenDeleteDemograph] = useState(false);
  const [openEditDemograph, setOpenEditDemograph] = useState(false);
  const { data } = useContext(FormContext);
  

  const handlePrevious = () => {
    onPrevious();
  };

  const handleNext = () => {
    notification.destroy();
    if (data.demograph.length < 1) {
      notification.error({
        message: 'Notification',
        description: 'Please add at least one demograph data.',
      });
    } else {
      onNext();
    }
  };

  const handleEdit = (record) => {
    setSelectedDemograph(record);
    setOpenEditDemograph(true);
  };
  const handleDelete = (record) => {
    setSelectedDemograph(record);
    setOpenDeleteDemograph(true);
  };

  const handleAddDemograph = () => {
    setOpenAddDemograph(true);
  };

  const columns = [
    {
      title: <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">No</Text>,
      key: "no",
      width: "7%",
      render: (text, record, index) => index + 1,
    },
    {
      title: <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">Parameter Name</Text>,
      key: "parameter_name",
      dataIndex: "parameter_name",
    },
    {
      title: <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">Selected Option</Text>,
      key: "option_value",
      dataIndex: "option_value",
    },
    {
      title: <Text className="text-gray-500 font-normal whitespace-nowrap sm:inline-block">Action</Text>,
      key: "action",
      width: "18%",
      render: (text, record) => (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            className="bg-amber-400 hover:bg-amber-300 text-white px-4 rounded-lg mr-1"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button type="primary" onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col px-6 py-5">
      <div className="flex items-center mb-1 justify-between">
        <div className="flex items-center">
          <img
            src={DemographIcon}
            alt="Demograph"
            className="menu-icon"
            style={{ height: 40, width: 40 }}
          />
          <Text className="text-2xl font-normal ml-2">Demograph</Text>
        </div>
        <Button
          type="primary"
          className="rounded-xl focus:outline-none focus:shadow-outline items-center justify-center h-10 py-2 px-4 flex items-center"
          onClick={handleAddDemograph}
        >
          <FiPlus className="mr-2" />
          Add Demograph
        </Button>
      </div>
      <Table
        className="mt-3 overflow-x-auto max-w-full"
        columns={columns}
        dataSource={data.demograph}
        pagination={false}
        tableLayout="fixed"
        data
        rowKey={(record) => record.parameter_name}
        style={{ height: 310 }}
        {...(data.demograph.length > 5 ? { scroll: { y: 270 } } : {})}
        locale={{
          emptyText: (
            <div style={{ height: 210 }} className="items-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No Data Demograph"
              />
            </div>
          ),
        }}
      />
      <div></div>
      <AddDemograph open={openAddDemograph} setOpen={setOpenAddDemograph} />
      <DeleteDemograph
        open={openDeleteDemograph}
        setOpen={setOpenDeleteDemograph}
        demographData={selectedDemograph}
      />
      <EditDemograph
        open={openEditDemograph}
        setOpen={setOpenEditDemograph}
        demographData={selectedDemograph}
      />
      <div className="flex justify-end mt-2">
        <Button
          type="default"
          className="rounded-xl mr-4 flex items-center justify-center"
          onClick={handlePrevious}
          style={{ width: 120, height: 37 }}
        >
          <span className="mr-2">
            <TfiArrowCircleLeft />
          </span>
          Previous
        </Button>
        <Button
          type="primary"
          className="rounded-xl flex items-center justify-center"
          onClick={handleNext}
          style={{ width: 90, height: 37 }}
        >
          <span className="mr-2">Next</span>
          <TfiArrowCircleRight />
        </Button>
      </div>
    </div>
  );
};

export default Demograph;
