import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const baseConfig = {
  width: "340px",
  padding: "18px",

  allowOutsideClick: false,
  allowEscapeKey: false,

  customClass: {
    popup: "xeoo-swal-popup",
    title: "xeoo-swal-title",
    htmlContainer: "xeoo-swal-text",
    actions: "xeoo-swal-actions",
    confirmButton: "xeoo-swal-confirm",
    cancelButton: "xeoo-swal-cancel",
    icon: "xeoo-swal-icon",
  },

  buttonsStyling: false,
};

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,

    iconHtml: '<span class="xeoo-icon-success">✓</span>',

    title,
    text,

    timer: 1000,
    timerProgressBar: true,

    showConfirmButton: false,

    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,

    iconHtml: '<span class="xeoo-icon-error">×</span>',

    title,
    text,

    showConfirmButton: true,
    confirmButtonText: "OK",

    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export function showWarning(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,

    iconHtml: '<span class="xeoo-icon-warning">!</span>',

    title,
    text,

    showConfirmButton: true,
    confirmButtonText: "OK",

    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export function showInfo(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,

    iconHtml: '<span class="xeoo-icon-info">i</span>',

    title,
    text,

    showConfirmButton: true,
    confirmButtonText: "OK",

    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export async function showConfirm(title: string, text?: string) {
  const result = await Swal.fire({
    ...baseConfig,

    iconHtml: '<span class="xeoo-icon-warning">!</span>',

    title,
    text,

    showCancelButton: true,
    showConfirmButton: true,

    confirmButtonText: "Yes",
    cancelButtonText: "Close",

    reverseButtons: true,

    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  return result.isConfirmed;
}

export async function showPrompt(
  title: string,
  text?: string,
  inputPlaceholder?: string,
  inputValue?: string
): Promise<string | null> {
  const result = await Swal.fire({
    ...baseConfig,

    iconHtml: '<span class="xeoo-icon-info">i</span>',

    title,
    text,

    input: "text",
    inputValue: inputValue || "",
    inputPlaceholder: inputPlaceholder || "",

    showCancelButton: true,
    showConfirmButton: true,

    confirmButtonText: "Simpan",
    cancelButtonText: "Batal",

    reverseButtons: true,

    allowOutsideClick: false,
    allowEscapeKey: false,

    customClass: {
      ...baseConfig.customClass,
      input: "xeoo-swal-input",
    },
  });

  if (result.isConfirmed && typeof result.value === "string") {
    return result.value.trim();
  }
  return null;
}

// Backward-compatibility aliases
export const showSuccessAlert = showSuccess;
export const showErrorAlert = showError;
export const showWarningAlert = showWarning;
export const showInfoAlert = showInfo;

