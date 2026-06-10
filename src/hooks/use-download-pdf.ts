import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ── Shared canvas capture ──────────────────────────────────────────────────────
async function captureBlob(
  el: HTMLDivElement,
  filename: string,
  ignoreElements?: (el: Element) => boolean,
): Promise<{ blob: Blob; pdfName: string }> {
  const visibleW = el.clientWidth;
  const virtualW = Math.max(visibleW, 760);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: visibleW,
    height: el.scrollHeight,
    windowWidth: virtualW,
    ignoreElements,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

  return { blob: pdf.output("blob"), pdfName: `${filename}.pdf` };
}

export function useDownloadPDF(
  filename: string,
  options?: { ignoreElements?: (el: Element) => boolean }
) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const download = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const { blob, pdfName } = await captureBlob(ref.current, filename, options?.ignoreElements);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = pdfName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } finally {
      setDownloading(false);
    }
  };

  // ── Share: opens the device's native share sheet ──────────────────────────
  // Priority order:
  //   1. navigator.share({ files }) — sends the actual PDF to WhatsApp, Email, etc.
  //   2. navigator.share({ title, text }) — no file but still opens share sheet
  //   3. Clipboard copy + toast — desktop/legacy fallback
  const share = async () => {
    if (!ref.current) return;
    setSharing(true);
    try {
      const { blob, pdfName } = await captureBlob(ref.current, filename, options?.ignoreElements);
      const pdfFile = new File([blob], pdfName, { type: "application/pdf" });

      // Attempt 1: share the PDF file (iOS 15+, Android Chrome, Samsung)
      if (typeof navigator.share === "function") {
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            title: filename,
            text: `Here is your invoice from Crevia: ${filename}`,
          });
          return;
        }

        // Attempt 2: share without file — still opens the native share sheet
        try {
          await navigator.share({
            title: filename,
            text: `Invoice from Crevia — ${filename}. Open Crevia to view.`,
            url: window.location.href,
          });
          return;
        } catch {
          // User cancelled or share failed — fall through
        }
      }

      // Attempt 3: desktop fallback — download the PDF directly
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = pdfName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      toast.success("Invoice downloaded!");
    } catch (err: any) {
      // AbortError = user dismissed share sheet — not an error
      if (err?.name !== "AbortError") {
        console.error("Share error:", err);
        toast.error("Could not share invoice. Try downloading instead.");
      }
    } finally {
      setSharing(false);
    }
  };

  return { ref, download, downloading, share, sharing };
}
