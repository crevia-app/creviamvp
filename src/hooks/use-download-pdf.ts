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
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width:       el.scrollWidth,
        height:      el.scrollHeight,
        windowWidth: el.scrollWidth,
        ignoreElements: options?.ignoreElements,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

      // Use <a download> instead of window.open — window.open() after an await
      // is outside the user-gesture chain and is blocked by iOS Safari's popup
      // blocker. An anchor click with a blob URL works on iOS 13+, Android, and
      // desktop without triggering any popup restriction.
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${filename}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a delay to give iOS time to process the download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } finally {
      setDownloading(false);
    }
  };

  return { ref, download, downloading };
}
