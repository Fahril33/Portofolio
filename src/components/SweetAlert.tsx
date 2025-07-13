import Swal from "sweetalert2";

export const InfoAlert = ({title, text}: {title: string, text: string}) => {
    Swal.fire({
        title,
        text,
        icon: "info",
        confirmButtonText: 'Oke'
    })
}
export const SuccessAlert = ({title, text}: {title: string, text: string}) => {
    Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText: 'Oke'
    })
}
export const ErrorAlert = ({title, text}: {title: string, text: string}) => {
    Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: 'Oke'
    })
}
