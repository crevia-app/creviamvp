import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function useDownloadPDF(
  filename: string,
  options?: { ignoreElements?: (el: Element) => boolean }
) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const el = ref.current;

      // Use clientWidth (visible width) not scrollWidth — scrollWidth includes
      // hidden overflow from fixed-width table columns on narrow screens, which
      // would produce a wider canvas than the content and add blank space on
      // the right side of the PDF.
      const visibleW = el.clientWidth;

      // Set windowWidth >= 760 so Tailwind's sm: breakpoint (640px) triggers
      // inside html2canvas. Without this, on mobile/narrow dialogs the
      // `flex-col sm:flex-row` and `grid-cols-1 sm:grid-cols-3` layouts never
      // switch to their desktop variants and content piles up on the left.
      const virtualW = Math.max(visibleW, 760);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width:       visibleW,
        height:      el.scrollHeight,
        windowWidth: virtualW,
        ignoreElements: options?.ignoreElements,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

      const blob    = pdf.output("blob");
      const pdfName = `${filename}.pdf`;

      // ── Mobile: use the native share sheet (iOS share menu / Android intent) ──
      // navigator.share({ files }) is the only reliable way to get iOS to show
      // the "Save to Files / AirDrop / …" sheet. The <a download> approach just
      // opens the blob in the browser tab on iOS Safari without any save option.
      const isMobile =
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
        // iPadOS reports itself as a Mac but has maxTouchPoints > 1
        (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

      if (isMobile && typeof navigator.share === "function") {
        const file = new File([blob], pdfName, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          return;
        }
      }

      // ── Desktop / fallback: trigger <a download> with blob URL ──
      // window.open() after an async operation is blocked by iOS popup blockers;
      // an anchor click with a blob URL works on all modern browsers.
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href     = blobUrl;
      a.download = pdfName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a delay to give the browser time to start the download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } finally {
      setDownloading(false);
    }
  };

  return { ref, download, downloading };
}
