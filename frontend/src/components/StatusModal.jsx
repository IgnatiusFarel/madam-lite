import { Button, Modal, Typography } from "antd";
import SuccessIcon from "../assets/Success.svg";
import FailedIcon from "../assets/Failed.svg";

const { Text } = Typography;

const StatusModal = ({ open, setOpen, status, message }) => {
  const handleOkay = () => {
    setOpen(false);
  };

  const icon = status === "success" ? SuccessIcon : FailedIcon;
  const text = status === "success" ? "Success!" : "Failed!";

  return (
    <>
      <Modal
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={350}
        maskClosable={false}
        footer={
          <>
            <div className="flex justify-center">
              <Button key="submit" type="primary" onClick={handleOkay}>
                Okay
              </Button>
            </div>
          </>
        }
      >

        <div className="flex justify-center mb-3 text-center">
          <img src={icon} alt={status === "success" ? "Success" : "Failed"} />
        </div>

        <div className="flex justify-center mb-3 text-center">
          <Text className="text-xl font-semibold text-center">{text}</Text>
        </div>

        <div className="flex justify-center mb-7 text-center">
          <Text className="text-gray-400 text-base">{message}</Text>
        </div>
      </Modal>
    </>
  );
};

export default StatusModal;
