import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { PdfProcessor } from "../lib/pdf/processor";

const prisma = new PrismaClient();

// Helper to generate a valid multi-page PDF with standard ASCII fonts
async function createValidPdf(
  titleAscii: string,
  authorAscii: string,
  categoryAscii: string,
  pageCount: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cover / First page
  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    if (i === 1) {
      // Title Page
      page.drawRectangle({
        x: 40,
        y: height - 140,
        width: width - 80,
        height: 4,
        color: rgb(0.15, 0.35, 0.75),
      });

      page.drawText(titleAscii, {
        x: 50,
        y: height - 190,
        size: 22,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      page.drawText(`Author: ${authorAscii}`, {
        x: 50,
        y: height - 225,
        size: 13,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.35),
      });

      page.drawText(`Category: ${categoryAscii} | Digital Library Edition`, {
        x: 50,
        y: height - 250,
        size: 11,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.5),
      });

      const introText = [
        "Welcome to the official digital publication in our Open Online Library.",
        "This document has been indexed, optimized for high-performance viewing,",
        "and formatted with full searchable text and responsive reading capabilities.",
        "",
        "Overview & Scope:",
        "- Comprehensive fundamentals, scholarly reviews, and modern insights.",
        "- Practical case studies, illustrations, and actionable reference material.",
        "- Formatted for both desktop inspection and mobile reader navigation.",
      ];

      let yPos = height - 320;
      introText.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: 11,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.25),
        });
        yPos -= 22;
      });
    } else {
      // Content Pages
      page.drawText(`Chapter ${i - 1}: Core Concepts, Principles & Discoveries`, {
        x: 50,
        y: height - 80,
        size: 15,
        font: fontBold,
        color: rgb(0.15, 0.2, 0.35),
      });

      page.drawLine({
        start: { x: 50, y: height - 95 },
        end: { x: width - 50, y: height - 95 },
        thickness: 1,
        color: rgb(0.8, 0.85, 0.9),
      });

      const paragraphs = [
        `This section examines the key mechanics and ideas relevant to ${titleAscii.toLowerCase()}.`,
        "Rigorous methodology and thoughtful exploration ensure deep understanding and retention.",
        "",
        "Section 1.1 — Theoretical Foundations & Context",
        "Understanding historical developments and foundational theories is crucial before advancing",
        "into nuanced applications. Researchers and authors emphasize systematic inquiry and critical",
        "observation to illuminate underlying patterns.",
        "",
        "Section 1.2 — Detailed Analysis & Practical Examples",
        "Real-world case studies illustrate the delicate balance between theory and execution.",
        "Every chapter contributes to the coherent narrative of the discipline, providing readers",
        "with concrete takeaways and structured knowledge.",
        "",
        "Section 1.3 — Looking Forward & Key Takeaways",
        "As developments continue to accelerate, ongoing study and multidisciplinary perspectives",
        "will expand our horizons and open up new avenues of exploration.",
      ];

      let textY = height - 130;
      paragraphs.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: textY,
          size: 11,
          font: line.startsWith("Section") ? fontBold : fontRegular,
          color: line.startsWith("Section") ? rgb(0.1, 0.2, 0.4) : rgb(0.25, 0.25, 0.3),
        });
        textY -= 20;
      });
    }

    // Page number footer
    page.drawText(`Page ${i} of ${pageCount} — Digital Library Archive`, {
      x: 50,
      y: 40,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.55),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function main() {
  console.log("🌱 Starting Comprehensive Digital Library Seed...");

  // 1. Admin User
  const adminEmail = "admin@digitallibrary.local";
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: "System Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`👤 Admin ready: ${admin.email} (password: admin123)`);

  // 2. Comprehensive 12 Categories
  const categoriesData = [
    {
      name: "อนิเมะ & การ์ตูน (Anime & Manga)",
      slug: "anime-manga",
      description: "รวมหนังสือการ์ตูน ไลท์โนเวล และบทความแอนิเมชันป๊อปคัลเจอร์",
      icon: "Tv",
      order: 1,
    },
    {
      name: "นิยาย & วรรณกรรม (Fiction & Novels)",
      slug: "novels-fiction",
      description: "นวนิยาย เรื่องสั้น วรรณกรรมคลาสสิกและร่วมสมัย",
      icon: "BookMarked",
      order: 2,
    },
    {
      name: "ผี & สยองขวัญ (Horror & Mystery)",
      slug: "horror-ghost",
      description: "รวมเรื่องเล่าลี้ลับ ปรากฏการณ์เหนือธรรมชาติ ตำนานผี และเรื่องสยองขวัญ",
      icon: "Flame",
      order: 3,
    },
    {
      name: "ตำนาน & เทพปกรณัม (Myths & Legends)",
      slug: "myths-legends",
      description: "ตำนานโบราณ เทพเจ้ากรีก นอร์ส อียิปต์ และนิทานพื้นบ้านทรงคุณค่า",
      icon: "Crown",
      order: 4,
    },
    {
      name: "ความรู้ทั่วไป (General Knowledge)",
      slug: "general-knowledge",
      description: "สาระรอบตัว สารคดี เรื่องน่ารู้รอบโลก และข้อเท็จจริงน่าสนใจ",
      icon: "Compass",
      order: 5,
    },
    {
      name: "วิทยาศาสตร์ & อวกาศ (Science & Space)",
      slug: "science-tech",
      description: "ฟิสิกส์ ดาราศาสตร์ การสำรวจอวกาศ และการค้นพบทางวิทยาศาสตร์",
      icon: "Atom",
      order: 6,
    },
    {
      name: "การเรียน & ตำรา (Education & Textbooks)",
      slug: "education-textbooks",
      description: "คู่มือเตรียมสอบ สรุปเนื้อหาการเรียน และตำราวิชาการมาตรฐาน",
      icon: "GraduationCap",
      order: 7,
    },
    {
      name: "การทดลอง & วิจัย (Experiments & Lab)",
      slug: "experiments-research",
      description: "คู่มือโครงงานวิทยาศาสตร์ การทดลองในห้องแล็บ และงานวิจัย",
      icon: "FlaskConical",
      order: 8,
    },
    {
      name: "คอมพิวเตอร์ & ไอที (IT & Programming)",
      slug: "programming-it",
      description: "การพัฒนาซอฟต์แวร์ เขียนโค้ด โครงสร้างระบบ และเทคโนโลยีสารสนเทศ",
      icon: "Code",
      order: 9,
    },
    {
      name: "ธุรกิจ & การเงิน (Business & Finance)",
      slug: "business-finance",
      description: "การบริหารธุรกิจ กลยุทธ์การตลาด การเงินส่วนบุคคล และการลงทุน",
      icon: "Briefcase",
      order: 10,
    },
    {
      name: "ประวัติศาสตร์ (History & Culture)",
      slug: "history-civilizations",
      description: "ประวัติศาสตร์ไทยและสากล โบราณคดี เหตุการณ์สำคัญของโลก",
      icon: "Landmark",
      order: 11,
    },
    {
      name: "พัฒนาตนเอง & จิตวิทยา (Self-Growth)",
      slug: "self-improvement",
      description: "จิตวิทยาประยุกต์ การสร้างนิสัย ทักษะชีวิต และการพัฒนาศักยภาพ",
      icon: "HeartHandshake",
      order: 12,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, order: cat.order },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`📚 ${categoriesData.length} comprehensive categories created/verified.`);

  // Ensure uploads directory exists
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", "documents");
  await fs.mkdir(uploadDir, { recursive: true });

  // 3. 16 Authentic Sample Documents Across All 12 Categories
  const sampleDocs = [
    {
      title: "Anime & Manga Storytelling: ศิลปะการเล่าเรื่องและออกแบบมังงะ",
      titleAscii: "Anime and Manga Storytelling Masterclass",
      author: "Hayao Makoto & Animation Guild",
      authorAscii: "Hayao Makoto & Animation Guild",
      categorySlug: "anime-manga",
      description: "คู่มือเจาะลึกโครงสร้างการสร้างเรื่องราว การออกแบบตัวละคร และองค์ประกอบภาพในคอมมิกและแอนิเมชันระดับสากล",
      pageCount: 14,
      viewCount: 3820,
      isFeatured: true,
      tags: ["Anime", "Manga", "CharacterDesign", "Storytelling"],
      filename: "anime-manga-storytelling.pdf",
    },
    {
      title: "Light Novel Crafting: เทคนิคการเขียนไลท์โนเวลให้ดึงดูดใจผู้อ่าน",
      titleAscii: "Light Novel Crafting Guide",
      author: "Kenji Shinkai",
      authorAscii: "Kenji Shinkai",
      categorySlug: "anime-manga",
      description: "แนวทางการวางพล็อต จังหวะเรื่อง (Pacing) การสร้างบทสนทนาที่กระชับ และการออกแบบเวิลด์บิลดิ้งสำหรับไลท์โนเวล",
      pageCount: 10,
      viewCount: 2140,
      isFeatured: false,
      tags: ["LightNovel", "Writing", "WorldBuilding", "Fiction"],
      filename: "light-novel-crafting.pdf",
    },
    {
      title: "Chronicles of the Lost Realm: นวนิยายแฟนตาซีดินแดนสาบสูญ",
      titleAscii: "Chronicles of the Lost Realm",
      author: "Arthur Pendelton & Fantasy Guild",
      authorAscii: "Arthur Pendelton & Fantasy Guild",
      categorySlug: "novels-fiction",
      description: "นวนิยายแฟนตาซีคลาสสิก เรื่องราวการผจญภัยของกลุ่มนักสำรวจสู่ดินแดนโบราณที่สาบสูญ พร้อมบทวิเคราะห์วรรณกรรม",
      pageCount: 16,
      viewCount: 1940,
      isFeatured: true,
      tags: ["Fiction", "Fantasy", "Novel", "Literature"],
      filename: "chronicles-lost-realm.pdf",
    },
    {
      title: "Echoes of the City: รวมเรื่องสั้นสะท้อนชีวิตและสังคมร่วมสมัย",
      titleAscii: "Echoes of the City Contemporary Stories",
      author: "Elena Rostova",
      authorAscii: "Elena Rostova",
      categorySlug: "novels-fiction",
      description: "ชุดเรื่องสั้นสะท้อนความสัมพันธ์ จิตวิทยามนุษย์ และการเดินทางในมหานครยุคใหม่ที่เต็มไปด้วยความหวังและความโดดเดี่ยว",
      pageCount: 11,
      viewCount: 1290,
      isFeatured: false,
      tags: ["ShortStories", "Drama", "Literature", "Society"],
      filename: "echoes-of-the-city.pdf",
    },
    {
      title: "Haunted Chronicles: บันทึกตำนานเรื่องเล่าลี้ลับและผีไทย",
      titleAscii: "Haunted Chronicles and Supernatural Folklore",
      author: "อาจารย์พงษ์ภักดี สยองขวัญศึกษา",
      authorAscii: "Pongpakdee Horror Studies",
      categorySlug: "horror-ghost",
      description: "รวบรวมเรื่องเล่าลี้ลับ ปรากฏการณ์เหนือธรรมชาติ สถานที่อาถรรพ์ และตำนานผีพื้นบ้านที่สืบทอดกันมาหลายชั่วอายุคน",
      pageCount: 13,
      viewCount: 4920,
      isFeatured: true,
      tags: ["Horror", "Ghost", "Mystery", "Supernatural"],
      filename: "haunted-chronicles.pdf",
    },
    {
      title: "Shadows in the Fog: รวมคดีปริศนาและเรื่องสยองขวัญแดนสนธยา",
      titleAscii: "Shadows in the Fog Mystery Files",
      author: "Edgar V. Blackwood",
      authorAscii: "Edgar V. Blackwood",
      categorySlug: "horror-ghost",
      description: "เรื่องเล่าสยองขวัญแนวโกธิกและคดีอาชญากรรมลึกลับที่ไม่อาจอธิบายได้ด้วยวิทยาศาสตร์",
      pageCount: 12,
      viewCount: 2730,
      isFeatured: false,
      tags: ["Horror", "Gothic", "Mystery", "Occult"],
      filename: "shadows-in-the-fog.pdf",
    },
    {
      title: "Mythology of the Gods: ตำนานเทพปกรณัมกรีกและนอร์สโบราณ",
      titleAscii: "Mythology of the Ancient Gods",
      author: "Dr. Alexander Thorne",
      authorAscii: "Dr. Alexander Thorne",
      categorySlug: "myths-legends",
      description: "มหากาพย์กำเนิดจักรวาล สงครามแห่งเทพโอลิมปัส และตำนานแร็คนาร็อกของชาวไวกิ้ง พร้อมภาพประกอบเชิงประวัติศาสตร์",
      pageCount: 18,
      viewCount: 3410,
      isFeatured: true,
      tags: ["Mythology", "Greek", "Norse", "Folklore"],
      filename: "mythology-ancient-gods.pdf",
    },
    {
      title: "Everyday Curiosities: 100 เรื่องน่ารู้รอบโลกที่คุณอาจไม่เคยรู้",
      titleAscii: "Everyday Curiosities and Global Facts",
      author: "Global Knowledge Lab",
      authorAscii: "Global Knowledge Lab",
      categorySlug: "general-knowledge",
      description: "รวบรวมข้อเท็จจริงทางธรรมชาติ สิ่งประดิษฐ์ สถิติประหลาด และคำถามชวนสงสัยรอบตัวที่ตอบด้วยวิทยาศาสตร์และความจริง",
      pageCount: 15,
      viewCount: 4120,
      isFeatured: true,
      tags: ["GeneralKnowledge", "Facts", "Documentary", "Curiosity"],
      filename: "everyday-curiosities.pdf",
    },
    {
      title: "Cosmic Horizons: ดาราศาสตร์และการสำรวจจักรวาลยุคใหม่",
      titleAscii: "Cosmic Horizons Modern Astronomy",
      author: "Prof. Stephen Vance & Astrophysics Institute",
      authorAscii: "Prof. Stephen Vance & Astrophysics Institute",
      categorySlug: "science-tech",
      description: "การสำรวจหลุมดำ ทฤษฎีสัมพัทธภาพ คลื่นโน้มถ่วง และภารกิจการค้นหาสิ่งมีชีวิตนอกโลกจากกล้องโทรทรรศน์อวกาศเจมส์เวบบ์",
      pageCount: 17,
      viewCount: 3890,
      isFeatured: true,
      tags: ["Astronomy", "Physics", "Space", "Cosmology"],
      filename: "cosmic-horizons.pdf",
    },
    {
      title: "Essential Mathematics: สรุปหัวใจคณิตศาสตร์และการประยุกต์",
      titleAscii: "Essential Mathematics and Applied Algebra",
      author: "Academic Excellence Guild",
      authorAscii: "Academic Excellence Guild",
      categorySlug: "education-textbooks",
      description: "คู่มือทบทวนเนื้อหาคณิตศาสตร์ แคลคูลัสพื้นฐาน พีชคณิตเชิงเส้น และการวิเคราะห์ข้อมูลสำหรับนักเรียนและนักศึกษา",
      pageCount: 15,
      viewCount: 2650,
      isFeatured: true,
      tags: ["Mathematics", "Calculus", "Education", "Textbook"],
      filename: "essential-mathematics.pdf",
    },
    {
      title: "Laboratory Experiments: คู่มือการทดลองวิทยาศาสตร์และโครงงาน",
      titleAscii: "Scientific Laboratory Experiments Manual",
      author: "Dr. Marie Laurent & Research Lab",
      authorAscii: "Dr. Marie Laurent & Research Lab",
      categorySlug: "experiments-research",
      description: "ระเบียบวิธีวิจัย การตั้งสมมติฐาน การทดลองเคมีและฟิสิกส์เชิงปฏิบัติการ พร้อมแนวทางการบันทึกผลตามมาตรฐานสากล",
      pageCount: 14,
      viewCount: 2210,
      isFeatured: true,
      tags: ["Experiments", "Lab", "Research", "Chemistry", "Physics"],
      filename: "laboratory-experiments.pdf",
    },
    {
      title: "Programming Fundamentals: The Modern Software Approach",
      titleAscii: "Programming Fundamentals The Modern Software Approach",
      author: "Robert C. Martin & Tech Scholars",
      authorAscii: "Robert C. Martin & Tech Scholars",
      categorySlug: "programming-it",
      description: "A comprehensive guide to structured programming, clean abstractions, and algorithmic problem solving for modern engineers.",
      pageCount: 12,
      viewCount: 3150,
      isFeatured: true,
      tags: ["Programming", "CleanCode", "Algorithms", "Software"],
      filename: "programming-fundamentals.pdf",
    },
    {
      title: "Full-Stack Web Development Handbook: Modern Next.js & React",
      titleAscii: "Full-Stack Web Development Handbook",
      author: "Sarah Drasner & Frontend Masters",
      authorAscii: "Sarah Drasner & Frontend Masters",
      categorySlug: "programming-it",
      description: "Complete guide to modern full-stack web architectures, React 19, TypeScript, Edge APIs, and scalable distributed databases.",
      pageCount: 16,
      viewCount: 2840,
      isFeatured: false,
      tags: ["WebDev", "React", "TypeScript", "NextJS"],
      filename: "web-development-handbook.pdf",
    },
    {
      title: "Strategic Business Leadership: กลยุทธ์การบริหารและเติบโตในยุคดิจิทัล",
      titleAscii: "Strategic Business Leadership in the Digital Era",
      author: "Harvard Business Review Collective",
      authorAscii: "Harvard Business Review Collective",
      categorySlug: "business-finance",
      description: "รายงานการวิเคราะห์โมเดลธุรกิจ การบริหารความเสี่ยง การขยายตลาดระดับโลก และการเป็นผู้นำองค์กรยุคใหม่",
      pageCount: 15,
      viewCount: 3590,
      isFeatured: true,
      tags: ["Business", "Strategy", "Leadership", "Finance"],
      filename: "strategic-business-leadership.pdf",
    },
    {
      title: "World Civilizations: ประวัติศาสตร์อารยธรรมและเหตุการณ์เปลี่ยนโลก",
      titleAscii: "World Civilizations and Historic Turning Points",
      author: "Prof. Jonathan Heritage",
      authorAscii: "Prof. Jonathan Heritage",
      categorySlug: "history-civilizations",
      description: "การสืบย้อนรากเหง้าอารยธรรมเมโสโปเตเมีย อียิปต์ ยุคฟื้นฟูศิลปวิทยาการ จนถึงการปฏิวัติอุตสาหกรรมที่เปลี่ยนโฉมหน้ามนุษยชาติ",
      pageCount: 18,
      viewCount: 2470,
      isFeatured: false,
      tags: ["History", "Civilizations", "Culture", "Archaeology"],
      filename: "world-civilizations.pdf",
    },
    {
      title: "Atomic Mindset: จิตวิทยาการพัฒนาตนเองและสร้างนิสัยแห่งความสำเร็จ",
      titleAscii: "Atomic Mindset and Behavioral Psychology",
      author: "Dr. James Clearfield & Cognitive Guild",
      authorAscii: "Dr. James Clearfield & Cognitive Guild",
      categorySlug: "self-improvement",
      description: "หลักจิตวิทยาพฤติกรรมศาสตร์ การสร้างวินัยเชิงบวก การเอาชนะการผัดวันประกันพรุ่ง และการเพิ่มประสิทธิภาพในการทำงานและชีวิต",
      pageCount: 13,
      viewCount: 4810,
      isFeatured: true,
      tags: ["SelfImprovement", "Psychology", "Habits", "Productivity"],
      filename: "atomic-mindset.pdf",
    },
  ];

  for (const doc of sampleDocs) {
    const categoryId = categoryMap.get(doc.categorySlug)!;
    const categoryName = categoriesData.find((c) => c.slug === doc.categorySlug)?.name || "General";

    // 1. Generate real PDF binary with ASCII safe text for pdf-lib
    const pdfBuffer = await createValidPdf(
      doc.titleAscii,
      doc.authorAscii,
      doc.categorySlug,
      doc.pageCount
    );

    const storageKey = `documents/${doc.filename}`;
    const filePath = path.join(uploadDir, doc.filename);
    await fs.writeFile(filePath, pdfBuffer);

    // 2. Generate crisp SVG cover with full UTF-8 title and genre palette
    const coverUrl = PdfProcessor.generateCoverSvg(
      doc.title,
      doc.author,
      doc.categorySlug,
      doc.pageCount
    );

    const slug = doc.titleAscii
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const document = await prisma.document.upsert({
      where: { slug },
      update: {
        title: doc.title,
        author: doc.author,
        description: doc.description,
        categoryId,
        fileUrl: `/uploads/${storageKey}`,
        storageKey,
        coverUrl,
        pageCount: doc.pageCount,
        fileSize: pdfBuffer.length,
        viewCount: doc.viewCount,
        isFeatured: doc.isFeatured,
        isPublished: true,
        allowDownload: true,
        status: "READY",
      },
      create: {
        title: doc.title,
        slug,
        author: doc.author,
        description: doc.description,
        categoryId,
        fileUrl: `/uploads/${storageKey}`,
        storageKey,
        coverUrl,
        mimeType: "application/pdf",
        pageCount: doc.pageCount,
        fileSize: pdfBuffer.length,
        viewCount: doc.viewCount,
        isFeatured: doc.isFeatured,
        isPublished: true,
        allowDownload: true,
        status: "READY",
      },
    });

    // Link Tags
    for (const tagName of doc.tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: tagName, slug: tagSlug },
      });

      await prisma.documentTag.upsert({
        where: {
          documentId_tagId: {
            documentId: document.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          documentId: document.id,
          tagId: tag.id,
        },
      });
    }

    // 3. Create simulated ViewLogs for analytics charts
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const viewsOnDay = Math.floor(Math.random() * 8) + 1;
      for (let v = 0; v < viewsOnDay; v++) {
        await prisma.viewLog.create({
          data: {
            documentId: document.id,
            viewedAt: date,
            ipHash: "seed-view-log",
            userAgent: "Seed Simulation Browser",
          },
        });
      }
    }

    console.log(`📄 Seeded: "${doc.title}" (${doc.pageCount} pages, ${pdfBuffer.length} bytes)`);
  }

  console.log("✅ Seed completed successfully with all requested categories and books!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
