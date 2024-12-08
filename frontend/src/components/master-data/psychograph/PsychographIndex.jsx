import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { Badge, Button, Layout, Tabs, Typography, Input } from "antd";
import AddPsychograph from "./AddPsychograph";
import ActivityList from "./ActivityList";
import InterestList from "./InterestList";
import OpinionList from "./OpinionList";
import http from "../../../utils/http";

const { Text } = Typography;
const { Content } = Layout;
const { Search } = Input;

const PsychographIndex = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [openAddPsychograph, setOpenAddPsychograph] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageActivity, setPageActivity] = useState(1);
  const [pageInterest, setPageInterest] = useState(1);
  const [pageOpinion, setPageOpinion] = useState(1);
  const [activityData, setActivityData] = useState([]);
  const [totalActivityData, setTotalActivityData] = useState(0);
  const [interestData, setInterestData] = useState([]);
  const [totalInterestData, setTotalInterestData] = useState(0);
  const [opinionData, setOpinionData] = useState([]);
  const [totalOpinionData, setTotalOpinionData] = useState(0);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const fetchData = (type, page, shouldFetchData) => {
    if (shouldFetchData) {
      setLoading(true);
      let url = `psychograph?type=${type}&page=${page}&search=${search}`;
      if (sortField && sortOrder) {
        url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      }
      http
        .get(url)
        .then((response) => {
          switch (type) {
            case "activity":
              setActivityData(response.data);
              setTotalActivityData(response.totalPsychograph);
              break;
            case "interest":
              setInterestData(response.data);
              setTotalInterestData(response.totalPsychograph);
              break;
            case "opinion":
              setOpinionData(response.data);
              setTotalOpinionData(response.totalPsychograph);
              break;
            default:
              break;
          }
          setLoading(false);
        })
        .catch((error) => error.response);
    }
  };

  useEffect(() => {
    fetchData("activity", pageActivity, true);
    if (search) {
      if (totalActivityData > 0) {
        setActiveTab("activity");
      }
    }
  }, [pageActivity, search, sortField, sortOrder]);

  useEffect(() => {
    fetchData("interest", pageInterest, true);
    if (search) {
      if (totalInterestData > 0) {
        setActiveTab("interest");
      }
    }
  }, [pageInterest, search, sortField, sortOrder]);

  useEffect(() => {
    fetchData("opinion", pageOpinion, true);
    if (search) {
      if (totalOpinionData > 0) {
        setActiveTab("opinion");
      }
    }
  }, [pageOpinion, search, sortField, sortOrder]);

  useEffect(() => {
    if (pageActivity !== 1 || pageInterest !== 1 || pageOpinion !== 1) {
      setPageActivity(1);
      setPageInterest(1);
      setPageOpinion(1);
    }
  }, [search]);

  const items = [
    {
      key: "activity",
      label: (
        <div className="flex items-center">
          Activity
          <Badge
            count={totalActivityData}
            showZero
            color={activeTab === "activity" ? "#F8D0CE" : "#F2F2F2"}
            style={{
              color: activeTab === "activity" ? "#DC362E" : "#929EAE",
              marginLeft: 5,
              borderRadius: 6,
            }}
          />
        </div>
      ),
      children: (
        <ActivityList
          data={activityData}
          setData={setActivityData}
          loading={loading}
          page={pageActivity}
          setPage={setPageActivity}
          totalData={totalActivityData}
          fetchData={fetchData}
          search={search}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
        />
      ),
    },
    {
      key: "interest",
      label: (
        <div className="flex items-center ">
          Interest
          <Badge
            count={totalInterestData}
            showZero
            color={activeTab === "interest" ? "#F8D0CE" : "#F2F2F2"}
            style={{
              color: activeTab === "interest" ? "#DC362E" : "#929EAE",
              marginLeft: 5,
              borderRadius: 6,
            }}
          />
        </div>
      ),
      children: (
        <InterestList
          data={interestData}
          setData={setInterestData}
          loading={loading}
          page={pageInterest}
          setPage={setPageInterest}
          totalData={totalInterestData}
          fetchData={fetchData}
          search={search}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
        />
      ),
    },
    {
      key: "opinion",
      label: (
        <div className="flex items-center">
          Opinion
          <Badge
            count={totalOpinionData}
            showZero
            color={activeTab === "opinion" ? "#F8D0CE" : "#F2F2F2"}
            style={{
              color: activeTab === "opinion" ? "#DC362E" : "#929EAE",
              marginLeft: 5,
              borderRadius: 6,
            }}
          />
        </div>
      ),
      children: (
        <OpinionList
          data={opinionData}
          setData={setOpinionData}
          loading={loading}
          page={pageOpinion}
          setPage={setPageOpinion}
          totalData={totalOpinionData}
          fetchData={fetchData}
          search={search}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
        />
      ),
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Content className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Text className="text-2xl font-normal">Psychograph</Text>
        <div className="hidden md:block">
          <Button
            type="primary"
            className="rounded-xl focus:outline-none focus:shadow-outline items-center justify-center h-10 py-2 px-4 flex items-center"
            onClick={() => setOpenAddPsychograph(true)}
          >
            <FiPlus className="mr-2" /> Add Option
          </Button>
        </div>
      </div>
      <div className="flex justify-between">
        <Search
          className="mb-2 ml-3 mr-10 md:hidden justify-end"
          placeholder="Search Option"
          style={{
            width: 250,
          }}
          onSearch={(value) => setSearch(value)}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Button
          type="primary"
          className="rounded-xl focus:outline-none focus:shadow-outline items-center justify-center py-4 md:h-10 md:py-2 md:px-4 flex items-center md:hidden"
          onClick={() => setOpenAddPsychograph(true)}
        >
          <FiPlus className="mr-2" /> Add Option
        </Button>
      </div>
      <Tabs
        defaultActiveKey="activity"
        activeKey={activeTab}
        items={items}
        tabBarStyle={{
          // background: "#F8F8F8",
          paddingLeft: 20,
          borderRadius: 12,
        }}
        onChange={handleTabChange}
        tabBarExtraContent={
          <Search
            className="mr-5 hidden md:block"
            placeholder="Search Option"
            style={{
              width: 250,
            }}
            onSearch={(value) => setSearch(value)}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        }
      />

      <AddPsychograph
        open={openAddPsychograph}
        setOpen={setOpenAddPsychograph}
        page={[pageActivity, pageInterest, pageOpinion]}
        fetchData={fetchData}
      />
    </Content>
  );
};

export default PsychographIndex;
