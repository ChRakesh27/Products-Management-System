import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ToastMSG(type, msg) {
  const customToastStyle = {
    error: {
      style: {
        color: "#FF6B6B",
        // border: "2px solid #FF6B6B",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        padding: "12px 16px 16px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      },
      // icon: "❌",
    },
    success: {
      style: {
        color: "#48BB78",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        padding: "12px 16px 16px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      },
      icon: "✅",
    },
    warn: {
      style: {
        color: "#FFA500",
        // border: "2px solid #FF8C00",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        padding: "12px 16px 16px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      },
      // icon: "⚠️",
    },
  };
  let className = "";
  if (type == "warn") {
    className = "custom-toast-warning";
  } else if (type == "error") {
    className = "custom-toast-error";
  } else if (type == "success") {
    className = "custom-toast-success";
  }
  toast[type](msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: customToastStyle[type].style,
    icon: customToastStyle[type].icon,
    className,
  });
}

export default ToastMSG;
