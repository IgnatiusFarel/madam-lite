import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PiFilePdfDuotone, PiHouseLineDuotone } from "react-icons/pi";
import { Typography, Button, Badge, Space, Skeleton } from "antd";
import { TfiArrowCircleLeft } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import http from "../../../utils/http";
import DOMPurify from "dompurify";
import SummaryIcon from "../../../assets/Summary.svg";

DOMPurify.addHook("uponSanitizeElement", function (node, data) {
  if (node.nodeName && /^(ul|ol|li)$/i.test(node.nodeName)) {
    data.keepElement = true;
  }
});

ChartJS.register(ArcElement, Tooltip, Legend);

const { Text } = Typography;
const allowedAttr = { ...DOMPurify.ALLOWED_ATTR };
const allowedTags = { ...DOMPurify.ALLOWED_TAGS, ul: [], ol: [], li: [] };

const DetailHistory = ({ history, setShowDetail }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState(
    DOMPurify.sanitize(data?.additional_notes, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttr,
      USE_PROFILES: { html: true },
    })
  );

  useEffect(() => {
    navigate(`?page=summary`, { replace: true });
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(
        `/aio-analysis/${history.aio_analysis_response_id}`
      );
      setData(response);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companyInfo = [
    { label: "Company Name", value: data?.company_information.company_name },
    { label: "Industry", value: data?.company_information.industry },
    { label: "Address", value: data?.company_information.address },
    { label: "Full Name", value: data?.company_information.full_name },
    { label: "Email Address", value: data?.company_information.email_address },
    { label: "Position or Title", value: data?.company_information.position_or_title },
    { label: "Phone Number", value: data?.company_information.phone_number },
  ];

  const getCheckedCount = (category) => {
    if (category === "all") {
      return (
        data?.psychograph?.[0]?.total_selected_option +
        data?.psychograph?.[1]?.total_selected_option +
        data?.psychograph?.[2]?.total_selected_option
      );
    }
    return data?.psychograph?.[category]?.total_selected_option;
  };

  const getTotalCount = () => {
    return (
      data?.psychograph?.[0]?.total_option +
      data?.psychograph?.[1]?.total_option +
      data?.psychograph?.[2]?.total_option
    );
  };

  const calculatePercentage = (checkedCount, totalCount) => {
    return (checkedCount / totalCount) * 100;
  };

  useEffect(() => {
    if (data) {
      const sanitizedHTML = DOMPurify.sanitize(data.additional_notes, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttr,
        USE_PROFILES: { html: true },
      });
      setAdditionalNotes(sanitizedHTML);

      const pieData = {
        labels: [
          `Activity (${calculatePercentage(
            getCheckedCount(0),
            getTotalCount()
          ).toFixed(2)}%)`,
          `Interest (${calculatePercentage(
            getCheckedCount(1),
            getTotalCount()
          ).toFixed(2)}%)`,
          `Opinion (${calculatePercentage(
            getCheckedCount(2),
            getTotalCount()
          ).toFixed(2)}%)`,
        ],
        datasets: [
          {
            label: "Score Psychograph",
            data: [getCheckedCount(0), getCheckedCount(1), getCheckedCount(2)],
            backgroundColor: ["#DC362E", "#FF5353", "#FEC5C5"],
            borderColor: ["#DC362E", "#FF5353", "#FEC5C5"],
            borderWidth: 0,
          },
        ],
      };
      setPieChartData(pieData);
    }
  }, [data]);

  const handleBack = () => {
    setShowDetail(false);
    navigate(``, { replace: true });
  };

  const handleExportPDF = () => {
    window.open(
      `/history/export-pdf/${history.aio_analysis_response_id}`,
      "_blank"
    );
  };

  return (
    <div className="flex flex-col min-h-full justify-between">
      {loading === false ? (
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
                <Text className=" text-lg font-medium">
                  Company Information
                </Text>
                <div className="flex flex-col my-1">
                  {companyInfo.map((info, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between my-1 pr-4"
                    >
                      <div className="flex w-full md:w-1/2 pr-2">
                        <Text className="text-md w-7/12">{info.label}</Text>
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
                <Text className=" text-lg font-medium">
                  Demograph Summary
                </Text>
                <div className="flex flex-col my-1">
                  {data.demograph.map((info, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between my-1 pr-4"
                    >
                      <Text className="text-md w-7/12">
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
                <Text className="text-lg font-medium"> AIO Summary </Text>
                <div className="flex flex-col my-1">
                  <Text className="text-sm font-base text-gray-400">
                    Data Score
                  </Text>
                  <Text className="text-lg font-semibold">Psychograph</Text>
                </div>
                <div className="flex my-1 justify-start">
                  <div className="w-1/4">
                    {pieChartData && (
                      <Pie
                        data={pieChartData}
                        options={{
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />
                    )}
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
                          getCheckedCount(0),
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
                          getCheckedCount(1),
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
                          getCheckedCount(2),
                          getTotalCount()
                        ).toFixed(2)}%)`}
                      </Text>
                    </div>
                    <div className="ml-5 mt-1">
                      <Text className="text-lg font-semibold">AIO Score</Text>
                      <Text className="text-xl font-semibold ml-2">
                        {" "}
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
            <div className="mt-2">
              <Text className=" text-lg font-medium"> Additional Notes </Text>
            </div>
            <div className="md:w-5/12">
              <div
                className="text-md"
                dangerouslySetInnerHTML={{
                  __html: additionalNotes,
                }}
              />
            </div>
          </div>
          <div className="flex item-right justify-end mt-3">
            <Button
              type="default"
              className="rounded-xl mr-4 flex items-center justify-center"
              onClick={handleBack}
              style={{ width: 90, height: 37 }}
            >
              <span className="mr-2">
                {data.saved ? <PiHouseLineDuotone /> : <TfiArrowCircleLeft />}
              </span>
              Back
            </Button>
            <Button
              type="primary"
              className="rounded-xl flex items-center justify-center"
              style={{ width: 130, height: 37 }}
              onClick={handleExportPDF}
            >
              <span className="mr-2">Export PDF</span>
              <PiFilePdfDuotone />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <Space className="mb-2">
            <Skeleton.Input active size="large" />
          </Space>
          <Skeleton
            active
            paragraph={{
              rows: 4,
            }}
            className="mb-2"
          />
          <Space className="mb-2">
            <Skeleton.Input active size="large" />
          </Space>
          <Skeleton
            active
            paragraph={{
              rows: 3,
            }}
            className="mb-2"
          />
          <Space>
            <Skeleton.Button active size="large" />
            <Skeleton.Input active size="large" />
          </Space>
        </div>
      )}
    </div>
  );
};

export default DetailHistory;
