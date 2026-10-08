import {
  Barcode,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  Link,
  Mail,
  QrCode,
  RefreshCw,
  Smartphone,
  Type,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showError, showSuccess } from "../../alert";

import {
  barcodeSVGToDataURL,
  buildQRPayload,
  copyText,
  downloadDataURL,
  downloadSVG,
  generateBarcodeSVG,
  generateQRDataURL,
  generateQRSVG,
  getDefaultBarcodeSettings,
  getDefaultQRSettings,
  validateBarcodeValue,
  validateQRInput,
  type BarcodeFormat,
  type GeneratorMode,
  type QRFormat,
  type QRErrorCorrection,
} from "./qrBarcodeLogic";

/* =========================================================
   Reusable styling
========================================================= */

const inputClass =
  "h-9 w-full rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20";

const dropdownTriggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-xeoo-border bg-xeoo-bg px-3 text-left text-[11px] font-medium text-xeoo-text outline-none transition focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const buttonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-xeoo-primary px-3 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const outlineButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-xeoo-border bg-transparent px-3 text-[12px] font-medium text-xeoo-text transition hover:bg-xeoo-bg hover:text-xeoo-text disabled:cursor-not-allowed disabled:opacity-60";

const errorTextClass =
  "mt-1.5 text-[11px] font-medium leading-4 text-xeoo-danger";

