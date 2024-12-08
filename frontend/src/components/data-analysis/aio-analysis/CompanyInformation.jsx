import { useRef, useState, useEffect, useContext } from "react";
import { Form, Typography, Select, Input, Button } from "antd";
import { TfiArrowCircleRight } from "react-icons/tfi";
import CompanyIcon from "../../../assets/Company.svg";
import http from "../../../utils/http";
import { PlusOutlined } from "@ant-design/icons";
import { FormContext } from "./FormContext";
import { FiRefreshCw } from "react-icons/fi";

const { Text } = Typography;

const CompanyInformation = ({ onNext }) => {
  const [form] = Form.useForm();
  const [companyInfoData, setCompanyInfoData] = useState([]);
  const [contactPersonData, setContactPersonData] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const inputRefCompany = useRef(null);
  const inputRefContact = useRef(null);
  const { data, updateDataCompany, resetData } = useContext(FormContext);

  useEffect(() => {
    fetchCompanies();
    form.setFieldsValue(data.company_information);
  }, []);

  const fetchCompanies = () => {
    http
      .get("/company-information")
      .then((data) => {
        setCompanyInfoData(data);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  };

  const handleReset = () => {
    form.resetFields();
    resetData();
  };

  const handleNext = () => {
    form.validateFields().then((values) => {
      updateDataCompany(values);
      onNext();
    });
  };

  const addCompany = () => {
    setCompanyInfoData([...companyInfoData, { company_name: companyName }]);
    form.setFieldsValue({
      company_information_id: null,
      company_name: companyName,
      address: null,
      industry: null,
    });
    setCompanyName("");
    setTimeout(() => {
      inputRefCompany.current?.blur();
    }, 0);
  };

  const addContact = () => {
    setContactPersonData([...contactPersonData, { full_name: contactName }]);
    form.setFieldsValue({
      contact_person_id: null,
      full_name: contactName,
      email_address: null,
      position_or_title: null,
      phone_number: null,
    });
    setContactName("");
    setTimeout(() => {
      inputRefContact.current?.blur();
    }, 0);
  };

  const handleCompanySelect = (value) => {
    const selectedCompany = companyInfoData.find(
      (company) => company.company_name === value
    );
    setContactPersonData(selectedCompany.contact_person);
    const lastContactPerson =
      selectedCompany.contact_person?.[
        selectedCompany.contact_person.length - 1
      ];
    if (selectedCompany) {
      form.setFieldsValue({
        company_information_id: selectedCompany.company_information_id,
        company_name: selectedCompany.company_name,
        address: selectedCompany.address,
        industry: selectedCompany.industry,
        contact_person_id: lastContactPerson?.contact_person_id,
        full_name: lastContactPerson?.full_name,
        email_address: lastContactPerson?.email_address,
        position_or_title: lastContactPerson?.position_or_title,
        phone_number: lastContactPerson?.phone_number,
      });
    }
  };

  const handleContactPersonSelect = (value) => {
    const selectedContactPerson = contactPersonData.find(
      (contact) => contact.full_name === value
    );
    if (selectedContactPerson) {
      form.setFieldsValue({
        contact_person_id: selectedContactPerson.contact_person_id,
        full_name: selectedContactPerson.full_name,
        email_address: selectedContactPerson.email_address,
        position_or_title: selectedContactPerson.position_or_title,
        phone_number: selectedContactPerson.phone_number,
      });
    }
  };

  return (
    <div className="flex flex-col px-4 py-6 sm:px-10">
      <div className="flex items-center mb-3">
        <img
          src={CompanyIcon}
          alt="Company"
          className="menu-icon"
          style={{ height: 40, width: 40 }}
        />
        <Text className="text-2xl font-normal ml-2">Company Information</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row">
          <Form.Item
            name="company_information_id"
            className="hidden"
          ></Form.Item>
          <Form.Item
            name="company_name"
            label="Company Name"
            className="flex-1 sm:mr-2"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Select
              showSearch
              ref={inputRefCompany}
              className="h-10 w-full"
              placeholder="Enter Company Name"
              value={companyName}
              onChange={handleCompanySelect}
              onSearch={(value) => setCompanyName(value)}
              notFoundContent={
                <div>
                  <Button
                    type="text"
                    className="p-0 w-full"
                    icon={<PlusOutlined />}
                    onClick={addCompany}
                  >
                    Add new company
                  </Button>
                </div>
              }
              dropdownRender={(company) => <>{company}</>}
              options={companyInfoData.map((item) => ({
                label: item.company_name,
                value: item.company_name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="industry"
            label="Industry"
            className="flex-1 sm:ml-2"
            rules={[{ required: true, message: "Please enter industry" }]}
          >
            <Input className="h-10 w-full" placeholder="Enter Industry" />
          </Form.Item>
        </div>

        <Form.Item
          name="address"
          label="Address"
          className="mb-3 sm:mr-5"
          rules={[{ required: true, message: "Please enter address" }]}
        >
          <Input
            className="h-10 w-full sm:w-1/2"
            placeholder="Enter Company Address"
          />
        </Form.Item>

        <div className="mb-1">
          <Text className="text-xl font-normal">Contact Person</Text>
        </div>
        <div className="flex flex-col sm:flex-row">
          <Form.Item name="contact_person_id" className="hidden"></Form.Item>
          <Form.Item
            name="full_name"
            label="Full Name"
            className="flex-1 sm:mr-2"
            rules={[{ required: true, message: "Please enter Full name" }]}
          >
            <Select
              showSearch
              ref={inputRefContact}
              className="h-10 w-full"
              placeholder="Enter Full Name"
              value={contactName}
              onChange={handleContactPersonSelect}
              onSearch={(value) => setContactName(value)}
              notFoundContent={
                <div>
                  <Button
                    type="text"
                    className="p-0 w-full"
                    icon={<PlusOutlined />}
                    onClick={addContact}
                  >
                    Add new contact person
                  </Button>
                </div>
              }
              dropdownRender={(contact) => <>{contact}</>}
              options={contactPersonData.map((item) => ({
                label: item.full_name,
                value: item.full_name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="email_address"
            label="Email Address"
            className="flex-1 sm:ml-2"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input className="h-10 w-full" placeholder="Enter Email Address" />
          </Form.Item>
        </div>

        <div className="flex flex-col sm:flex-row">
          <Form.Item
            name="position_or_title"
            label="Position/Title"
            className="flex-1 sm:mr-2"
            rules={[{ required: true, message: "Please enter position/title" }]}
          >
            <Input className="h-10 w-full" placeholder="Enter Position/Title" />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label="Phone Number"
            className="flex-1 sm:ml-2"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^[0-9]+$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input className="h-10 w-full" placeholder="Enter Phone Number" />
          </Form.Item>
        </div>

        <div className="flex justify-end mt-3">
          <Button
            type="default"
            className="rounded-xl mr-4 flex items-center justify-center w-24 h-10"
            onClick={handleReset}
          >
            <span className="mr-2">
              <FiRefreshCw />
            </span>
            Reset
          </Button>
          <Button
            type="primary"
            className="rounded-xl flex items-center justify-center w-24 h-10"
            onClick={handleNext}
          >
            <span className="mr-2">Next</span>
            <TfiArrowCircleRight />
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CompanyInformation;
