import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ── Shared canvas capture ──────────────────────────────────────────────────────
const MIN_CAPTURE_W = 794; // A4 at 96 dpi

async function captureBlob(
  el: HTMLDivElement,
  filename: string,
  ignoreElements?: (el: Element) => boolean,
): Promise<{ blob: Blob; pdfName: string }> {
  // Apply A4 capture dimensions temporarily — removed after capture so screen
  // display stays fully responsive.
  const prevMinWidth = el.style.minWidth;
  el.style.minWidth = `${MIN_CAPTURE_W}px`;
  el.classList.add("crevia-print-capture");

  const captureW = Math.max(el.scrollWidth, MIN_CAPTURE_W);

  let canvas;
  try {
    canvas = await html2canvas(el, {
      scale: 1.5,
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
    el.classList.remove("crevia-print-capture");
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
  const ref          = useRef<HTMLDivElement>(null);
  // Cached blob — pre-generated in the background so share() fires instantly
  // on iOS (navigator.share must be called within the gesture window).
  const blobCache    = useRef<{ blob: Blob; pdfName: string } | null>(null);
  const [downloading,  setDownloading]  = useState(false);
  const [sharing,      setSharing]      = useState(false);
  const [pregenerating, setPregenerating] = useState(false);

  // ── Pre-generate PDF blob in the background ───────────────────────────────
  // Call this as soon as the document content is fully painted (e.g. in a
  // useEffect after items + profile data are loaded). The cached blob is then
  // consumed instantly by share() — critical for passing iOS gesture checks.
  const preGenerate = async () => {
    if (!ref.current) return;
    setPregenerating(true);
    try {
      blobCache.current = await captureBlob(ref.current, filename, options?.ignoreElements);
    } catch { /* silently ignore — share() will re-try on demand */ }
    setPregenerating(false);
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const download = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const { blob, pdfName } =
        blobCache.current ?? await captureBlob(ref.current, filename, options?.ignoreElements);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = pdfName; a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } finally {
      setDownloading(false);
    }
  };

  // ── shareSync — non-async, iOS-safe share entry point ────────────────────
  // iOS Safari (especially iOS ≤14) does NOT propagate the user-gesture context
  // into async functions. navigator.share() called after even one `await`
  // may be blocked with "NotAllowedError: requires user activation."
  //
  // This function is intentionally NOT async. navigator.share() is called
  // synchronously within the click event frame. The returned Promise is handled
  // via .then()/.catch() chains — no `await` is used before the share call.
  //
  // Requires blobCache to be pre-populated by preGenerate(). If the cache is
  // empty (pre-gen failed or dialog was just opened), falls back to URL share
  // which always works on iOS regardless of the async constraint.
  const shareSync = () => {
    const cached = blobCache.current;

    if (cached) {
      const { blob, pdfName } = cached;
      const pdfFile = new File([blob], pdfName, { type: "application/pdf" });

      // File share — WhatsApp, Gmail, AirDrop, etc.
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [pdfFile] })) {
        setSharing(true);
        navigator.share({ files: [pdfFile], title: filename })
          .catch((err: any) => {
            if (err?.name === "AbortError") return;
            // File share rejected — try URL share as fallback
            navigator.share({ title: filename, url: window.location.href }).catch(() => {});
          })
          .finally(() => setSharing(false));
        return;
      }

      // No file share support — URL share
      if (typeof navigator.share === "function") {
        setSharing(true);
        navigator.share({ title: filename, url: window.location.href })
          .catch((err: any) => {
            if (err?.name !== "AbortError") {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard!");
            }
          })
          .finally(() => setSharing(false));
        return;
      }

      // Desktop (no Web Share API) — download directly
      setSharing(true);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = pdfName; a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      toast.success("Downloaded as PDF!");
      setSharing(false);
      return;
    }

    // Blob not ready — URL share as safe fallback (always within gesture on iOS)
    if (typeof navigator.share === "function") {
      setSharing(true);
      navigator.share({ title: filename, url: window.location.href })
        .catch((err: any) => {
          if (err?.name !== "AbortError") {
            navigator.clipboard?.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
          }
        })
        .finally(() => setSharing(false));
      return;
    }

    // Desktop, no blob — copy URL
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  // ── share — async version used by the autoShare (off-screen) path ────────
  const share = async () => {
    const captured =
      blobCache.current ??
      (ref.current ? await captureBlob(ref.current, filename, options?.ignoreElements) : null);

    if (captured) {
      const { blob, pdfName } = captured;
      const pdfFile = new File([blob], pdfName, { type: "application/pdf" });

      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({ files: [pdfFile], title: filename });
        return;
      }
      if (typeof navigator.share === "function") {
        await navigator.share({ title: filename, url: window.location.href });
        return;
      }
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = pdfName; a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      return;
    }

    if (typeof navigator.share === "function") {
      await navigator.share({ title: filename, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return { ref, download, downloading, shareSync, share, sharing, preGenerate, pregenerating };
}