/* =========================================================
   Panel
========================================================= */

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-lg border border-xeoo-border bg-xeoo-surface p-2.5 ${className}`}
    >
      {children}
    </section>
  );
}

/* =========================================================
   Section Label
========================================================= */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-xeoo-muted">
      {children}
    </div>
  );
}

/* =========================================================
   Dropdown
========================================================= */

interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

interface LuxuryDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const QR_FORMATS: DropdownOption[] = [
  {
    value: "text",
    label: "Text",
    description: "Plain text content",
    icon: Type,
  },
  {
    value: "url",
    label: "Website URL",
    description: "Open a website link",
    icon: Link,
  },
  {
    value: "email",
    label: "Email",
    description: "Create an email link",
    icon: Mail,
  },
  {
    value: "phone",
    label: "Phone",
    description: "Create a phone number link",
    icon: Smartphone,
  },
  {
    value: "wifi",
    label: "Wi-Fi",
    description: "Share wireless credentials",
    icon: Wifi,
  },
];

const WIFI_SECURITY_OPTIONS: DropdownOption[] = [
  {
    value: "WPA",
    label: "WPA / WPA2 / WPA3",
    description: "Recommended security",
  },
  {
    value: "WEP",
    label: "WEP",
    description: "Legacy wireless security",
  },
  {
    value: "nopass",
    label: "No Password",
    description: "Open wireless network",
  },
];

const QR_ERROR_OPTIONS: DropdownOption[] = [
  {
    value: "L",
    label: "L — Low",
    description: "7% recovery capacity",
  },
  {
    value: "M",
    label: "M — Medium",
    description: "15% recovery capacity",
  },
  {
    value: "Q",
    label: "Q — Quartile",
    description: "25% recovery capacity",
  },
  {
    value: "H",
    label: "H — High",
    description: "30% recovery capacity",
  },
];

const BARCODE_FORMATS: DropdownOption[] = [
  {
    value: "CODE128",
    label: "CODE 128",
    description: "General purpose barcode",
    icon: Barcode,
  },
  {
    value: "CODE39",
    label: "CODE 39",
    description: "Industrial barcode",
    icon: Barcode,
  },
  {
    value: "EAN13",
    label: "EAN-13",
    description: "Retail / product barcode",
    icon: Barcode,
  },
  {
    value: "EAN8",
    label: "EAN-8",
    description: "Compact retail barcode",
    icon: Barcode,
  },
  {
    value: "UPC",
    label: "UPC-A",
    description: "Retail / US barcode",
    icon: Barcode,
  },
  {
    value: "ITF14",
    label: "ITF-14",
    description: "Packaging barcode",
    icon: Barcode,
  },
];

function LuxuryDropdown({
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: LuxuryDropdownProps) {
  const [open, setOpen] = useState(false);

  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const [openUp, setOpenUp] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const SelectedIcon = selected?.icon;

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();

    const viewportPadding = 10;
    const gap = 6;

    const availableBelow =
      window.innerHeight - rect.bottom - viewportPadding - gap;

    const availableAbove = rect.top - viewportPadding - gap;

    const estimatedHeight = Math.min(options.length * 58 + 12, 330);

    const shouldOpenUp =
      availableBelow < estimatedHeight && availableAbove > availableBelow;

    const availableHeight = Math.max(
      150,
      shouldOpenUp ? availableAbove : availableBelow,
    );

    const menuWidth = Math.min(
      Math.max(rect.width, 240),
      window.innerWidth - viewportPadding * 2,
    );

    let left = rect.left;

    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - menuWidth - viewportPadding;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    setOpenUp(shouldOpenUp);

    setMenuStyle({
      position: "fixed",
      left,
      width: menuWidth,
      maxHeight: availableHeight,
      zIndex: 99999,
      ...(shouldOpenUp
        ? {
            bottom: window.innerHeight - rect.top + gap,
          }
        : {
            top: rect.bottom + gap,
          }),
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleResize = () => updatePosition();

    const handleScroll = () => updatePosition();

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleEscape);

    window.addEventListener("resize", handleResize);

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("resize", handleResize);

      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, options.length]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    if (!open) {
      updatePosition();
    }

    setOpen((current) => !current);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${dropdownTriggerClass} ${
          open ? "border-xeoo-primary/60" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {SelectedIcon ? (
            <SelectedIcon size={13} className="shrink-0 text-xeoo-muted" />
          ) : (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-xeoo-border bg-xeoo-surface text-[11px] text-xeoo-muted">
              •
            </span>
          )}

          <span className="min-w-0 truncate">
            {selected?.label ?? placeholder}
          </span>
        </div>

        <ChevronDown
          size={12}
          className={`shrink-0 text-xeoo-muted transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className={`overflow-hidden rounded-md border border-xeoo-border bg-xeoo-surface p-1 shadow-xl ${
              openUp ? "origin-bottom" : "origin-top"
            }`}
            role="listbox"
          >
            <div className="max-h-full overflow-y-auto">
              {options.map((option) => {
                const Icon = option.icon;

                const selected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(option.value);

                      setOpen(false);
                    }}
                    className={`flex min-h-9 w-full items-center gap-2 rounded px-2 py-1.5 text-left transition ${
                      selected
                        ? "bg-xeoo-primary text-white"
                        : "text-xeoo-text hover:bg-xeoo-bg"
                    }`}
                  >
                    {Icon ? (
                      <Icon
                        size={13}
                        className={`shrink-0 ${
                          selected ? "text-white" : "text-xeoo-muted"
                        }`}
                      />
                    ) : (
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px] ${
                          selected
                            ? "border-white/30 text-white"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted"
                        }`}
                      >
                        •
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[11px] font-semibold ${
                          selected ? "text-white" : "text-xeoo-text"
                        }`}
                      >
                        {option.label}
                      </span>

                      {option.description && (
                        <span
                          className={`mt-0.5 block truncate text-[11px] leading-4 ${
                            selected ? "text-white/80" : "text-xeoo-muted"
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </span>

                    {selected && (
                      <Check size={11} className="shrink-0 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/* =========================================================
   Main component
========================================================= */

export default function QrBarcodeGenerator() {
  const [mode, setMode] = useState<GeneratorMode>("qr");

  /* QR */

  const [qrFormat, setQrFormat] = useState<QRFormat>("text");

  const [qrValue, setQrValue] = useState("");

  const [wifiPassword, setWifiPassword] = useState("");

  const [wifiSecurity, setWifiSecurity] = useState("WPA");

  const [wifiHidden, setWifiHidden] = useState(false);

  /* Barcode */

  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("CODE128");

  const [barcodeValue, setBarcodeValue] = useState("");

  /* Settings */

  const [qrSettings, setQrSettings] = useState(getDefaultQRSettings());

  const [barcodeSettings, setBarcodeSettings] = useState(
    getDefaultBarcodeSettings(),
  );

  /* Generated */

  const [qrDataURL, setQrDataURL] = useState("");

  const [qrSVG, setQrSVG] = useState("");

  const [barcodeSVG, setBarcodeSVG] = useState("");

  const [barcodePNG, setBarcodePNG] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  /* =======================================================
     QR validation
  ======================================================= */

  const qrValidation = useMemo(
    () => validateQRInput(qrFormat, qrValue, wifiPassword, wifiSecurity),
    [qrFormat, qrValue, wifiPassword, wifiSecurity],
  );

  /* =======================================================
     QR payload
  ======================================================= */

  const qrPayload = useMemo(() => {
    if (!qrValue.trim() || !qrValidation.valid) {
      return "";
    }

    return buildQRPayload(
      qrValue,
      qrFormat,
      wifiPassword,
      wifiSecurity,
      wifiHidden,
    );
  }, [
    qrValue,
    qrFormat,
    wifiPassword,
    wifiSecurity,
    wifiHidden,
    qrValidation.valid,
  ]);

  /* =======================================================
     Barcode validation
  ======================================================= */

  const barcodeValidation = useMemo(
    () => validateBarcodeValue(barcodeValue, barcodeFormat),
    [barcodeValue, barcodeFormat],
  );

  /* =======================================================
     QR generation
  ======================================================= */

  useEffect(() => {
    if (mode !== "qr" || !qrPayload || !qrValidation.valid) {
      setQrDataURL("");
      setQrSVG("");
      return;
    }

    let cancelled = false;

    const generate = async () => {
      try {
        setIsGenerating(true);

        const [dataURL, svg] = await Promise.all([
          generateQRDataURL(qrPayload, qrSettings),
          generateQRSVG(qrPayload, qrSettings),
        ]);

        if (!cancelled) {
          setQrDataURL(dataURL);

          setQrSVG(svg);
        }
      } catch {
        if (!cancelled) {
          setQrDataURL("");
          setQrSVG("");
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    };

    void generate();

    return () => {
      cancelled = true;
    };
  }, [mode, qrPayload, qrSettings, qrValidation.valid]);

  /* =======================================================
     Barcode generation
  ======================================================= */

  useEffect(() => {
    if (
      mode !== "barcode" ||
      !barcodeValue.trim() ||
      !barcodeValidation.valid
    ) {
      setBarcodeSVG("");
      setBarcodePNG("");
      return;
    }

    let cancelled = false;

    const generate = async () => {
      try {
        setIsGenerating(true);

        const svg = generateBarcodeSVG(
          barcodeValue,
          barcodeFormat,
          barcodeSettings,
        );

        const png = await barcodeSVGToDataURL(svg);

        if (!cancelled) {
          setBarcodeSVG(svg);
          setBarcodePNG(png);
        }
      } catch {
        if (!cancelled) {
          setBarcodeSVG("");
          setBarcodePNG("");
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    };

    void generate();

    return () => {
      cancelled = true;
    };
  }, [
    mode,
    barcodeValue,
    barcodeFormat,
    barcodeSettings,
    barcodeValidation.valid,
  ]);

  /* =======================================================
     Downloads
  ======================================================= */

  const handleDownloadQRPNG = () => {
    if (!qrDataURL) {
      showError("QR Code is not available.");
      return;
    }

    downloadDataURL(qrDataURL, "qr-xeootools.png");

    showSuccess("QR Code downloaded successfully.");
  };

  const handleDownloadQRSVG = () => {
    if (!qrSVG) {
      showError("QR Code is not available.");
      return;
    }

    downloadSVG(qrSVG, "qr-xeootools.svg");

    showSuccess("QR Code SVG downloaded successfully.");
  };

  const handleDownloadBarcodePNG = () => {
    if (!barcodePNG) {
      showError("Barcode is not available.");
      return;
    }

    downloadDataURL(barcodePNG, "barcode-xeootools.png");

    showSuccess("Barcode downloaded successfully.");
  };

  const handleDownloadBarcodeSVG = () => {
    if (!barcodeSVG) {
      showError("Barcode is not available.");
      return;
    }

    downloadSVG(barcodeSVG, "barcode-xeootools.svg");

    showSuccess("Barcode SVG downloaded successfully.");
  };

  /* =======================================================
     Copy
  ======================================================= */

  const handleCopyQR = async () => {
    if (!qrPayload) {
      showError("There is no valid QR data to copy.");
      return;
    }

    try {
      await copyText(qrPayload);

      showSuccess("QR data copied successfully.");
    } catch {
      showError("Failed to copy QR data.");
    }
  };

  const handleCopyBarcode = async () => {
    if (!barcodeValue.trim() || !barcodeValidation.valid) {
      showError("There is no valid barcode data to copy.");
      return;
    }

    try {
      await copyText(barcodeValue.trim());

      showSuccess("Barcode data copied successfully.");
    } catch {
      showError("Failed to copy barcode data.");
    }
  };

  /* =======================================================
     Reset
  ======================================================= */

  const handleReset = () => {
    setQrFormat("text");
    setQrValue("");

    setWifiPassword("");
    setWifiSecurity("WPA");
    setWifiHidden(false);

    setBarcodeFormat("CODE128");

    setBarcodeValue("");

    setQrSettings(getDefaultQRSettings());

    setBarcodeSettings(getDefaultBarcodeSettings());

    setQrDataURL("");
    setQrSVG("");

    setBarcodeSVG("");
    setBarcodePNG("");
  };

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-2.5 py-2.5 sm:px-3 sm:py-3">
          <Panel className="flex min-h-0 flex-1 flex-col p-2">
            {/* MODE */}

            <div className="mb-2 shrink-0">
              <div className="flex w-full gap-1 rounded-md border border-xeoo-border bg-xeoo-bg p-1">
                <button
                  type="button"
                  onClick={() => setMode("qr")}
                  className={`flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded px-1.5 text-[11px] font-semibold leading-none transition-all duration-150 sm:h-8 ${
                    mode === "qr"
                      ? "bg-xeoo-primary text-white shadow-sm"
                      : "text-xeoo-text-soft hover:bg-xeoo-surface hover:text-xeoo-text"
                  }`}
                >
                  <QrCode size={13} />
                  <span className="truncate">QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("barcode")}
                  className={`flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded px-1.5 text-[11px] font-semibold leading-none transition-all duration-150 sm:h-8 ${
                    mode === "barcode"
                      ? "bg-xeoo-primary text-white shadow-sm"
                      : "text-xeoo-text-soft hover:bg-xeoo-surface hover:text-xeoo-text"
                  }`}
                >
                  <Barcode size={13} />
                  <span className="truncate">Barcode</span>
                </button>
              </div>
            </div>

            {/* TOOL GRID */}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)]">
              {/* FORM */}

              <Panel className="flex min-h-0 flex-col p-2.5 lg:col-span-7">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  {mode === "qr" ? (
                    <QRForm
                      qrFormat={qrFormat}
                      qrValue={qrValue}
                      wifiPassword={wifiPassword}
                      wifiSecurity={wifiSecurity}
                      wifiHidden={wifiHidden}
                      settings={qrSettings}
                      validation={qrValidation}
                      onFormatChange={setQrFormat}
                      onValueChange={setQrValue}
                      onWifiPasswordChange={setWifiPassword}
                      onWifiSecurityChange={setWifiSecurity}
                      onWifiHiddenChange={setWifiHidden}
                      onSettingsChange={setQrSettings}
                    />
                  ) : (
                    <BarcodeForm
                      format={barcodeFormat}
                      value={barcodeValue}
                      settings={barcodeSettings}
                      validation={barcodeValidation}
                      onFormatChange={setBarcodeFormat}
                      onValueChange={setBarcodeValue}
                      onSettingsChange={setBarcodeSettings}
                    />
                  )}
                </div>

                <div className="mt-2 shrink-0 border-t border-xeoo-border pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`${outlineButtonClass} w-full`}
                  >
                    <RefreshCw size={13} />
                    Reset
                  </button>
                </div>
              </Panel>

              {/* PREVIEW */}

              <Panel className="flex min-h-[360px] min-w-0 flex-col p-2.5 lg:col-span-5 lg:min-h-0">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                  <div className="text-[12px] font-semibold text-xeoo-text">
                    Preview
                  </div>

                  {isGenerating && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-xeoo-muted">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-xeoo-border-dark border-t-xeoo-primary" />
                      Generating
                    </div>
                  )}
                </div>

                <div className="flex min-h-[280px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md border border-dashed border-xeoo-border-dark bg-xeoo-bg p-2 lg:min-h-0">
                  {mode === "qr" ? (
                    qrDataURL ? (
                      <div className="flex w-full min-w-0 flex-col items-center">
                        <div className="max-w-full rounded-lg border border-xeoo-border bg-white p-2">
                          <img
                            src={qrDataURL}
                            alt="Generated QR Code"
                            className="h-auto w-auto max-w-[210px] object-contain"
                          />
                        </div>

                        <p className="mt-1.5 max-w-full truncate text-center text-[11px] text-xeoo-muted">
                          {qrPayload}
                        </p>
                      </div>
                    ) : (
                      <EmptyPreview
                        icon={QrCode}
                        title="QR Code is not generated yet"
                        description="Enter valid content to generate a QR Code."
                      />
                    )
                  ) : barcodePNG ? (
                    <div className="flex w-full min-w-0 flex-col items-center">
                      <div className="max-w-full rounded-lg border border-xeoo-border bg-white p-2">
                        <img
                          src={barcodePNG}
                          alt="Generated barcode"
                          className="h-auto max-w-[400px] object-contain"
                        />
                      </div>

                      <p className="mt-1.5 max-w-full truncate text-center text-[11px] text-xeoo-muted">
                        {barcodeValue}
                      </p>
                    </div>
                  ) : (
                    <EmptyPreview
                      icon={Barcode}
                      title="Barcode is not generated yet"
                      description="Enter a valid value to generate a barcode."
                    />
                  )}
                </div>

                {/* ACTIONS */}

                <div className="mt-2 grid shrink-0 grid-cols-3 gap-1.5">
                  {mode === "qr" ? (
                    <>
                      <ActionButton
                        icon={Download}
                        label="PNG"
                        disabled={!qrDataURL}
                        onClick={handleDownloadQRPNG}
                        primary
                      />

                      <ActionButton
                        icon={Download}
                        label="SVG"
                        disabled={!qrSVG}
                        onClick={handleDownloadQRSVG}
                      />

                      <ActionButton
                        icon={Clipboard}
                        label="Copy"
                        disabled={!qrPayload}
                        onClick={() => void handleCopyQR()}
                      />
                    </>
                  ) : (
                    <>
                      <ActionButton
                        icon={Download}
                        label="PNG"
                        disabled={!barcodePNG}
                        onClick={handleDownloadBarcodePNG}
                        primary
                      />

                      <ActionButton
                        icon={Download}
                        label="SVG"
                        disabled={!barcodeSVG}
                        onClick={handleDownloadBarcodeSVG}
                      />

                      <ActionButton
                        icon={Clipboard}
                        label="Copy"
                        disabled={
                          !barcodeValue.trim() || !barcodeValidation.valid
                        }
                        onClick={() => void handleCopyBarcode()}
                      />
                    </>
                  )}
                </div>
              </Panel>
            </div>
          </Panel>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   QR FORM
========================================================= */

interface QRFormProps {
  qrFormat: QRFormat;
  qrValue: string;
  wifiPassword: string;
  wifiSecurity: string;
  wifiHidden: boolean;
  settings: ReturnType<typeof getDefaultQRSettings>;
  validation: {
    valid: boolean;
    message?: string;
    field?: "content" | "password" | "security";
  };
  onFormatChange: (value: QRFormat) => void;
  onValueChange: (value: string) => void;
  onWifiPasswordChange: (value: string) => void;
  onWifiSecurityChange: (value: string) => void;
  onWifiHiddenChange: (value: boolean) => void;
  onSettingsChange: (value: ReturnType<typeof getDefaultQRSettings>) => void;
}

function QRForm({
  qrFormat,
  qrValue,
  wifiPassword,
  wifiSecurity,
  wifiHidden,
  settings,
  validation,
  onFormatChange,
  onValueChange,
  onWifiPasswordChange,
  onWifiSecurityChange,
  onWifiHiddenChange,
  onSettingsChange,
}: QRFormProps) {
  const isWifi = qrFormat === "wifi";

  const showContentError = Boolean(
    qrValue.trim() && !validation.valid && validation.field === "content",
  );

  const showPasswordError = Boolean(
    qrValue.trim() && !validation.valid && validation.field === "password",
  );

  const showSecurityError = Boolean(
    qrValue.trim() && !validation.valid && validation.field === "security",
  );

  return (
    <div className="space-y-2.5">
      {/* QR TYPE */}

      <div>
        <SectionLabel>QR Type</SectionLabel>

        <LuxuryDropdown
          value={qrFormat}
          options={QR_FORMATS}
          onChange={(value) => onFormatChange(value as QRFormat)}
        />
      </div>

      {/* CONTENT */}

      <div>
        <SectionLabel>
          {isWifi
            ? "Wi-Fi Name / SSID"
            : qrFormat === "url"
              ? "Website URL"
              : qrFormat === "email"
                ? "Email Address"
                : qrFormat === "phone"
                  ? "Phone Number"
                  : "Text Content"}
        </SectionLabel>

        {isWifi ? (
          <input
            type="text"
            value={qrValue}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder="Wi-Fi network name"
            aria-invalid={showContentError}
            className={`${inputClass} ${
              showContentError
                ? "border-xeoo-danger focus:border-xeoo-danger focus:ring-1 focus:ring-xeoo-danger/20"
                : ""
            }`}
          />
        ) : (
          <textarea
            value={qrValue}
            onChange={(event) => onValueChange(event.target.value)}
            rows={qrFormat === "text" ? 3 : 2}
            placeholder={getQRPlaceholder(qrFormat)}
            aria-invalid={showContentError}
            className={`min-h-[68px] w-full resize-y rounded-md border bg-xeoo-bg px-3 py-2 text-[12px] leading-5 text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20 ${
              showContentError
                ? "border-xeoo-danger focus:border-xeoo-danger focus:ring-1 focus:ring-xeoo-danger/20"
                : "border-xeoo-border"
            }`}
          />
        )}

        {showContentError && (
          <p className={errorTextClass}>{validation.message}</p>
        )}
      </div>

      {/* WIFI DETAILS */}

      {isWifi && (
        <div className="rounded-md border border-xeoo-border bg-xeoo-bg p-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            {/* PASSWORD */}

            <div className="min-w-0">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-xeoo-text">
                Password
              </label>

              <input
                type="text"
                value={wifiPassword}
                onChange={(event) => onWifiPasswordChange(event.target.value)}
                placeholder="Wi-Fi password"
                aria-invalid={showPasswordError}
                className={`${inputClass} ${
                  showPasswordError
                    ? "border-xeoo-danger focus:border-xeoo-danger focus:ring-1 focus:ring-xeoo-danger/20"
                    : ""
                }`}
              />
            </div>

            {/* SECURITY */}

            <div className="min-w-0">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-xeoo-text">
                Security
              </label>

              <LuxuryDropdown
                value={wifiSecurity}
                options={WIFI_SECURITY_OPTIONS}
                onChange={onWifiSecurityChange}
              />
            </div>

            {/* HIDDEN */}

            <label className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-xeoo-text">
              <input
                type="checkbox"
                checked={wifiHidden}
                onChange={(event) => onWifiHiddenChange(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-xeoo-border accent-xeoo-primary"
              />

              <span>Hidden</span>
            </label>
          </div>

          {showPasswordError && (
            <p className={errorTextClass}>{validation.message}</p>
          )}

          {showSecurityError && (
            <p className={errorTextClass}>{validation.message}</p>
          )}
        </div>
      )}

      {/* APPEARANCE */}

      <div className="rounded-md border border-xeoo-border bg-xeoo-bg p-2">
        <SectionLabel>Appearance</SectionLabel>

        <div className="grid gap-2 sm:grid-cols-3">
          <RangeField
            id="qr-size"
            label="Size"
            value={settings.size}
            min={160}
            max={800}
            step={10}
            suffix="px"
            onChange={(value) =>
              onSettingsChange({
                ...settings,
                size: value,
              })
            }
          />

          <RangeField
            id="qr-margin"
            label="Margin"
            value={settings.margin}
            min={0}
            max={10}
            step={1}
            onChange={(value) =>
              onSettingsChange({
                ...settings,
                margin: value,
              })
            }
          />

          <div className="min-w-0">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-xeoo-text">
              Error Correction
            </label>

            <LuxuryDropdown
              value={settings.errorCorrection}
              options={QR_ERROR_OPTIONS}
              onChange={(value) =>
                onSettingsChange({
                  ...settings,
                  errorCorrection: value as QRErrorCorrection,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BARCODE FORM
========================================================= */

interface BarcodeFormProps {
  format: BarcodeFormat;
  value: string;
  settings: ReturnType<typeof getDefaultBarcodeSettings>;
  validation: {
    valid: boolean;
    message?: string;
  };
  onFormatChange: (value: BarcodeFormat) => void;
  onValueChange: (value: string) => void;
  onSettingsChange: (
    value: ReturnType<typeof getDefaultBarcodeSettings>,
  ) => void;
}

function BarcodeForm({
  format,
  value,
  settings,
  validation,
  onFormatChange,
  onValueChange,
  onSettingsChange,
}: BarcodeFormProps) {
  const showError = Boolean(value && !validation.valid);

  return (
    <div className="space-y-2.5">
      {/* FORMAT */}

      <div>
        <SectionLabel>Barcode Format</SectionLabel>

        <LuxuryDropdown
          value={format}
          options={BARCODE_FORMATS}
          onChange={(value) => onFormatChange(value as BarcodeFormat)}
        />
      </div>

      {/* VALUE */}

      <div>
        <SectionLabel>Barcode Value</SectionLabel>

        <input
          type="text"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={getBarcodePlaceholder(format)}
          aria-invalid={showError}
          className={`${inputClass} ${
            showError
              ? "border-xeoo-danger focus:border-xeoo-danger focus:ring-1 focus:ring-xeoo-danger/20"
              : ""
          }`}
        />

        {showError && <p className={errorTextClass}>{validation.message}</p>}

        {!value && (
          <p className="mt-1.5 text-[11px] leading-4 text-xeoo-muted">
            {getBarcodeHint(format)}
          </p>
        )}
      </div>

      {/* APPEARANCE */}

      <div className="rounded-md border border-xeoo-border bg-xeoo-bg p-2">
        <SectionLabel>Appearance</SectionLabel>

        <div className="grid gap-2 sm:grid-cols-2">
          <RangeField
            id="barcode-width"
            label="Bar Width"
            value={settings.width}
            min={1}
            max={5}
            step={1}
            suffix="px"
            onChange={(value) =>
              onSettingsChange({
                ...settings,
                width: value,
              })
            }
          />

          <RangeField
            id="barcode-height"
            label="Height"
            value={settings.height}
            min={50}
            max={250}
            step={5}
            suffix="px"
            onChange={(value) =>
              onSettingsChange({
                ...settings,
                height: value,
              })
            }
          />
        </div>

        <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[11px] text-xeoo-text">
          <input
            type="checkbox"
            checked={settings.displayValue}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                displayValue: event.target.checked,
              })
            }
            className="h-3.5 w-3.5 rounded border-xeoo-border accent-xeoo-primary"
          />

          <span>Show value below barcode</span>
        </label>
      </div>
    </div>
  );
}

/* =========================================================
   RANGE FIELD
========================================================= */

interface RangeFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: RangeFieldProps) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-xeoo-text"
      >
        <span>{label}</span>

        <span className="font-semibold normal-case tracking-normal text-xeoo-text">
          {value}
          {suffix}
        </span>
      </label>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-4 w-full cursor-pointer accent-xeoo-primary"
      />
    </div>
  );
}

/* =========================================================
   EMPTY PREVIEW
========================================================= */

interface EmptyPreviewProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function EmptyPreview({ icon: Icon, title, description }: EmptyPreviewProps) {
  return (
    <div className="flex max-w-[240px] flex-col items-center text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface text-xeoo-muted">
        <Icon size={18} />
      </div>

      <div className="text-[12px] font-semibold text-xeoo-text">{title}</div>

      <div className="mt-1 text-[11px] leading-4 text-xeoo-muted">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  primary?: boolean;
  onClick: () => void;
}

function ActionButton({
  icon: Icon,
  label,
  disabled = false,
  primary = false,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        primary ? `${buttonClass} w-full` : `${outlineButtonClass} w-full`
      }
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

/* =========================================================
   QR PLACEHOLDER
========================================================= */

function getQRPlaceholder(format: QRFormat): string {
  switch (format) {
    case "url":
      return "https://example.com";

    case "email":
      return "name@example.com";

    case "phone":
      return "+62 812 3456 7890";

    case "wifi":
      return "Wi-Fi network name";

    case "text":
    default:
      return "Enter plain text content...";
  }
}

/* =========================================================
   BARCODE PLACEHOLDER
========================================================= */

function getBarcodePlaceholder(format: BarcodeFormat): string {
  switch (format) {
    case "EAN13":
      return "899123456789";

    case "EAN8":
      return "1234567";

    case "UPC":
      return "01234567890";

    case "ITF14":
      return "1234567890123";

    case "CODE39":
      return "XEOTOOLS-2026";

    case "CODE128":
    default:
      return "XEOTOOLS-123456";
  }
}

/* =========================================================
   BARCODE HINT
========================================================= */

function getBarcodeHint(format: BarcodeFormat): string {
  switch (format) {
    case "EAN13":
      return "Enter 12 or 13 digits.";

    case "EAN8":
      return "Enter 7 or 8 digits.";

    case "UPC":
      return "Enter 11 or 12 digits.";

    case "ITF14":
      return "Enter 13 or 14 digits.";

    case "CODE39":
      return "Supports uppercase letters, numbers, spaces, and - . $ / + %.";

    case "CODE128":
    default:
      return "CODE 128 supports a wide range of text and numbers.";
  }
}
