"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
  message: string | null;
  type: "success" | "error";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            zIndex: 1000,
            minWidth: "350px",
            background: "rgba(10, 14, 20, 0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${type === "success" ? "var(--success)" : "var(--danger)"}`,
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
          }}
        >
          {type === "success" ? <CheckCircle color="var(--success)" /> : <AlertCircle color="var(--danger)" />}
          <span style={{ fontSize: "0.9rem", color: "white" }}>{message}</span>
          <button 
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", marginLeft: "auto", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
