import { PDFDocument } from "pdf-lib";

export interface PdfMetadata {
  isValid: boolean;
  pageCount: number;
  title?: string;
  author?: string;
  error?: string;
}

export class PdfProcessor {
  /**
   * Validates if buffer is genuine PDF using magic bytes (%PDF-)
   */
  static validateMagicBytes(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 5) return false;
    // PDF magic bytes are %PDF- (0x25 0x50 0x44 0x46 0x2D)
    const header = buffer.subarray(0, 5).toString("ascii");
    return header.startsWith("%PDF");
  }

  /**
   * Extracts metadata and total page count
   */
  static async extractMetadata(buffer: Buffer): Promise<PdfMetadata> {
    try {
      if (!this.validateMagicBytes(buffer)) {
        return {
          isValid: false,
          pageCount: 0,
          error: "Invalid file header: Not a valid PDF document",
        };
      }

      const pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      const pageCount = pdfDoc.getPageCount();
      const title = pdfDoc.getTitle()?.trim() || undefined;
      const author = pdfDoc.getAuthor()?.trim() || undefined;

      return {
        isValid: true,
        pageCount,
        title,
        author,
      };
    } catch (err: any) {
      return {
        isValid: false,
        pageCount: 0,
        error: err.message || "Failed to parse PDF document",
      };
    }
  }

  /**
   * Generates a sleek, modern, vector-based book cover SVG data URI or SVG string
   * if no custom cover was uploaded. This ensures every document has a rich, crisp cover!
   */
  static generateCoverSvg(
    title: string,
    author: string = "Author",
    category: string = "Document",
    pageCount: number = 1
  ): string {
    const catLower = (category || "").toLowerCase();

    // Map specific genres to curated atmospheric color schemes
    let color = { from: "#1e293b", to: "#0f172a", accent: "#94a3b8" };

    if (catLower.includes("anime") || catLower.includes("manga") || catLower.includes("อนิเมะ") || catLower.includes("การ์ตูน")) {
      color = { from: "#831843", to: "#be185d", accent: "#f472b6" }; // Rose / Magenta
    } else if (catLower.includes("horror") || catLower.includes("ghost") || catLower.includes("ผี") || catLower.includes("สยอง")) {
      color = { from: "#18181b", to: "#881337", accent: "#f43f5e" }; // Dark Obsidian / Blood Crimson
    } else if (catLower.includes("myth") || catLower.includes("legend") || catLower.includes("ตำนาน")) {
      color = { from: "#78350f", to: "#92400e", accent: "#fde047" }; // Royal Gold / Ancient Amber
    } else if (catLower.includes("fiction") || catLower.includes("novel") || catLower.includes("นิยาย") || catLower.includes("วรรณกรรม")) {
      color = { from: "#0f766e", to: "#0369a1", accent: "#38bdf8" }; // Ocean Teal / Sapphire
    } else if (catLower.includes("science") || catLower.includes("วิทยาศาสตร์") || catLower.includes("ดาราศาสตร์")) {
      color = { from: "#1e1b4b", to: "#0284c7", accent: "#38bdf8" }; // Deep Cosmos / Electric Blue
    } else if (catLower.includes("experiment") || catLower.includes("research") || catLower.includes("ทดลอง") || catLower.includes("วิจัย")) {
      color = { from: "#134e4a", to: "#0d9488", accent: "#2dd4bf" }; // Lab Emerald / Cyan
    } else if (catLower.includes("education") || catLower.includes("textbook") || catLower.includes("การเรียน") || catLower.includes("ตำรา")) {
      color = { from: "#14532d", to: "#15803d", accent: "#86efac" }; // Academic Green
    } else if (catLower.includes("program") || catLower.includes("it") || catLower.includes("คอมพิวเตอร์") || catLower.includes("โค้ด")) {
      color = { from: "#1e3a8a", to: "#2563eb", accent: "#93c5fd" }; // Executive Blue / Tech
    } else if (catLower.includes("business") || catLower.includes("finance") || catLower.includes("ธุรกิจ") || catLower.includes("การเงิน")) {
      color = { from: "#0f172a", to: "#334155", accent: "#cbd5e1" }; // Corporate Navy / Slate
    } else if (catLower.includes("history") || catLower.includes("ประวัติศาสตร์")) {
      color = { from: "#451a03", to: "#7c2d12", accent: "#fdba74" }; // Heritage Bronze / Terracotta
    } else if (catLower.includes("self") || catLower.includes("growth") || catLower.includes("พัฒนาตนเอง") || catLower.includes("จิตวิทยา")) {
      color = { from: "#581c87", to: "#7c3aed", accent: "#c4b5fd" }; // Deep Violet / Indigo
    } else if (catLower.includes("knowledge") || catLower.includes("ความรู้")) {
      color = { from: "#164e63", to: "#0891b2", accent: "#67e8f9" }; // Deep Cyan
    }

    const safeTitle = (title || "Untitled Document")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeAuthor = (author || "Digital Library")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeCategory = (category || "General")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Smart Multi-lingual line splitting (supports English and Thai without spaces)
    const words = safeTitle.split(" ");
    let line1 = "";
    let line2 = "";
    let line3 = "";

    if (words.length > 1) {
      words.forEach((w) => {
        if (line1.length + w.length < 18) {
          line1 += (line1 ? " " : "") + w;
        } else if (line2.length + w.length < 20) {
          line2 += (line2 ? " " : "") + w;
        } else if (line3.length + w.length < 22) {
          line3 += (line3 ? " " : "") + w;
        }
      });
    } else {
      // Single continuous word (e.g. Thai text or long word)
      line1 = safeTitle.slice(0, 18);
      line2 = safeTitle.slice(18, 38);
      line3 = safeTitle.slice(38, 58);
    }

    if (!line1) line1 = safeTitle.substring(0, 18);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color.from}" />
      <stop offset="100%" stop-color="${color.to}" />
    </linearGradient>
    <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.4" />
      <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.2" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="4" stdDeviation="6" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Book Body -->
  <rect width="400" height="580" rx="12" fill="url(#bg)" />
  
  <!-- Subtle Geometry / Pattern -->
  <circle cx="340" cy="90" r="140" fill="#ffffff" fill-opacity="0.05" />
  <circle cx="60" cy="480" r="110" fill="#ffffff" fill-opacity="0.04" />
  <rect x="50" y="50" width="300" height="480" rx="6" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5" />

  <!-- Book Spine Highlight -->
  <rect x="0" y="0" width="28" height="580" rx="4" fill="url(#spine)" />
  <line x1="28" y1="0" x2="28" y2="580" stroke="#000000" stroke-opacity="0.3" stroke-width="1" />

  <!-- Category Pill -->
  <rect x="54" y="80" width="${Math.max(80, safeCategory.length * 10 + 24)}" height="26" rx="13" fill="#ffffff" fill-opacity="0.18" />
  <text x="${54 + Math.max(80, safeCategory.length * 10 + 24) / 2}" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">${safeCategory.toUpperCase()}</text>

  <!-- Title -->
  <text x="54" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#ffffff">
    ${line1 ? `<tspan x="54" dy="0">${line1}</tspan>` : ""}
    ${line2 ? `<tspan x="54" dy="36">${line2}</tspan>` : ""}
    ${line3 ? `<tspan x="54" dy="36">${line3}</tspan>` : ""}
  </text>

  <line x1="54" y1="330" x2="160" y2="330" stroke="${color.accent}" stroke-width="3" stroke-linecap="round" />

  <!-- Author -->
  <text x="54" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#f1f5f9">${safeAuthor}</text>

  <!-- Bottom Info -->
  <g transform="translate(54, 480)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#e2e8f0" fill-opacity="0.9">
      DIGITAL ARCHIVE • ${pageCount} ${pageCount === 1 ? "PAGE" : "PAGES"}
    </text>
  </g>
</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
