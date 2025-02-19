import React from "react";
import { FiEdit } from "react-icons/fi";

const EditButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "5px",
      }}
      aria-label="Edit"
    >
      <FiEdit size={24} color="#333" />
    </button>
  );
};

export default EditButton;
