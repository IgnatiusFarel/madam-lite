import { useState, useEffect, useContext } from "react";
import { Button, Typography, Checkbox, Row, Col, notification } from "antd";
import { PiCheckCircleLight } from "react-icons/pi";
import { TfiArrowCircleLeft } from "react-icons/tfi";
import PsychographIcon from "../../../assets/Psychograph.svg";
import http from "../../../utils/http";
import { FormContext } from "./FormContext";

const { Text } = Typography;

const Psychograph = ({ onPrevious, onNext }) => {
  const [categories, setCategories] = useState({
    activity: [],
    interest: [],
    opinion: [],
  });
  const { data, updateDataPsychograph } = useContext(FormContext);
  useEffect(() => {
    fetchData();
  }, [data.psychograph]);

  const fetchData = () => {
    if (data.psychograph && Object.keys(data.psychograph).length > 0) {
      setCategories(data.psychograph);
    }
    http
      .get(`psychograph?size=-1`)
      .then((response) => {
        const { data } = response;
        const categorizedData = categorizeData(data);

        setCategories((prevCategories) => {
          const updatedCategories = { ...prevCategories };

          Object.keys(updatedCategories).forEach((category) => {
            const currentOptions = new Set(
              updatedCategories[category].map((item) => item.psychograph_id)
            );
            const newOptions = categorizedData[category] || [];

            const optionsToAdd = newOptions.filter(
              (option) => !currentOptions.has(option.psychograph_id)
            );

            updatedCategories[category] = [
              ...updatedCategories[category],
              ...optionsToAdd.map((option) => ({ ...option, checked: false })),
            ];
          });

          return updatedCategories;
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const categorizeData = (data) => {
    const categorized = {
      activity: [],
      interest: [],
      opinion: [],
    };

    data.forEach((item) => {
      categorized[item.type].push({
        psychograph_id: item.psychograph_id,
        option_name: item.option_value,
        checked: false,
      });
    });

    return categorized;
  };

  const handlePrevious = () => {
    updateDataPsychograph(categories);
    console.log(data.psychograph);
    onPrevious();
  };

  const handleNext = () => {
    notification.destroy();
    const totalCheckedItems = Object.values(categories).reduce(
      (acc, curr) => acc + curr.filter((item) => item.checked).length,
      0
    );

    if (totalCheckedItems < 1) {
      notification.error({
        message: "Notification",
        description: "Please select at least one psychograph option.",
        duration: 2,
      });
    } else {
      onNext();
      updateDataPsychograph(categories);
    }
  };

  const onChangeCheckbox = (categoryId, itemId, checked) => {
    const updatedCategories = { ...categories };

    updatedCategories[categoryId] = updatedCategories[categoryId].map(
      (item) => {
        if (item.psychograph_id === itemId) {
          return { ...item, checked };
        }
        return item;
      }
    );

    setCategories(updatedCategories);
  };

  const handleTypeCheckboxChange = (categoryType, checked) => {
    const updatedCategories = { ...categories };

    updatedCategories[categoryType] = updatedCategories[categoryType].map(
      (item) => ({ ...item, checked })
    );

    setCategories(updatedCategories);
  };

  return (
    <div className="flex flex-col p-6">
      <div className="flex items-center mb-3">
        <img
          src={PsychographIcon}
          alt="psychograph"
          className="menu-icon"
          style={{ height: 40, width: 40 }}
        />
        <Text className="text-2xl font-normal ml-2">Psychograph</Text>
      </div>

      {Object.entries(categories).map(([categoryType, items]) => (
        <div key={categoryType}>
          <div className="mb-2">
            <Checkbox
              className="mt-5"
              onChange={(e) =>
                handleTypeCheckboxChange(categoryType, e.target.checked)
              }
              indeterminate={
                items.some((item) => item.checked) &&
                !items.every((item) => item.checked)
              }
              checked={items.every((item) => item.checked)}
            >
              <Text className="text-md font-bold">
                {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
              </Text>
            </Checkbox>
          </div>
          <Row gutter={[0, 6]}>
            {items.map((item) => (
              <Col key={item.psychograph_id} span={12}>
                <Checkbox
                  onChange={(e) =>
                    onChangeCheckbox(
                      categoryType,
                      item.psychograph_id,
                      e.target.checked
                    )
                  }
                  checked={item.checked}
                >
                  {item.option_name}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <div className="flex item-right justify-end mt-3">
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
          style={{ width: 110, height: 37 }}
        >
          <span className="mr-2">Preview</span>
          <PiCheckCircleLight />
        </Button>
      </div>
    </div>
  );
};

export default Psychograph;
