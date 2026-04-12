import Swal from "sweetalert2";

type AlertInput = {
  title: string;
  text: string;
};

type AlertIcon = "info" | "success" | "error";

const fireAlert = ({ title, text }: AlertInput, icon: AlertIcon) =>
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "Oke",
    customClass: {
      popup: "swal2-popup-custom-size",
    },
  });

export const InfoAlert = (input: AlertInput) => fireAlert(input, "info");
export const SuccessAlert = (input: AlertInput) => fireAlert(input, "success");
export const ErrorAlert = (input: AlertInput) => fireAlert(input, "error");
