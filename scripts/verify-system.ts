import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signSession, verifySession } from "../lib/auth/session";
import { PdfProcessor } from "../lib/pdf/processor";
import { getStorageProvider } from "../lib/storage";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("==================================================");
  console.log("🚀 STARTING DIGITAL LIBRARY FULL-STACK VERIFICATION");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Database Seed & Integrity
  console.log("👉 Test 1: Database Seed & Entity Counts");
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const documentCount = await prisma.document.count();
  const readyDocs = await prisma.document.count({ where: { status: "READY", isPublished: true } });

  assert(userCount >= 1, `Found ${userCount} users (admin present)`);
  assert(categoryCount >= 8, `Found ${categoryCount} categories`);
  assert(documentCount >= 10, `Found ${documentCount} documents (>= 10 required)`);
  assert(readyDocs >= 10, `Found ${readyDocs} published READY documents`);

  // TEST 2: Admin Authentication Verification
  console.log("\n👉 Test 2: Admin Authentication & JWT Session Flow");
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@digitallibrary.local" } });
  assert(!!adminUser, "Admin user 'admin@digitallibrary.local' exists in DB");

  const isPasswordValid = await bcrypt.compare("admin123", adminUser!.passwordHash);
  assert(isPasswordValid, "Password 'admin123' verifies correctly against bcrypt hash");

  const token = await signSession({
    userId: adminUser!.id,
    email: adminUser!.email,
    name: adminUser!.name,
    role: adminUser!.role,
  });
  assert(typeof token === "string" && token.length > 30, "JWT session signed successfully");

  const verified = await verifySession(token);
  assert(verified?.email === "admin@digitallibrary.local" && verified?.role === "ADMIN", "JWT session payload verified with ADMIN role");

  // TEST 3: PDF Processing Engine & Magic Bytes
  console.log("\n👉 Test 3: PDF Processing & Security Engine");
  const fakeBuffer = Buffer.from("NOT_A_PDF_FILE_TEST");
  const fakeCheck = PdfProcessor.validateMagicBytes(fakeBuffer);
  assert(!fakeCheck, "Magic byte checker successfully rejects invalid headers");

  // Create a minimal real PDF
  const testDoc = await PDFDocument.create();
  const font = await testDoc.embedFont(StandardFonts.Helvetica);
  const page1 = testDoc.addPage([400, 600]);
  page1.drawText("Verification Test Document Page 1", { x: 50, y: 500, size: 14, font });
  const page2 = testDoc.addPage([400, 600]);
  page2.drawText("Verification Test Document Page 2", { x: 50, y: 500, size: 14, font });
  testDoc.setTitle("Automated Verification Document");
  testDoc.setAuthor("Test Author");
  const pdfBytes = await testDoc.save();
  const validBuffer = Buffer.from(pdfBytes);

  const validCheck = PdfProcessor.validateMagicBytes(validBuffer);
  assert(validCheck, "Magic byte checker successfully accepts genuine %PDF- header");

  const meta = await PdfProcessor.extractMetadata(validBuffer);
  assert(meta.isValid, "PDF metadata extraction succeeded");
  assert(meta.pageCount === 2, `Page count accurately detected: ${meta.pageCount} pages`);
  assert(meta.title === "Automated Verification Document", `Title extracted: "${meta.title}"`);

  // Vector Cover Generation
  const svgCover = PdfProcessor.generateCoverSvg("Automated Verification Document", "Test Author", "Testing", 2);
  assert(svgCover.startsWith("data:image/svg+xml"), "Dynamic vector book cover generated successfully");

  // TEST 4: Storage Abstraction Layer
  console.log("\n👉 Test 4: Storage Layer Operations");
  const storage = getStorageProvider();
  const uploadRes = await storage.upload(validBuffer, "test-verification.pdf", "application/pdf");
  assert(!!uploadRes.storageKey && uploadRes.size > 0, `File stored with key: ${uploadRes.storageKey} (${uploadRes.size} bytes)`);

  const fileBuffer = await storage.getBuffer(uploadRes.storageKey);
  assert(!!fileBuffer && fileBuffer.length === uploadRes.size, "Retrieved file buffer matches uploaded size");

  // TEST 5: Document Record Creation & Linking
  console.log("\n👉 Test 5: Document CRUD, Tag Linking & View Analytics");
  const testCategory = await prisma.category.findFirst();
  const createdDoc = await prisma.document.create({
    data: {
      title: "Automated Verification Document",
      slug: `test-doc-${Date.now()}`,
      author: "Test Author",
      description: "A test publication created for automated system verification.",
      categoryId: testCategory!.id,
      fileUrl: uploadRes.url,
      storageKey: uploadRes.storageKey,
      coverUrl: svgCover,
      pageCount: 2,
      fileSize: uploadRes.size,
      status: "READY",
      isPublished: true,
      allowDownload: true,
    },
  });
  assert(!!createdDoc.id, `Test document persisted to PostgreSQL with ID: ${createdDoc.id}`);

  // Record a view
  const beforeViews = createdDoc.viewCount;
  await prisma.document.update({
    where: { id: createdDoc.id },
    data: { viewCount: { increment: 1 } },
  });
  const afterViews = (await prisma.document.findUnique({ where: { id: createdDoc.id } }))?.viewCount;
  assert(afterViews === beforeViews + 1, `View count incremented from ${beforeViews} to ${afterViews}`);

  // Cleanup test record
  await prisma.document.delete({ where: { id: createdDoc.id } });
  await storage.deleteFile(uploadRes.storageKey);
  assert(true, "Test record and file cleaned up");

  // TEST 6: Public Catalog Queries
  console.log("\n👉 Test 6: Catalog Search & Filter Querying");
  const searchResults = await prisma.document.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: "Programming", mode: "insensitive" } },
        { description: { contains: "Programming", mode: "insensitive" } },
      ],
    },
  });
  assert(searchResults.length > 0, `Search query for 'Programming' returned ${searchResults.length} results`);

  console.log("\n==================================================");
  console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((e) => {
    console.error("Verification script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
