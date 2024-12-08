import { useState } from "react";
import { Button, Descriptions, Modal } from "antd";
import EditUser from "./EditUser";
import InfoIcon from "../../../assets/Info.svg";

const DetailUser = ({ open, setOpen, userData, fetchData, setPage }) => {
  const [openEditUser, setOpenEditUser] = useState(false);
  const handleClose = () => {
    setOpen(false); 
  };

  const handleEdit = () => {
    setOpen(false); 
    setOpenEditUser(true); 
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
      key: "name",
      label: "Name",
      children: userData?.name,
      span: 3,
      labelStyle: { background: "#F8F8F8" },
      contentStyle: { background: "#F8F8F8", textAlign: "right" },
    },
    {
      key: "username",
      label: "Username",
      children: userData?.username,
      span: 3,
      labelStyle: { background: "#ffffff" },
      contentStyle: { background: "#ffffff", textAlign: "right" },
    },
    {
      key: "email",
      label: "Email",
      children: userData?.email,
      span: 3,
      labelStyle: { background: "#F8F8F8" },
      contentStyle: { background: "#F8F8F8", textAlign: "right" },
    },
    {
      key: "updated_at",
      label: "Updated at",
      children: formatUpdatedAt(userData?.updated_at),
      span: 3,
      labelStyle: { background: "#ffffff" },
      contentStyle: { background: "#ffffff", textAlign: "right" },
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
            <span>Detail User</span>
          </div>
        }
        centered={true}
        open={open}
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
      
        {userData && <Descriptions bordered items={items} size="middle" />}
      </Modal>
      
      <EditUser
        open={openEditUser}
        setOpen={setOpenEditUser}
        userData={userData}
        fetchData={fetchData}
        setPage={setPage}
      />
    </>
  );
};

export default DetailUser;
