import { useState } from "react";
import { Badge, Button, Descriptions, Modal } from "antd";
import EditDemograph from "./EditDemograph";
import InfoIcon from "../../../assets/Info.svg";

const DetailDemograph = ({ open, setOpen, demographData, fetchData, setPage }) => {
  const [openEditDemograph, setOpenEditDemograph] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = () => {
    setOpen(false);
    setOpenEditDemograph(true);
  };

  const formatUpdatedAt = (updatedAt) => {
    const date = new Date(updatedAt);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const items = [
    {
      key: "parameter_name",
      label: "Parameter Name",
      children: demographData?.parameter_name,
      span: 3,
      labelStyle: { background: "#F8F8F8" },
      contentStyle: { background: "#F8F8F8", textAlign: "right" },
    },
    {
      key: "custom_result_parameter",
      label: "Custom Result Parameter",
      children: demographData?.custom_result_parameter,
      span: 3,
      labelStyle: { background: "#ffffff" },
      contentStyle: { background: "#ffffff", textAlign: "right" },
    },
    {
      key: "number_of_options",
      label: "Number of Options",
      children: demographData?.number_of_options,
      span: 3,
      labelStyle: { background: "#F8F8F8" },
      contentStyle: { background: "#F8F8F8", textAlign: "right" },
    },
    {
      key: "list_of_options",
      label: "List of Options",
      children: demographData?.list_of_options.map((option) => (
        <Badge
          key={option.demograph_option_id}
          count={option.option_value}
          showZero
          color="#F6F6F6"
          style={{
            borderColor: "#BBBBBB",
            color: "#000000",
            margin: "5px 0 0 3px",
          }}
        />
      )),
      span: 3,
      labelStyle: { background: "#ffffff" },
      contentStyle: { background: "#ffffff", textAlign: "right" },
    },
    {
      key: "updated_at",
      label: "Updated At",
      children: formatUpdatedAt(demographData?.updated_at),
      span: 3,
      labelStyle: { background: "#F8F8F8" },
      contentStyle: { background: "#F8F8F8", textAlign: "right" },
    },
  ];

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={InfoIcon}
              alt="Plus"
              className="menu-icon"
              style={{ marginRight: 10, height: 40, width: 40 }}
            />
            <span>Detail Demograph</span>
          </div>
        }
        centered={true}
        width={600}
        visible={open}
        onCancel={handleClose}
        footer={
          <div className="mt-7" style={{ textAlign: "center" }}>
            <Button className="mr-3" onClick={handleEdit}>
              Edit Data
            </Button>
            <Button type="primary" onClick={handleClose}>
              Back
            </Button>
          </div>
        }
      >
        
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <hr style={{ flex: 1, borderColor: "lightgray", margin: 0 }} />
        </div>
        {demographData && (
          <Descriptions
            bordered
            items={items}
            size="middle"
            labelStyle={{ width: "50%" }}
          />
        )}
      </Modal>
      <EditDemograph
        open={openEditDemograph}
        setOpen={setOpenEditDemograph}
        demographData={demographData}
        fetchData={fetchData}
        setPage={setPage}
      />
    </>
  );
};

export default DetailDemograph;
