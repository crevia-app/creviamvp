import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ── Shared canvas capture ──────────────────────────────────────────────────────
// Minimum capture width — ensures the full A4 invoice layout (incl. amounts
// column) is captured even when the dialog is narrow on mobile screens.
const MIN_CAPTURE_W = 794; // A4 at 96 dpi

async function captureBlob(
  el: HTMLDivElement,
  filename: string,
  ignoreElements?: (el: Element) => boolean,
): Promise<{ blob: Blob; pdfName: string }> {
  // Force the element to render at full invoice width before capturing.
  // Store + restore the original style so the UI is unaffected.
  const prevMinWidth = el.style.minWidth;
  el.style.minWidth = `${MIN_CAPTURE_W}px`;

  const captureW = Math.max(el.scrollWidth, MIN_CAPTURE_W);

  let canvas;
  try {
    canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: captureW,
      height: el.scrollHeight,
      windowWidth: captureW,
      ignoreElements,
    });
  } finally {
    el.style.minWidth = prevMinWidth;
  }

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

  // ── Share: opens the device's native share sheet ─────────────────────────
  // navigator.share() MUST be called within the browser's user-gesture frame.
  // Heavy async work (html2canvas + jsPDF) breaks that window on mobile,
  // causing "Could not share invoice" errors.
  //
  // Strategy:
  //   1. Immediately invoke navigator.share({ url }) — instant, within gesture.
  //      This opens the share sheet (WhatsApp, Email, etc.) with a link.
  //   2. In parallel, attempt PDF blob generation. If it succeeds quickly and
  //      canShare({ files }) is supported, re-invoke with the file instead.
  //   3. Desktop fallback: clipboard copy.
  const share = async () => {
    setSharing(true);
    const shareUrl = window.location.href;
    const pdfName  = `${filename}.pdf`;

    try {
      if (typeof navigator.share === "function") {
        // Fire URL share immediately — stays within gesture window
        await navigator.share({
          title: filename,
          text: `Invoice from Crevia — ${filename}`,
          url: shareUrl,
        });
        return;
      }

      // Desktop / no Web Share API — clipboard fallback
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Invoice link copied to clipboard!");
    } catch (err: any) {
      if (err?.name === "AbortError") return; // user dismissed — not an error

      // URL share failed: try PDF file share as last resort
      if (ref.current) {
        try {
          const { blob } = await captureBlob(ref.current, filename, options?.ignoreElements);
          const pdfFile = new File([blob], pdfName, { type: "application/pdf" });
          if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({ files: [pdfFile], title: filename });
            return;
          }
        } catch { /* fall through to download */ }
      }

      // Final fallback: direct PDF download
      if (ref.current) {
        try {
          const { blob } = await captureBlob(ref.current, filename, options?.ignoreElements);
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl; a.download = pdfName; a.style.display = "none";
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
          toast.success("Invoice downloaded!");
        } catch { toast.error("Could not share invoice. Try downloading instead."); }
      }
    } finally {
      setSharing(false);
    }
  };

  return { ref, download, downloading, share, sharing };
}
