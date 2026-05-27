import { Camera, Keyboard, Play, StopCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/Button.jsx";
import { FormField, inputClassName } from "../ui/FormField.jsx";

export function BarcodeScanner({ onDetected, compact = false }) {
  const [running, setRunning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const scannerId = useMemo(() => `scanner-${crypto.randomUUID()}`, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startScanner() {
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      const cameras = await Html5Qrcode.getCameras();
      const cameraId = cameras[0]?.id;
      if (!cameraId) throw new Error("Camera not found");

      await scanner.start(
        cameraId,
        { fps: 10, qrbox: compact ? 180 : 260 },
        (decodedText) => {
          onDetected(decodedText);
          stopScanner();
        },
      );
      setRunning(true);
    } catch (scannerError) {
      setError(scannerError.message || "Camera permission is required");
      setRunning(false);
    }
  }

  async function stopScanner() {
    if (!scannerRef.current) return;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current.clear();
    } finally {
      setRunning(false);
    }
  }

  function submitManual(event) {
    event.preventDefault();
    if (!manualCode.trim()) return;
    onDetected(manualCode.trim());
    setManualCode("");
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-glass dark:border-white/10">
        <div id={scannerId} className={compact ? "min-h-52" : "min-h-80"} />
        {!running ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <div className="rounded-lg bg-white/10 p-4">
              <Camera className="h-9 w-9" />
            </div>
            <p className="max-w-sm text-sm text-slate-300">Camera scanner supports QR and barcode labels generated for the catalog.</p>
          </div>
        ) : null}
      </div>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {running ? (
          <Button variant="danger" onClick={stopScanner}>
            <StopCircle className="h-4 w-4" />
            Stop camera
          </Button>
        ) : (
          <Button variant="accent" onClick={startScanner}>
            <Play className="h-4 w-4" />
            Start scanner
          </Button>
        )}
      </div>

      <form onSubmit={submitManual} className="flex flex-col gap-2 sm:flex-row">
        <FormField icon={Keyboard} className="flex-1">
          <input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            placeholder="Enter or paste barcode manually"
            className={inputClassName(true)}
          />
        </FormField>
        <Button type="submit" variant="ghost">
          Search code
        </Button>
      </form>
    </div>
  );
}

