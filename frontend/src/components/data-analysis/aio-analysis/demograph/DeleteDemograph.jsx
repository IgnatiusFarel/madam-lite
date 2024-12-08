import { useContext, useState } from "react";
import { Button, Modal, Typography } from "antd";
import StatusModal from "../../../StatusModal";
import ConfirmDelete from "../../../../assets/ConfirmDelete.svg";
import { FormContext } from "../FormContext";

const { Text } = Typography;

const DeleteDemograph = ({ open, setOpen, demographData }) => {
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const { removeDemograph } = useContext(FormContext);

  const handleDelete = () => {
    removeDemograph(demographData);
    setModalMessage("Demograph has been deleted successfully.");
    setModalStatus("success");
    setOpen(false);
    setOpenStatusModal(true);
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
              <Button type="primary" onClick={handleDelete}>
                Yes, delete
              </Button>
            </div>
          </>
        }
      >
        <div className="flex justify-center mb-3">
          <img src={ConfirmDelete} alt="Confirm Delete" />
        </div>
        <div className="flex justify-center mb-3">
          <Text className="text-xl font-semibold text-center">
            Are you sure to delete demograph{" "}
            {"'" + demographData?.parameter_name + "'?"}
          </Text>
        </div>
        <div className="flex justify-center mb-7 text-center">
          <Text className="text-gray-400 text-base">
            This item has been permanently removed. You can add it back later.
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

export default DeleteDemograph;
