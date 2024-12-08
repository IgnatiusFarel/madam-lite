import { createContext, useState } from "react";

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const initialData = {
    company_information: {},
    demograph: [],
    psychograph: {},
    additional_notes: "",
  };
  const [data, setData] = useState(() => {
    return initialData;
    // const savedData = localStorage.getItem("aio_analysis_data");
    // return savedData ? JSON.parse(savedData) : initialData;
  });
  const [isDataSaved, setIsDataSaved] = useState(data.saved);

  // useEffect(() => {
  //   localStorage.setItem("aio_analysis_data", JSON.stringify(data));
  //   setIsDataSaved(data.saved);
  // }, [data]);

  const updateDataCompany = (data) => {
    setData((prevData) => ({
      ...prevData,
      company_information: data,
    }));
  };
  const addDataDemograph = (data) => {
    setData((prevData) => ({
      ...prevData,
      demograph: [...prevData.demograph, data],
    }));
  };
  const editDataDemograph = (editedData) => {
    setData((prevData) => {
      const updatedDemograph = prevData.demograph.map((item) =>
        item.parameter_name === editedData.parameter_name ? editedData : item
      );
      return {
        ...prevData,
        demograph: updatedDemograph,
      };
    });
  };
  const removeDemograph = (demographToRemove) => {
    setData((prevData) => ({
      ...prevData,
      demograph: prevData.demograph.filter(
        (item) => item !== demographToRemove
      ),
    }));
  };
  const updateDataPsychograph = (data) => {
    setData((prevData) => ({
      ...prevData,
      psychograph: data,
    }));
  };
  const setAdditionalNotes = (data) => {
    setData((prevData) => ({
      ...prevData,
      additional_notes: data,
    }));
  };
  const setSaved = (data) => {
    setData((prevData) => ({
      ...prevData,
      saved: data,
    }));
    setIsDataSaved(data);
  };

  const resetData = () => {
    setData(initialData);
    setIsDataSaved(false);
  };

  return (
    <FormContext.Provider
      value={{
        data,
        isDataSaved,
        updateDataCompany,
        addDataDemograph,
        editDataDemograph,
        removeDemograph,
        updateDataPsychograph,
        setAdditionalNotes,
        setSaved,
        resetData,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
