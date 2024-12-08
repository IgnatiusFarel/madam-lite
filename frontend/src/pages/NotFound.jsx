import ErrorIcon from "../assets/Error.png";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <img src={ErrorIcon} alt="Error Icon"   />
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#DC232E" }}> 404 - Not Found </h1>
        <p className="text-lg">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;
