import { Breadcrumb, Layout, Button, Menu, Dropdown, Typography, Drawer } from "antd";
import { FaBars, FaTimes, FaAngleDown, FaSignOutAlt } from "react-icons/fa";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import useActiveMenuItem from "../hooks/useActiveMenuItem";
import useBreadcrumbs from "../hooks/useBreadcrumbs";
import menuItems from "../components/MenuItems";
import SuperadminProfile from "../assets/Superadmin.png";
import AdminProfile from "../assets/Admin.png";
import UserProfile from "../assets/User.png";
import Logo from "../assets/Logo.svg";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout = ({ children }) => {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { activeMenuItem } = useActiveMenuItem();
  const { breadcrumbItems } = useBreadcrumbs();
  const navigateTo = useNavigate();

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prevCollapsed) => !prevCollapsed);
  }, []);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const onLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigateTo("/login");
  }, [navigateTo]);

  const menuNavbar = (
    <Menu>
      <Menu.Item key="1" onClick={onLogout}>
        <div className="flex items-center text-red-500">
          <FaSignOutAlt className="mr-2" /> Logout
        </div>
      </Menu.Item>
    </Menu>
  );

  function AppMenu({ isInline = false }) {
    return (
      <Menu
        mode={isInline ? "inline" : "vertical"}
        defaultSelectedKeys={[activeMenuItem?.key]}
        defaultOpenKeys={[breadcrumbItems?.[1].key]}
        selectedKeys={[activeMenuItem?.key]}
        items={menuItems.filter((item) => item.role.includes(userData?.role))}
      ></Menu>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }} className="flex">
      <Drawer
        visible={drawerVisible}
        onClose={closeDrawer}
        placement="left"
        closable
        title={
          <div className="flex justify-end">
            <Button
              className="flex items-center mr-4 bg-gray-100 hover:bg-gray-400 p-6 rounded-xl focus:outline-none focus:shadow-outline"
              shape="round"
            >
              <Dropdown overlay={menuNavbar} trigger={["click"]}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center mr-1">
                    <Avatar
                      src={
                        userData?.role === "superadmin"
                          ? SuperadminProfile
                          : userData?.role === "admin"
                          ? AdminProfile
                          : UserProfile
                      }
                      size={32}
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-col items-start mr-2">
                    <Text style={{ fontSize: "14px" }}>{userData?.name}</Text>
                    <Text style={{ fontSize: "12px" }}>{userData?.role}</Text>
                  </div>
                  <FaAngleDown />
                </div>
              </Dropdown>
            </Button>
          </div>
        }
      >
        <AppMenu isInline />
      </Drawer>
      <Sider
        className="hidden md:inline-block"
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        theme="light"
        width={260}
        style={{
          borderRight: "1px solid #e8e8e8",
        }}
      >
        <div className="top-0 sticky h-screen">
          <div className="py-7">
            <img src={Logo} alt="Logo" className="w-42 h-auto mx-auto" />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={[activeMenuItem?.key]}
            defaultOpenKeys={[breadcrumbItems?.[1].key]}
            selectedKeys={[activeMenuItem?.key]}
            items={menuItems.filter((item) =>
              item.role.includes(userData?.role)
            )}
          ></Menu>
        </div>
      </Sider>
      
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBlock: "40px",
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          <div className="space-between items-center flex">
            <div className="hidden md:block">
              <Button
                type="link"
                onClick={toggleCollapsed}
                style={{
                  marginLeft: 16,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {collapsed ? (
                  <FaTimes className="text-xl text-gray-800 hover:text-black" />
                ) : (
                  <FaBars className="text-xl text-gray-800 hover:text-black" />
                )}
              </Button>
            </div>
            <div className="md:hidden">
              <Button
                type="link"
                onClick={showDrawer}
                style={{
                  marginLeft: 16,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaBars className="text-xl text-gray-800 hover:text-black" />
              </Button>
            </div>

            <Text className="text-lg font-medium md:text-2xl md:font-medium">
              {activeMenuItem?.text}
            </Text>
          </div>
          <Button
            className="flex items-center mr-4 bg-gray-100 hover:bg-gray-400 p-6 rounded-xl focus:outline-none focus:shadow-outline hidden sm:flex"
            shape="round"
          >
            <Dropdown overlay={menuNavbar} trigger={["click"]}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center mr-1">
                  <Avatar
                    src={
                      userData?.role === "superadmin"
                        ? SuperadminProfile
                        : userData?.role === "admin"
                        ? AdminProfile
                        : UserProfile
                    }
                    size={32}
                    className="mr-2"
                  />
                </div>
                <div className="flex flex-col items-start mr-2">
                  <Text style={{ fontSize: "14px" }}>{userData?.name}</Text>
                  <Text style={{ fontSize: "12px" }}>{userData?.role}</Text>
                </div>
                <FaAngleDown />
              </div>
            </Dropdown>
          </Button>
        </Header>
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBlock: "5px",
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
              background: "#fff",
              padding: "20px",
            }}
          >
            {breadcrumbItems}
          </Breadcrumb>
        </Header>

        {activeMenuItem?.key != "dashboard" ? (
          <Content
            className="site-layout-background rounded-xl"
            style={{
              margin: "15px 16px",
              padding: 0,
              minHeight: 280,
              background: "#fff",
            }}
          >
            {children}
          </Content>
        ) : (
          children
        )}
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
