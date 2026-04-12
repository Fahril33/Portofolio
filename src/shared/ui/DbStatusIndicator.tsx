import React from "react";

type DbStatusIndicatorProps = {
  isConnected: boolean;
  showLabel?: boolean;
};

const DbStatusIndicator: React.FC<DbStatusIndicatorProps> = ({ isConnected, showLabel = true }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        marginLeft: showLabel ? "12px" : "4px",
        verticalAlign: "middle",
      }}
      title={isConnected ? "Database Connected" : "Connection Error / Data Missing"}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: isConnected ? "#3ecf8e" : "#ff4444",
          boxShadow: isConnected
            ? "0 0 8px rgba(62,207,142,0.6)"
            : "0 0 8px rgba(255,68,68,0.6)",
          transition: "all 0.3s ease",
        }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: isConnected ? "#3ecf8e" : "#ff4444",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      )}
    </div>
  );
};

export default DbStatusIndicator;
