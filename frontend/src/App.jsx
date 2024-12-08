import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, Spin } from "antd";
import Routes from "./routes/Index";
import http from "./utils/http";

export default function App() {
  const navigateTo = useNavigate();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (sessionStorage.getItem("token")) {
          try {
            const token = JSON.parse(sessionStorage.getItem("token"));
            const response = await http.get("/auth/user", {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });
            if (response.status === "success") {
              sessionStorage.setItem(
                "userData",
                JSON.stringify(response.data.user)
              );
            }
          } catch (error) {
            if (error.response && error.response.status === 401) {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("userData");
              navigateTo("/login?sessionExpired");
            }
          }
        } else if (localStorage.getItem("token")) {
          try {
            const token = localStorage.getItem("token");
            const response = await http.get("/auth/user", {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });
            if (response.status === "success") {
              const { data } = response;
              const expiration = new Date();
              expiration.setDate(expiration.getDate() + 1);
              const tokenData = {
                value: token,
                expiresAt: expiration.getTime(),
              };
              const userData = {
                id: data.user.user_id,
                name: data.user.name,
                username: data.user.username,
                email: data.user.email,
                role: data.user.role,
                expiresAt: expiration.getTime(),
              };
              sessionStorage.setItem("token", JSON.stringify(tokenData));
              sessionStorage.setItem("userData", JSON.stringify(userData));
              navigateTo("/dashboard");
            }
          } catch (error) {
            if (error.response && error.response.status === 401) {
              localStorage.removeItem("token");
              navigateTo("/login?sessionExpired");
            }
          }
        } else {
          navigateTo("/login");
        }
      } catch (error) {
        // Silent
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();

    const intervalId = setInterval(checkAuthentication, 10000);

    return () => clearInterval(intervalId);
  }, [navigateTo]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large"/>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Poppins, sans-serif",
          colorPrimary: "#dc362e",
        },
        components: {
          Menu: {
            itemHeight: 60,
            colorBgTextActive: "#dc362e",
            colorIconHover: "#232323",
            itemHoverColor: "#232323",
            itemSelectedColor: "#dc362e",
            itemBg: "#ffffff",
            subMenuItemBg: "#ffffff",
          },
          Table: {
            cellPaddingBlock: 10,
          },
          Segmented: {
            itemSelectedBg: "#1E1B39",
            colorText: "#ffffff",
            itemHoverBg: "#DBDBDB",
            borderRadius: 12,
            borderRadiusSM: 12,
            colorBgTextHover: "#1E1B39",
          },
          Statistic: {
            contentFontSize: 18,
          },
        },
      }}
    >
      <Routes />
    </ConfigProvider>
  );
}
