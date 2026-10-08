import {
  AlertTriangle,
  Check,
  Download,
  Eye,
  EyeOff,
  FileKey,
  FileText,
  Lock,
  RotateCcw,
  Unlock,
  Upload,
  LoaderCircle,
} from "lucide-react";
import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { showConfirm, showError, showSuccess } from "../../alert";
import {
  decryptFile,
  encryptFile,
  formatBytes,
  generateReminderText,
  sanitizeReminderFileName,
  type DecryptionResult,
  type EncryptionResult,
} from "./fileEncryptorLogic";

type ModeTab = "encode" | "decode";
type ProcessStatus = "idle" | "processing" | "completed" | "error";

export default function FileEncryptor() {
  const [tab, setTab] = useState<ModeTab>("encode");
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ENCODE (ENCRYPT) STATES
  const [encodeFile, setEncodeFile] = useState<File | null>(null);
  const [encodePassword, setEncodePassword] = useState("");
  const [encodeConfirmPassword, setEncodeConfirmPassword] = useState("");
  const [showEncodePassword, setShowEncodePassword] = useState(false);
  const [encryptionResult, setEncryptionResult] = useState<EncryptionResult | null>(null);

  // REMINDER FILE STATES
  const [passwordHint, setPasswordHint] = useState("");
  const [notes, setNotes] = useState("");
  const [customReminderName, setCustomReminderName] = useState("");
  const [includePasswordInReminder, setIncludePasswordInReminder] = useState(false);

  // DECODE (DECRYPT) STATES
  const [decodeFile, setDecodeFile] = useState<File | null>(null);
  const [decodePassword, setDecodePassword] = useState("");
  const [showDecodePassword, setShowDecodePassword] = useState(false);
  const [decryptionResult, setDecryptionResult] = useState<DecryptionResult | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEncodeFileSelect = (file: File) => {
    setEncodeFile(file);
    setEncryptionResult(null);
    setErrorMsg("");
    setStatus("idle");
    setCustomReminderName(`${file.name}.xeoo-reminder.txt`);
    setPasswordHint("");
    setNotes("");
    setIncludePasswordInReminder(false);
  };

  const handleDecodeFileSelect = (file: File) => {
    setDecodeFile(file);
    setDecryptionResult(null);
    setErrorMsg("");
    setStatus("idle");
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (tab === "encode") {
      handleEncodeFileSelect(file);
    } else {
      handleDecodeFileSelect(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tab === "encode") {
      handleEncodeFileSelect(file);
    } else {
      handleDecodeFileSelect(file);
    }
    e.target.value = "";
  };

  const handleReset = () => {
    if (tab === "encode") {
      setEncodeFile(null);
      setEncodePassword("");
      setEncodeConfirmPassword("");
      setEncryptionResult(null);
      setPasswordHint("");
      setNotes("");
      setCustomReminderName("");
      setIncludePasswordInReminder(false);
    } else {
      setDecodeFile(null);
      setDecodePassword("");
      setDecryptionResult(null);
    }
    setErrorMsg("");
    setStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEncryptSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!encodeFile) {
      setErrorMsg("Please select a target file to encrypt.");
      void showError("File Required", "Please select a target file to encrypt.");
      return;
    }
    if (!encodePassword) {
      setErrorMsg("Please enter an encryption password.");
      void showError("Password Required", "Please enter an encryption password.");
      return;
    }
    if (encodePassword.length < 4) {
      setErrorMsg("Password must be at least 4 characters long.");
      void showError("Password Too Short", "Password must be at least 4 characters.");
      return;
    }
    if (encodePassword !== encodeConfirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      void showError("Password Mismatch", "Passwords do not match. Please verify.");
      return;
    }

    setErrorMsg("");
    setStatus("processing");
    try {
      const res = await encryptFile(encodeFile, encodePassword);
      setEncryptionResult(res);
      setStatus("completed");
      void showSuccess("Encryption Complete", `"${res.encryptedFileName}" generated successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Encryption process failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Encryption Failed", msg);
    }
  };

  const handleDecryptSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!decodeFile) {
      setErrorMsg("Please select an encrypted (.xeenc) file.");
      void showError("File Required", "Please select an encrypted (.xeenc) file.");
      return;
    }
    if (!decodePassword) {
      setErrorMsg("Please enter the decryption password.");
      void showError("Password Required", "Please enter the decryption password.");
      return;
    }

    setErrorMsg("");
    setStatus("processing");
    try {
      const res = await decryptFile(decodeFile, decodePassword);
      setDecryptionResult(res);
      setStatus("completed");
      void showSuccess("Decryption Complete", "File verified and restored successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Decryption failed.";
      setErrorMsg(msg);
      setStatus("error");
      void showError("Decryption Failed", msg);
    }
  };

  const handleDownloadEncryptedFile = () => {
    if (!encryptionResult) return;
    const url = URL.createObjectURL(encryptionResult.encryptedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = encryptionResult.encryptedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDecryptedFile = () => {
    if (!decryptionResult) return;
    const url = URL.createObjectURL(decryptionResult.decryptedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = decryptionResult.originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleIncludePassword = async () => {
    if (!includePasswordInReminder) {
      const confirmed = await showConfirm(
        "Security Caution",
        "Anyone who accesses this reminder file will be able to read your password and decrypt the file. Do you wish to continue?"
      );
      if (confirmed) {
        setIncludePasswordInReminder(true);
      }
    } else {
      setIncludePasswordInReminder(false);
    }
  };

  const handleDownloadReminder = () => {
    if (!encryptionResult || !encodeFile) return;

    const defaultName = `${encodeFile.name}.xeoo-reminder.txt`;
    const finalReminderFileName = sanitizeReminderFileName(customReminderName, defaultName);

    const reminderText = generateReminderText({
      originalFileName: encodeFile.name,
      encryptedFileName: encryptionResult.encryptedFileName,
      metadata: encryptionResult.metadata,
      passwordHint,
      notes,
      includePassword: includePasswordInReminder,
      password: encodePassword,
    });

    const blob = new Blob([reminderText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalReminderFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusBadge = () => {
    switch (status) {
      case "processing":
        return {
          label: tab === "encode" ? "Encrypting..." : "Decrypting...",
          badge: "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500 dark:text-white",
        };
      case "completed":
        return {
          label: "Completed",
          badge: "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-600 dark:text-white",
        };
      case "error":
        return {
          label: "Error",
          badge: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-600 dark:text-white",
        };
      default:
        return {
          label: (tab === "encode" ? encodeFile : decodeFile) ? "Ready" : "Waiting for File",
          badge: "border-slate-500 bg-slate-500 text-white dark:border-slate-400 dark:bg-slate-600 dark:text-white",
        };
    }
  };

  const meta = statusBadge();
  const currentFile = tab === "encode" ? encodeFile : decodeFile;

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          {/* ================================================================
              WORKSPACE CARD
          ================================================================ */}
          <section className="self-start overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-xeoo-border px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xeoo-primary-soft text-xeoo-primary">
                  {tab === "encode" ? <Lock size={15} strokeWidth={2} /> : <Unlock size={15} strokeWidth={2} />}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xs font-extrabold text-xeoo-text sm:text-sm">
                    FILE ENCRYPTOR
                  </h1>
                  <p className="truncate text-[11px] text-xeoo-muted">
                    Secure client-side AES-256-GCM file encryption and decryption.
                  </p>
                </div>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-white ${status === "processing" ? "animate-pulse" : ""}`} />
                {meta.label}
              </span>
            </div>

            {/* MODE SWITCHER & FORM */}
            <div className="p-3 sm:p-4 space-y-3">
              {/* TABS */}
              <div className="flex flex-wrap items-center gap-2 border-b border-xeoo-border pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setTab("encode");
                    setStatus("idle");
                    setErrorMsg("");
                  }}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-[11px] font-bold transition-colors active:scale-[0.98] ${
                    tab === "encode"
                      ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                  }`}
                >
                  <Lock size={12} />
                  <span>Encode (Encrypt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab("decode");
                    setStatus("idle");
                    setErrorMsg("");
                  }}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-[11px] font-bold transition-colors active:scale-[0.98] ${
                    tab === "decode"
                      ? "border-xeoo-text bg-xeoo-text text-xeoo-surface shadow-xs"
                      : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                  }`}
                >
                  <Unlock size={12} />
                  <span>Decode (Decrypt)</span>
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={tab === "encode" ? handleEncryptSubmit : handleDecryptSubmit} noValidate className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={tab === "decode" ? ".xeenc" : undefined}
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* DROPZONE */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                    {tab === "encode" ? "Target File to Encrypt" : "Encrypted File (.xeenc)"}
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all sm:p-5 ${
                      isDragging
                        ? "border-xeoo-primary bg-xeoo-primary-soft/20 scale-[0.99]"
                        : currentFile
                        ? "border-xeoo-primary/40 bg-xeoo-primary-soft/10"
                        : "border-xeoo-border bg-xeoo-bg hover:border-xeoo-primary/60 hover:bg-xeoo-surface-soft/60"
                    }`}
                  >
                    {currentFile ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-primary-soft text-xeoo-primary">
                          <FileKey size={20} />
                        </div>
                        <div className="min-w-0 max-w-md">
                          <p className="truncate text-xs font-bold text-xeoo-text">
                            {currentFile.name}
                          </p>
                          <p className="font-mono text-[11px] text-xeoo-muted">
                            {formatBytes(currentFile.size)} &bull; Click to change file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-xeoo-surface-soft text-xeoo-muted group-hover:scale-105 transition-transform">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-xeoo-text">
                            {tab === "encode"
                              ? "Choose a file or drag & drop here"
                              : "Choose an encrypted (.xeenc) file"}
                          </p>
                          <p className="text-[11px] text-xeoo-muted">
                            Processed client-side only via Web Crypto API (no upload)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PASSWORD FIELDS */}
                {tab === "encode" ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Encryption Password
                      </label>
                      <div className="relative">
                        <input
                          type={showEncodePassword ? "text" : "password"}
                          value={encodePassword}
                          onChange={(e) => setEncodePassword(e.target.value)}
                          placeholder="Enter strong password"
                          className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface pl-3 pr-8 text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEncodePassword(!showEncodePassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xeoo-muted hover:text-xeoo-text"
                          aria-label={showEncodePassword ? "Hide password" : "Show password"}
                        >
                          {showEncodePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                        Confirm Password
                      </label>
                      <input
                        type={showEncodePassword ? "text" : "password"}
                        value={encodeConfirmPassword}
                        onChange={(e) => setEncodeConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface px-3 text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Decryption Password
                    </label>
                    <div className="relative">
                      <input
                        type={showDecodePassword ? "text" : "password"}
                        value={decodePassword}
                        onChange={(e) => setDecodePassword(e.target.value)}
                        placeholder="Enter password to unlock file"
                        className="h-9 w-full rounded-md border border-xeoo-border bg-xeoo-surface pl-3 pr-8 text-[12px] text-xeoo-text outline-none transition placeholder:text-xeoo-muted focus:border-xeoo-primary focus:ring-1 focus:ring-xeoo-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDecodePassword(!showDecodePassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xeoo-muted hover:text-xeoo-text"
                        aria-label={showDecodePassword ? "Hide password" : "Show password"}
                      >
                        {showDecodePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* REMINDER CONFIGURATION (ENCODE TAB) */}
                {tab === "encode" && (
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface-soft/40 p-3 space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Optional Password Reminder File (.txt)
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={passwordHint}
                        onChange={(e) => setPasswordHint(e.target.value)}
                        placeholder="Password Hint (e.g. favorite book)"
                        className="h-8 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary"
                      />
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes"
                        className="h-8 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 text-[11px] text-xeoo-text outline-none placeholder:text-xeoo-muted focus:border-xeoo-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-xeoo-muted hover:text-xeoo-text">
                        <input
                          type="checkbox"
                          checked={includePasswordInReminder}
                          onChange={handleToggleIncludePassword}
                          className="rounded border-xeoo-border text-xeoo-primary focus:ring-xeoo-primary"
                        />
                        <span>Include raw password in reminder file</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {currentFile && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "processing"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "processing" || !currentFile}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-5 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-6"
                  >
                    {status === "processing" ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>{tab === "encode" ? "Encrypting File..." : "Decrypting File..."}</span>
                      </>
                    ) : (
                      <>
                        {tab === "encode" ? <Lock size={14} /> : <Unlock size={14} />}
                        <span>{tab === "encode" ? "Encrypt File" : "Decrypt File"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ERROR BANNER */}
                {errorMsg && (
                  <div className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">{errorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* ================================================================
              RESULTS SECTION (ENCRYPTED OUTPUT)
          ================================================================ */}
          {encryptionResult && tab === "encode" && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Lock size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      FILE ENCRYPTED SUCCESSFULLY
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {encryptionResult.encryptedFileName} &bull; Ready for download
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-3 sm:p-3.5">
                {/* METRICS */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Original File
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {encryptionResult.metadata.originalFileName}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {formatBytes(encryptionResult.metadata.originalFileSize)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Encrypted Size
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {formatBytes(encryptionResult.encryptedBlob.size)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      Container: .xeenc
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Cipher Suite
                    </div>
                    <div className="mt-1 font-mono text-[11px] font-bold text-xeoo-text">
                      AES-256-GCM
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      PBKDF2 SHA-256 (310k iter)
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Integrity Checksum
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text" title={encryptionResult.sha256Hex}>
                      {encryptionResult.sha256Hex.slice(0, 16)}...
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      SHA-256 Verified
                    </div>
                  </div>
                </div>

                {/* DOWNLOAD ACTIONS */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadEncryptedFile}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-95"
                  >
                    <Download size={13} />
                    <span>Download {encryptionResult.encryptedFileName}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadReminder}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-4 text-[11px] font-bold text-xeoo-text shadow-xs transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    <FileText size={13} />
                    <span>Download Reminder Note (.txt)</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================
              RESULTS SECTION (DECRYPTED OUTPUT)
          ================================================================ */}
          {decryptionResult && tab === "decode" && (
            <section className="overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xs">
              <div className="flex flex-col gap-2 border-b border-xeoo-border bg-xeoo-surface-soft/45 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Unlock size={14} className="shrink-0 text-xeoo-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-extrabold text-xeoo-text">
                      FILE DECRYPTED SUCCESSFULLY
                    </h2>
                    <p className="truncate text-[12px] text-xeoo-muted">
                      {decryptionResult.originalFileName} &bull; Integrity verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 rounded-md border border-xeoo-border bg-xeoo-surface px-2.5 py-1 text-[11px] font-bold text-xeoo-text transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft active:scale-95"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-3 sm:p-3.5">
                {/* METRICS */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Restored File
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {decryptionResult.originalFileName}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-xeoo-muted">
                      {formatBytes(decryptionResult.originalFileSize)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      Integrity Status
                    </div>
                    <div className="mt-1 flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check size={13} />
                      <span>Verified Match</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Authenticity guaranteed
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      MIME Type
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text">
                      {decryptionResult.originalFileType || "binary"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Original format restored
                    </div>
                  </div>

                  <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-xeoo-muted">
                      SHA-256 Checksum
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] font-bold text-xeoo-text" title={decryptionResult.sha256Hex}>
                      {decryptionResult.sha256Hex.slice(0, 16)}...
                    </div>
                    <div className="mt-0.5 text-[10px] text-xeoo-muted">
                      Hash matches header
                    </div>
                  </div>
                </div>

                {/* DOWNLOAD ACTION */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadDecryptedFile}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-xeoo-primary px-4 text-[11px] font-bold text-white shadow-xs transition hover:bg-xeoo-primary-hover active:scale-95"
                  >
                    <Download size={13} />
                    <span>Download {decryptionResult.originalFileName}</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
