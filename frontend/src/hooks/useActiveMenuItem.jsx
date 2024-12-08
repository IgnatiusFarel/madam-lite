import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import menuItems from "../components/MenuItems";

const useActiveMenuItem = () => {
  const location = useLocation();
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const [activeMenuItem, setActiveMenuItem] = useState(null);

  useEffect(() => {
    const activeItem = menuItems.find((item) => {
      if (item.children) {
        const subMenuItem = item.children.find(
          (subItem) =>
            subItem.link === location.pathname &&
            subItem.role.includes(userData.role)
        );
        if (subMenuItem) {
          setActiveMenuItem(subMenuItem);
          return true;
        }
      }
      return (
        item.link === location.pathname && item.role.includes(userData.role)
      );
    });
    if (!activeItem.children) {
        setActiveMenuItem(activeItem);
    }
  }, [location.pathname, userData]);

  return { activeMenuItem, setActiveMenuItem };
};

export default useActiveMenuItem;
