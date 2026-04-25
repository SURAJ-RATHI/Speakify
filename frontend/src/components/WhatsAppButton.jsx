import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const phoneNumber = "917838145463"; // 👉 replace with your number (with country code, no +)

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#25D366",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <FaWhatsapp size={28} color="#fff" />
    </button>
  );
};

export default WhatsAppButton;
