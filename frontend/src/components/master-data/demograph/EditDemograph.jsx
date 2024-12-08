import { useEffect, useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import http from "../../../utils/http";
import StatusModal from "../../StatusModal";
import EditIcon from "../../../assets/Edit.svg";

const EditDemograph = ({
  open,
  setOpen,
  demographData,
  fetchData,
  setPage,
}) => {
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        if (!values.password) {
          delete values.password;
        }
        http
          .patch(`demograph/${demographData.demograph_id}`, values)
          .then((res) => {
            const { message, status } = res;
            setModalMessage(message);
            setModalStatus(status === "success" ? "success" : "failed");
            form.resetFields();
            setOpen(false);
            setOpenStatusModal(true);
            setPage(1);
          })
          .catch((error) => {
            const errorData = error.data.message;
            if (errorData && Array.isArray(errorData)) {
              const fieldErrors = [];
              errorData.forEach((errorObj) => {
                const errorMessage = errorObj.message;
                switch (errorMessage) {
                  case "Parameter name is already exists":
                    fieldErrors.push({
                      name: "parameter_name",
                      errors: ["Parameter name is already exists."],
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
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
  };

  useEffect(() => {
    if (demographData) {
      form.setFieldsValue({
        parameter_name: demographData?.parameter_name,
        custom_result_parameter: demographData?.custom_result_parameter,
      });
      if (demographData.list_of_options) {
        const options = demographData.list_of_options.map((option) => ({
          option_value: option?.option_value,
          result_value: option?.result_value,
        }));
        form.setFieldsValue({
          list_of_options: options,
        });
      }
    }
  }, [demographData]);

  useEffect(() => {
    if (open === false) {
      fetchData(1, true);
    }
  }, [open]);

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={EditIcon}
              className="menu-icon"
              style={{ marginRight: 10, height: 40, width: 40 }}
            />
            <span>Edit Demograph</span>
          </div>
        }
        centered
        visible={open}
        onCancel={handleCancel}
        width={600}
        maskClosable={false}
        destroyOnClose={true}
        footer={null}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <hr style={{ flex: 1, borderColor: "lightgray", margin: 0 }} />
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            list_of_options: [demographData?.list_of_options],
          }}
        >
          <Form.Item
            name="parameter_name"
            label="Parameter Name"
            style={{ marginBottom: 10 }}
            rules={[{ required: true, message: "Please enter parameter name" }]}
          >
            <Input style={{ height: 40 }} placeholder="Enter Parameter Name" />
          </Form.Item>

          <Form.Item
            name="custom_result_parameter"
            label="Custom Result Parameter"
            style={{ marginBottom: 10 }}
            rules={[
              {
                message: "Please enter custom result parameter",
              },
            ]}
          >
            <Input
              style={{ height: 40 }}
              placeholder="Enter Custom Result Parameter"
            />
          </Form.Item>

          <Form.List name="list_of_options">
            {(fields, { add, remove }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 10,
                }}
              >
                <div className="flex items-center justify-between">
                  <span>List Option Value</span>
                  <Button
                    type="primary"
                    className="rounded-xl"
                    onClick={() => add()}
                    block
                    style={{ width: 120, height: 37 }}
                  >
                    + Add Option
                  </Button>
                </div>
                <div className="flex items-center justify-between align-center -mb-2">
                  <div className="w-full">
                    <span>Option Value</span>
                  </div>
                  <div className="flex items-center justify-start align-center w-full">
                    <span>Custom Result Value</span>
                  </div>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-stretch -mb-2"
                  >
                    <Form.Item
                      name={[field.name, "option_value"]}
                      fieldKey={[field.fieldKey, "option_value"]}
                      className="mr-2"
                      style={{ marginBottom: 10, width: "46%" }}
                      rules={[
                        {
                          required: true,
                          message: "Please enter option value",
                        },
                      ]}
                    >
                      <Input
                        style={{ height: 40 }}
                        name={[field.name, "option_value"]}
                        placeholder="Enter Option Value"
                        className="mr-2"
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "result_value"]}
                      className="mr-2"
                      style={{ marginBottom: 10, width: "46%" }}
                    >
                      <Input
                        name={[field.name, "result_value"]}
                        style={{ height: 40 }}
                        placeholder="Enter Custom Result Value"
                        className="mr-2"
                      />
                    </Form.Item>
                    {index !== 0 && (
                      <CloseOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Form.List>

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

export default EditDemograph;
