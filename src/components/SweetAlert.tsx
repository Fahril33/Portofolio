import Swal from "sweetalert2";

export const InfoAlert = ({title, text}: {title: string, text: string}) => {
    Swal.fire({
        title,
        text,
        icon: "info",
        confirmButtonText: 'Oke',
        customClass: {
            popup: 'swal2-popup-custom-size'
        }
    })
    
}
export const SuccessAlert = ({title, text}: {title: string, text: string}) => {
    Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText: 'Oke',
        customClass: {
            popup: 'swal2-popup-custom-size'
        }
    })
}
export const ErrorAlert = ({title, text}: {title: string, text: string}) => {
    Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: 'Oke'    ,
        customClass: {
            popup: 'swal2-popup-custom-size'
        }
    })
}
