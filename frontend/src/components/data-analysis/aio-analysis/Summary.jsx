import { Typography, Button, Badge } from "antd";
import SummaryIcon from "../../../assets/Summary.svg";
import {
  PiFilePdfDuotone,
  PiFloppyDisk,
  PiHouseLineDuotone,
} from "react-icons/pi";
import { TfiArrowCircleLeft } from "react-icons/tfi";
import { FormContext } from "./FormContext";
import { useContext, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import SaveAnalysis from "./SaveAnalysis";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Quill = ReactQuill.Quill;
const Parchment = Quill.import("parchment");

Quill.register(Quill.import("attributors/style/direction"), true);
Quill.register(Quill.import("attributors/style/align"), true);
class IndentAttributor extends Parchment.Attributor.Style {
  add(node, value) {
    if (value === 0) {
      this.remove(node);
      return true;
    } else {
      return super.add(node, `${value}em`);
    }
  }
}

let IndentStyle = new IndentAttributor("indent", "text-indent", {
  scope: Parchment.Scope.BLOCK,
  whitelist: ["1em", "2em", "3em", "4em", "5em", "6em", "7em", "8em", "9em"],
});

Quill.register(IndentStyle, true);

ChartJS.register(ArcElement, Tooltip, Legend);

const { Text } = Typography;

const Summary = ({ onPrevious }) => {
  const [value, setValue] = useState("");
  const { data, setAdditionalNotes, setSaved, resetData } =
    useContext(FormContext);
  const [openSaveAnalysis, setOpenSaveAnalysis] = useState(false);
  const navigateTo = useNavigate();

  useEffect(() => {
    return () => {
      if (data.saved) {
        resetData();
        localStorage.removeItem("aio_analysis_data");
      }
    };
  }, [data.saved]);

  const companyInfo = [
    { label: "Company Name", value: data?.company_information.company_name },
    { label: "Industry", value: data?.company_information.industry },
    { label: "Address", value: data?.company_information.address },
    { label: "Full Name", value: data?.company_information.full_name },
    { label: "Email Address", value: data?.company_information.email_address },
    {
      label: "Position or Title",
      value: data?.company_information.position_or_title,
    },
    { label: "Phone Number", value: data?.company_information.phone_number },
  ];

  const getCheckedCount = (category) => {
    if (category === "all") {
      return (
        data.psychograph["activity"]?.filter((item) => item.checked).length +
        data.psychograph["interest"]?.filter((item) => item.checked).length +
        data.psychograph["opinion"]?.filter((item) => item.checked).length
      );
    }
    return data.psychograph[category]?.filter((item) => item.checked).length;
  };

  const getTotalCount = () => {
    return (
      data.psychograph["activity"]?.length +
      data.psychograph["interest"]?.length +
      data.psychograph["opinion"]?.length
    );
  };

  const calculatePercentage = (checkedCount, totalCount) => {
    return (checkedCount / totalCount) * 100;
  };

  const [pieData] = useState({
    labels: [
      `Activity (${calculatePercentage(
        getCheckedCount("activity"),
        getTotalCount()
      ).toFixed(2)}%)`,
      `Interest (${calculatePercentage(
        getCheckedCount("interest"),
        getTotalCount()
      ).toFixed(2)}%)`,
      `Opinion (${calculatePercentage(
        getCheckedCount("opinion"),
        getTotalCount()
      ).toFixed(2)}%)`,
    ],
    datasets: [
      {
        label: "Score Psychograph",
        data: [
          getCheckedCount("activity"),
          getCheckedCount("interest"),
          getCheckedCount("opinion"),
        ],
        backgroundColor: ["#DC362E", "#FF5353", "#FEC5C5"],
        borderColor: ["#DC362E", "#FF5353", "#FEC5C5"],
        borderWidth: 0,
      },
    ],
  });

  const handlePrevious = () => {
    setAdditionalNotes(value);
    onPrevious();
  };

  const handleSave = () => {
    setAdditionalNotes(value);
    setOpenSaveAnalysis(true);
  };

  const handleExportPDF = () => {
    const savedAio = JSON.parse(sessionStorage.getItem("recent_saved_aio"));
    window.open(
      `/history/export-pdf/${savedAio.aio_analysis_response_id}`,
      "_blank"
    );
  };

  const handleToDashboard = async () => {
    await resetData();
    navigateTo("/dashboard");
  };

  const handleAdditionalNotes = (value) => {
    setValue(value);
    setAdditionalNotes(value);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [
        { align: "" },
        { align: "center" },
        { align: "right" },
        { align: "justify" },
      ],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "indent",
  ];

  useEffect(() => {
    setValue(data?.additional_notes);
  }, []);

  useEffect(() => {
    const quillContainer = document.querySelector(".ql-container");
    const quillEditor = document.querySelector(".ql-editor");
    const quillToolbar = document.querySelector(".ql-toolbar");

    if (quillContainer) {
      quillContainer.style.borderRadius = "0 0 0.5rem 0.5rem";
      quillContainer.style.borderColor = data.saved ? "#d9d9d9" : "#d9d9d9";
      quillContainer.style.backgroundColor = data.saved ? "#f5f5f5" : "white";
    }
    if (quillEditor) {
      quillEditor.style.borderRadius = "0.5rem";
      quillEditor.style.backgroundColor = data.saved ? "#f5f5f5" : "white";
    }
    if (quillToolbar) {
      quillToolbar.style.borderRadius = "0.6rem 0.6rem 0 0";
      quillToolbar.style.backgroundColor = data.saved ? "#f5f5f5" : "white";
    }
  }, [data.saved]);

  return (
    <div className="flex flex-col justify-between">
      <div className="flex-grow p-6">
        <div className="grow">
          <div className="flex items-center mb-3">
            <img
              src={SummaryIcon}
              alt="summary"
              className="menu-icon"
              style={{ height: 40, width: 40 }}
            />
            <Text className="text-2xl font-normal ml-2">Summary</Text>
          </div>
          <div className="flex flex-col">
            <div>
              <Text className=" text-lg font-medium">Company Information</Text>
              <div className="flex flex-col my-1">
                {companyInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between my-1 pr-4"
                  >
                    <div className="flex w-full md:w-1/2 pr-2">
                      <Text
                        className="text-md w-full md:w-7/12"
                        style={{ width: "240px" }}
                      >
                        {info.label}
                      </Text>
                      <div className="flex justify-start w-10">
                        <Text className="text-md">:</Text>
                      </div>
                      <div className="flex justify-start w-full">
                        <Text className="text-md">{info.value}</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex flex-col md:flex-row justify-between mt-2">
            <div className="md:w-1/2 flex flex-col">
              <Text className=" text-lg font-medium"> Demograph Summary </Text>
              <div className="flex flex-col my-1">
                {data.demograph.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between my-1 pr-4"
                  >
                    <Text className="text-md w-7/12" style={{ width: "240px" }}>
                      {info.custom_result_parameter}
                    </Text>
                    <div className="flex justify-start w-10">
                      <Text className="text-md">:</Text>
                    </div>
                    <div className="flex justify-start w-full">
                      <Text className="text-md">{info.result_value}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col">
              <Text className=" text-lg font-medium"> AIO Summary </Text>
              <div className="flex flex-col my-1">
                <Text className="text-sm font-base text-gray-400">
                  Data Score
                </Text>
                <Text className="text-lg font-semibold">Psychograph</Text>
              </div>
              <div className="flex my-1 justify-start">
                <div className="w-1/4">
                  <Pie
                    data={pieData}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
                <div className="w-full ml-2 py-1 flex flex-col">
                  <div className="flex items-baseline">
                    <Badge
                      className="mt-2 ml-8"
                      color="#DC362E"
                      text={
                        <Text className="text-md font-medium">Activity </Text>
                      }
                    />
                    <Text className="text-sm ml-1 font-light">
                      {` (${calculatePercentage(
                        getCheckedCount("activity"),
                        getTotalCount()
                      ).toFixed(2)}%)`}
                    </Text>
                  </div>
                  <div className="flex items-baseline">
                    <Badge
                      className="mt-2 ml-8"
                      color="#FF5353"
                      text={
                        <Text className="text-md font-medium">Interest</Text>
                      }
                    />
                    <Text className="text-sm ml-1 font-light">
                      {` (${calculatePercentage(
                        getCheckedCount("interest"),
                        getTotalCount()
                      ).toFixed(2)}%)`}
                    </Text>
                  </div>
                  <div className="flex items-baseline">
                    <Badge
                      className="mt-2 ml-8"
                      color="#FEC5C5"
                      text={
                        <Text className="text-md font-medium">Opinion</Text>
                      }
                    />
                    <Text className="text-sm ml-1 font-light">
                      {` (${calculatePercentage(
                        getCheckedCount("opinion"),
                        getTotalCount()
                      ).toFixed(2)}%)`}
                    </Text>
                  </div>
                  <div className="ml-5 mt-1">
                    <Text className="text-lg font-semibold">AIO Score</Text>
                    <Text className="text-xl font-semibold ml-2">
                      {`${calculatePercentage(
                        getCheckedCount("all"),
                        getTotalCount()
                      ).toFixed(2)}%`}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col pb-5">
            <Text className=" text-lg font-medium"> Additional Notes </Text>
            <div className="md:w-1/2 pr-2 mt-3 h-44">
              <ReactQuill
                theme="snow"
                value={value}
                onChange={handleAdditionalNotes}
                placeholder="Enter Additional Notes"
                className="h-32"
                modules={modules}
                formats={formats}
                readOnly={data.saved}
              />
            </div>
          </div>
        </div>
        <div className="flex item-right justify-end mt-3">
          <Button
            type="default"
            className="rounded-xl mr-4 flex items-center justify-center"
            onClick={data.saved ? handleToDashboard : handlePrevious}
            style={{ width: data.saved ? 160 : 120, height: 37 }}
          >
            <span className="mr-2">
              {data.saved ? <PiHouseLineDuotone /> : <TfiArrowCircleLeft />}
            </span>
            {data.saved ? "Go to dashboard" : "Previous"}
          </Button>
          <Button
            type="primary"
            className="rounded-xl flex items-center justify-center"
            onClick={data.saved ? handleExportPDF : handleSave}
            style={{ width: data.saved ? 130 : 90, height: 37 }}
          >
            <span className="mr-2">{data.saved ? "Export PDF" : "Save"}</span>
            {data.saved ? <PiFilePdfDuotone /> : <PiFloppyDisk />}
          </Button>
          <SaveAnalysis
            open={openSaveAnalysis}
            setOpen={setOpenSaveAnalysis}
            setSaved={setSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default Summary;
