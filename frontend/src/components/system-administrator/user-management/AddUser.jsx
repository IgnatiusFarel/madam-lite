import { useState } from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import http from "../../../utils/http";
import StatusModal from "../../StatusModal";
import PlusIcon from "../../../assets/Plus.svg";

const AddUser = ({ open, setOpen }) => {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      http
        .post("/users", values)
        .then((res) => {
          const { message, status } = res;
          setModalMessage(message);
          setModalStatus(status === "success" ? "success" : "failed");
          form.resetFields();
          setOpen(false);
          setOpenStatusModal(true);
        })
        .catch((error) => {
          const errorData = error.data.message;
          if (errorData && Array.isArray(errorData)) {
            const fieldErrors = [];
            errorData.forEach((errorObj) => {
              const errorMessage = errorObj.message;
              switch (errorMessage) {
                case "Username is already taken":
                  fieldErrors.push({
                    name: "username",
                    errors: ["Username is already taken."],
                  });
                  break;
                case "Email is already taken":
                  fieldErrors.push({
                    name: "email",
                    errors: ["Email is already taken."],
                  });
                  break;
                case "Name is already taken":
                  fieldErrors.push({
                    name: "name",
                    errors: ["Name is already taken."],
                  });
                  break;
                default:
                  console.error("Unhandled error message:", errorMessage);
                  break;
              }
            });
            form.setFields(fieldErrors);
          } else {
            console.error("Unexpected error occurred:", error);
          }
        })
        .catch((error) => {
          console.log("Validation failed:", error.data);
        });
    });
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={PlusIcon}
              alt="Plus"
              className="menu-icon"
              style={{ marginRight: 10, height: 40, width: 40 }}
            />
            <span>Add User</span>
          </div>
        }
        centered
        open={open}
        onCancel={handleCancel}
        width={400}
        maskClosable={false}
        destroyOnClose={true}
        footer={null}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <hr style={{ flex: 1, borderColor: "lightgray", margin: 0 }} />
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Name"
            style={{ marginBottom: 10 }}
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input style={{ height: 40 }} placeholder="Enter Name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            style={{ marginBottom: 10 }}
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input style={{ height: 40 }} placeholder="Enter Username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            style={{ marginBottom: 10 }}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input style={{ height: 40 }} placeholder="Enter Email" />
          </Form.Item>

          {userData.role == "superadmin" && (
            <Form.Item
              name="role"
              label="Choose Role"
              className="mb-3"
              rules={[{ required: true, message: "Please choose role" }]}
            >
              <Select placeholder="Select Role" style={{ height: 40 }}>
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="password"
            label="Password"
            style={{ marginBottom: 10 }}
            rules={[
              { required: true, message: "Please enter password" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                validator: (_, value) => {
                  const hasUppercase = /[A-Z]/.test(value);
                  const hasLowercase = /[a-z]/.test(value);
                  const hasSpecialChar =
                    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

                  if (!hasUppercase || !hasLowercase || !hasSpecialChar) {
                    return Promise.reject(
                      "Password must contain at least one uppercase letter, one lowercase letter, and one special character"
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              style={{ height: 40 }}
              placeholder="Enter Password"
            />
          </Form.Item>

          <div className="mt-7" style={{ textAlign: "center" }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </Form>
      </Modal>
      <StatusModal
        open={openStatusModal}
        setOpen={setOpenStatusModal}
        message={modalMessage}
        status={modalStatus}
      />
    </>
  );
};

export default AddUser;
