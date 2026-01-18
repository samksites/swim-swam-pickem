import { useAlertStore } from "@/stores/useAlertStore";
import React from "react";
import { IoClose } from "react-icons/io5";


const Alert: React.FC = () => {
    const { show, message, confirmAction, clearAlert } = useAlertStore((state) => state);
    if (!show) return null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 50,
            }}>
            <div className="bg-white h-45 w-80 rounded-lg shadow-lg p-6 flex flex-col items-center relative z-60">
                <div className="w-full flex justify-start -ml-8 -mt-4">
                    <IoClose
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                        size={24}
                        onClick={clearAlert}
                    />
                </div>
                <div className="flex-grow flex items-center justify-center text-center">
                    {message}
                </div>
                <div className="w-full flex justify-center">
                    <button
                        className="bg-blue-500 hover:cursor-pointer text-white px-4 py-2 rounded-lg transition-transform duration-200 hover:scale-102"
                        onClick={() => { confirmAction(); if (clearAlert) clearAlert(); }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export { Alert };