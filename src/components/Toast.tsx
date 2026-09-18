import React from "react";

interface ToastProps {
  message: string | null;
  type?: "success" | "info" | "error";
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  if (!message) return null;

  return (
    <div className={`toast-notification toast-${type}`} role="status">
      <span className="toast-icon">
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <div className="toast-actions">
          <button
            type="button"
            className="toast-home-btn"
            onClick={onClose}
            title="Return to home screen"
          >
            Home →
          </button>
          <button
            type="button"
            className="toast-close"
            onClick={onClose}
            aria-label="Close and return to home"
            title="Close and return to home screen"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Toast;
