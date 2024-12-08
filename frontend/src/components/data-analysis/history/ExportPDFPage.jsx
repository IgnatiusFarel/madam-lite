import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import http from "../../../utils/http";

const ExportPDFPage = () => {
  const { id } = useParams();
  const [pdfData, setPdfData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      if (id) {
        try {
          let response;
          let isBlob = false;

          while (!isBlob) {
            response = await http.get(`/aio-analysis/export-pdf/${id}`, {
              responseType: "blob",
            });

            if (response instanceof Blob) {
              isBlob = true;
            } else {
              console.error("Response is not a Blob:", response);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          setPdfData(URL.createObjectURL(response));
        } catch (error) {
          console.error("Error fetching PDF data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      {isLoading ? (
        <div></div>
      ) : (
        <iframe
          src={pdfData}
          title="AIO Analysis PDF"
          style={{ width: "100%", height: "100vh", border: "none" }}
        />
      )}
    </div>
  );
};

export default ExportPDFPage;
