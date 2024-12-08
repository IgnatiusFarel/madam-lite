import { Link } from "react-router-dom";
import { Category, Folder, Chart, Setting, TimeCircle} from 'react-iconly';


function getItem(text, label, key, link, icon, role, children) {
  return {
    key,
    link,
    icon,
    children,
    label,
    text,
    role,
  };
}

const menuItems = [
  getItem(
    "Dashboard",
    <Link to="/dashboard">Dashboard</Link>,
    "dashboard",
    "/dashboard",
    <Category set='two-tone' size='medium' />,
    ["user", "admin", "superadmin"]
  ),

  
  getItem(
    "Master Data",
    "Master Data",
    "master-data",
    "/master-data",
    <Folder set="two-tone" size='medium' />,
    ["superadmin", "admin"],
    [
      getItem(
        "Demograph",
        <Link to="/demograph">Demograph</Link>,
        "demograph",
        "/demograph",
        null,
        ["superadmin", "admin"]
      ),
      getItem(
        "Psychograph",
        <Link to="/psychograph">Psychograph</Link>,
        "psychograph",
        "/psychograph",
        null,
        ["superadmin", "admin"]
      ),
    ]
  ),

  getItem(
    "Data Analysis",
    "Data Analysis",
    "data-analysis",
    "/data-analysis",
    <Chart set="two-tone" size='medium' />,
    ["user", "superadmin", "admin"],
    [
      getItem(
        "AIO Analysis",
        <Link to="/aio-analysis">AIO Analysis</Link>,
        "aio-analysis",
        "/aio-analysis",
        null,
        ["user", "superadmin", "admin"]
      ),
      getItem(
        "History",
        <Link to="/history">History</Link>,
        "history",
        "/history",
        null,
        ["user", "superadmin", "admin"]
      ),
    ]
  ),

  getItem(
    "System Administrator",
    <Link to="/system-administrator">System Administrator</Link>,
    "system-administrator",
    "/system-administrator",
    <Setting set="two-tone" size='medium' />,
    ["superadmin", "admin"],
  ),

  getItem(
    "Activity History",
    <Link to="/activity-history">Activity History</Link>,
    "activity-history",
    "/activity-history",
    <TimeCircle set="two-tone" size='medium' />,
    ["user", "admin", "superadmin"]
  ),
];

export default menuItems;
