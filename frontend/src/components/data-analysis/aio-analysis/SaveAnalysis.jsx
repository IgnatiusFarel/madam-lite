import { useContext, useState } from "react";
import { Button, Modal, Typography } from "antd";
import StatusModal from "../../StatusModal";
import ConfirmSaveAnalysis from "../../../assets/ConfirmSaveAnalysis.svg";
import { FormContext } from "./FormContext";
import http from "../../../utils/http";

const { Text } = Typography;

const SaveAnalysis = ({ open, setOpen, setSaved }) => {
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const { data } = useContext(FormContext);

  const handleSave = () => {
    http
      .post(`/aio-analysis`, data)
      .then((res) => {
        const { message, status } = res;
        setModalMessage(message);
        setModalStatus(status === "success" ? "success" : "failed");
        sessionStorage.setItem("recent_saved_aio", JSON.stringify(res.data));
        setSaved(true);
        setOpen(false);
        setOpenStatusModal(true);
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        setModalMessage("Failed to save AIO Analysis. Please try again.");
        setModalStatus("failed");
        setOpen(false);
        setOpenStatusModal(true);
      });
  };
  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <>
      <Modal
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={400}
        maskClosable={false}
        footer={
          <>
            <div className="flex justify-center">
              <Button className="mr-3" onClick={handleCancel}>
                No, cancel
              </Button>
              <Button type="primary" onClick={handleSave}>
                Yes, Save
              </Button>
            </div>
          </>
        }
      >
        <div className="flex justify-center mb-3">
          <img src={ConfirmSaveAnalysis} alt="Confirm Delete" />
        </div>
        <div className="flex justify-center mb-3">
          <Text className="text-xl font-semibold text-center">
            Are you sure to save analysis for company{" "}
            {"'" + data?.company_information.company_name + "'?"}
          </Text>
        </div>
        <div className="flex justify-center mb-7 text-center">
          <Text className="text-gray-400 text-base">
            This analysis has been saved. You are about to save the analysis for
            the company.
          </Text>
        </div>
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

export default SaveAnalysis;
