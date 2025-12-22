import React from "react";
import { X } from "lucide-react";

export default function Popup({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>
        <p className="text-gray-800 font-medium">{message}</p>
      </div>
    </div>
  );
}
