import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";

export function QRCodeDialog({ book, open, onClose }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!book || !open) return;
      const url = await QRCode.toDataURL(book.qr_code || book.barcode, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
      if (!cancelled) setDataUrl(url);
    }

    generate();
    return () => {
      cancelled = true;
    };
  }, [book, open]);

  return (
    <Modal open={open} onClose={onClose} title="Book QR code" description={book?.title}>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-glass dark:border-white/10">
          {dataUrl ? <img src={dataUrl} alt={`${book?.title} QR code`} className="h-72 w-72" /> : <QrCode className="h-24 w-24 text-slate-300" />}
        </div>
        <div>
          <p className="text-sm font-black text-slate-950 dark:text-white">{book?.barcode}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{book?.author}</p>
        </div>
        {dataUrl ? (
          <a href={dataUrl} download={`${book?.barcode || "book"}-qr.png`}>
            <Button variant="accent">
              <Download className="h-4 w-4" />
              Download QR
            </Button>
          </a>
        ) : null}
      </div>
    </Modal>
  );
}

