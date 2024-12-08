import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Button, Checkbox, Form, Input, Layout, message } from "antd";
import http from "../../utils/http";
import Logo from "../../assets/Logo.svg";

const { Content, Footer } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessageUsername, setErrorMessageUsername] = useState("");
  const [errorMessagePassword, setErrorMessagePassword] = useState("");
  const navigateTo = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const showSessionExpired = () => {
      messageApi.open({
        type: "error",
        content: "Session Expired, Please Login Again",
      });
    };
    if (queryParams.has("sessionExpired")) {
      queryParams.delete("sessionExpired");
      navigateTo({
        search: queryParams.toString(),
      });
      setTimeout(showSessionExpired, 1000);
    }
  }, []);

  const handleLogin = async (values) => {
    if (values.username === undefined && values.password === undefined) {
      setErrorMessageUsername("Please input your username!");
      setErrorMessagePassword("Please input your password!");
      return;
    } else if (values.username === undefined) {
      setErrorMessageUsername("Please input your username!");
      setErrorMessagePassword("");
      return;
    } else if (values.password === undefined) {
      setErrorMessageUsername("");
      setErrorMessagePassword("Please input your password!");
      return;
    }

    try {
      setLoading(true);
      http
        .post("/auth/login", values)
        .then((response) => {
          const { data } = response;
          const expiration = new Date();
          expiration.setDate(expiration.getDate() + 1);
          const tokenData = {
            value: data.token,
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
          if (values.remember === true) {
            localStorage.setItem("token", data.token);
          }

          sessionStorage.setItem("token", JSON.stringify(tokenData));
          sessionStorage.setItem("userData", JSON.stringify(userData));
          navigateTo("/dashboard?loginSuccess");
        })
        .catch((error) => {
          if (error.status === 404) {
            setErrorMessageUsername("Incorrect username");
            setErrorMessagePassword("");
          } else if (error.status === 401) {
            setErrorMessagePassword("Incorrect password");
            setErrorMessageUsername("");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <Layout>
        <Helmet>
          <title>Login - MADAM Lite</title>
          <meta name="description" content="MADAM Lite" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/star.svg" />
        </Helmet>
        <Layout>
          <Content className="h-dvh md:h-screen flex justify-center items-center">
          {contextHolder}
            <div className="w-full max-w-lg">
              <div className="bg-white shadow-md rounded-2xl px-5 lg:px-14 pt-6 pb-4 mb-1 ">
                <h3 className="text-center mb-5 flex items-center justify-center space-x-1">
                  <img src={Logo} alt="Logo" className="h-10" />
                </h3>
                <h2 className="text-3xl font-bold mb-4 text-left">Login</h2>
                <p className="text-base text-left mb-4 text-gray-600">
                  Welcome! Please enter your profile
                </p>

                <Form
                  requiredMark={false}
                  name="login"
                  initialValues={{
                    remember: false,
                  }}
                  onFinish={handleLogin}
                  autoComplete="on"
                  layout="vertical"
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    validateStatus={errorMessageUsername ? "error" : ""}
                    help={errorMessageUsername}
                    validateTrigger={[]}
                  >
                    <Input placeholder="Enter your username" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    validateStatus={errorMessagePassword ? "error" : ""}
                    help={errorMessagePassword}
                    validateTrigger={[]}
                  >
                    <Input.Password
                      placeholder="Enter your password"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    className="-mt-7"
                  >
                    <Checkbox>Remember Me</Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="submit"
                      loading={loading}
                      className="h-10 w-full bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-4 rounded-xl focus:outline-none focus:shadow-outline"
                      disabled={loading}
                      htmlType="submit"
                    >
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <Footer
                className="text-gray-500"
                style={{
                  textAlign: "center",
                }}
              >
                PT. Star Software Indonesia ©{new Date().getFullYear()} Created by TIM
                PBL UNS
              </Footer>
            </div>
          </Content>
        </Layout>
      </Layout>
    </HelmetProvider>
  );
};
export default Login;
