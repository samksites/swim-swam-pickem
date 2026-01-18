export type Alert = {
  show: boolean;
  message: string;
  setAlert?: (alert: Alert) => void;
  confirmAction: () => void;
  clearAlert?: () => void;
};

export type AlertUpdate = {
    show: boolean;
    message: string;
    confirmAction?: () => void;
};
