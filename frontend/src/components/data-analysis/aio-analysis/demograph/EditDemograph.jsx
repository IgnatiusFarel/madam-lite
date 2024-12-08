import { useState, useEffect, useContext } from "react";
import { Button, Form, Modal, Select } from "antd";
import StatusModal from "../../../StatusModal";
import EditIcon from "../../../../assets/Edit.svg";
import http from "../../../../utils/http";
import { FormContext } from "../FormContext";

const EditDemograph = ({ open, setOpen, demographData }) => {
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [form] = Form.useForm();
  const [valueOptions, setValueOptions] = useState([]);
  const { editDataDemograph } = useContext(FormContext);

  useEffect(() => {
    fetchParameterOptions();
  }, [open]);

  const fetchParameterOptions = () => {
    http
      .get("/demograph?size=-1")
      .then((response) => {
        const { data } = response;
        if (data) {
          const selectedDemograph = data.find(
            (option) => option?.parameter_name === demographData?.parameter_name
          );
          if (selectedDemograph) {
            const options = selectedDemograph.list_of_options.map((option) => ({
              id: option.demograph_option_id,
              value: option.option_value,
              label: option.option_value,
              result: option.result_value,
            }));
            setValueOptions(options);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching parameter options:", error);
      });
  };

  useEffect(() => {
    if (demographData) {
      form.setFieldsValue({
        parameter_name: demographData?.parameter_name,
        custom_result_parameter: demographData.custom_result_parameter
          ? demographData.custom_result_parameter
          : demographData.parameter_name,
        demograph_option_id: demographData?.demograph_option_id,
        option_value: demographData?.option_value,
        result_value: demographData?.result_value,
      });
    }
  }, [demographData]);

  const handleOptionChange = (value, option) => {
    form.setFieldsValue({
      demograph_option_id: option.id,
      result_value: option.result ? option.result : option.value,
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setValueOptions([]);
    setOpen(false);
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        editDataDemograph(values);
        setModalMessage("Demograph edited successfully!");
        setModalStatus("success");
        form.resetFields();
        setOpen(false);
        setOpenStatusModal(true);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={EditIcon}
              alt="Plus"
              className="menu-icon"
              style={{ marginRight: 10, height: 40, width: 40 }}
            />
            <span>Edit Demograph</span>
          </div>
        }
        centered
        visible={open}
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
            name="parameter_name"
            label="Parameter Name"
            style={{ marginBottom: 10 }}
            rules={[{ required: true, message: "Please enter parameter name" }]}
          >
            <Select disabled />
          </Form.Item>
          <Form.Item noStyle name="custom_result_parameter"></Form.Item>
          <Form.Item noStyle name="demograph_option_id"></Form.Item>

          <Form.Item
            name="option_value"
            label="Select Option"
            style={{ marginBottom: 10 }}
            rules={[
              {
                required: true,
                message: "Please select an option",
              },
            ]}
          >
            <Select options={valueOptions} onChange={handleOptionChange} />
          </Form.Item>
          <Form.Item noStyle name="result_value"></Form.Item>

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
