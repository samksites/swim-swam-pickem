import { create } from "zustand";
import { produce } from "immer";
import type { Alert, AlertUpdate } from "@/types/alert";


export const useAlertStore = create<Alert>((set) => ({
    show: false,
    message: "",
    confirmAction: () => {},
    setAlert: (alert: AlertUpdate) =>
        set(
        produce((state: AlertUpdate) => {
            state.show = alert.show;
            state.message = alert.message;
            state.confirmAction = alert.confirmAction;
        })
        ),
    clearAlert: () => set({ show: false, message: ""}),
}));