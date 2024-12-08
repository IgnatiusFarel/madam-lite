import { useState, useEffect, useContext } from "react";
import { Button, Form, Modal, Select } from "antd";
import StatusModal from "../../../StatusModal";
import PlusIcon from "../../../../assets/Plus.svg";
import http from "../../../../utils/http";
import { FormContext } from "../FormContext";

const AddDemograph = ({ open, setOpen }) => {
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [form] = Form.useForm();
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [parameterNameOptions, setParameterNameOptions] = useState([]);
  const [valueOptions, setValueOptions] = useState([]);
  const { data, addDataDemograph } = useContext(FormContext);

  useEffect(() => {
    fetchParameterOptions();
  }, [data]);

  const fetchParameterOptions = () => {
    http
      .get("/demograph?size=-1")
      .then((response) => {
        const parameterOptions = response.data;
        const filteredOptions = parameterOptions.filter((option) => {
          return !data.demograph.some(
            (item) => item.parameter_name == option.parameter_name
          );
        });
        const parameterName = setParameterName(filteredOptions);
        setParameterNameOptions(parameterName);
      })
      .catch((error) => {
        console.error("Error fetching parameter options:", error);
      });
  };

  const setParameterName = (data) => {
    return data.map((item) => ({
      id: item.demograph_id,
      value: item.parameter_name,
      label: item.parameter_name,
      result: item.custom_result_parameter,
      data: item,
    }));
  };

  const handleParameterNameChange = (value, option) => {
    const selectedParameter = option.data;
    if (selectedParameter) {
      const options = selectedParameter.list_of_options.map((option) => ({
        id: option.demograph_option_id,
        value: (option.option_value && option.option_value.trim()) || '',
        label: (option.option_value && option.option_value.trim()) || '',
        result: (option.result_value && option.result_value.trim()) || '',
      }));
      form.setFieldsValue({
        demograph_id: selectedParameter.demograph_id,
        custom_result_parameter: selectedParameter.custom_result_parameter
          ? selectedParameter.custom_result_parameter
          : selectedParameter.parameter_name,
        option_value: null,
      });
      setValueOptions(options);
      setSelectedParameter(selectedParameter);
    }
  };

  const handleOptionChange = (value, option) => {
    form.setFieldsValue({
      demograph_option_id: option.id,
      result_value: option.result ? option.result : option.value,
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedParameter(null);
    setValueOptions([]);
    setOpen(false);
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        addDataDemograph(values);
        setModalMessage("Demograph added successfully!");
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
              src={PlusIcon}
              alt="Plus"
              className="menu-icon"
              style={{ marginRight: 10, height: 40, width: 40 }}
            />
            <span>Add Demograph</span>
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
          <Form.Item noStyle name="demograph_id"></Form.Item>

          <Form.Item
            name="parameter_name"
            label="Parameter Name"
            style={{ marginBottom: 10 }}
            rules={[{ required: true, message: "Please enter parameter name" }]}
          >
            <Select
              showSearch
              options={parameterNameOptions}
              onChange={handleParameterNameChange}
            />
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
            <Select
              options={valueOptions}
              disabled={!selectedParameter}
              onChange={handleOptionChange}
            />
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

export default AddDemograph;
