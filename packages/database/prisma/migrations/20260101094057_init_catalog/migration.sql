-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateEnum
CREATE TYPE "catalog"."BookFormat" AS ENUM ('HARDCOVER', 'PAPERBACK', 'EBOOK', 'AUDIOBOOK');

-- CreateTable
CREATE TABLE "catalog"."Book" (
    "id" TEXT NOT NULL,
    "isbn" TEXT,
    "isbn13" TEXT,
    "title" VARCHAR(500) NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "publisher" TEXT,
    "publicationDate" DATE,
    "edition" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "pageCount" INTEGER,
    "format" "catalog"."BookFormat" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discountPrice" DECIMAL(10,2),
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "additionalInfo" JSONB NOT NULL DEFAULT '{}',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "birthDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."BookAuthor" (
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BookAuthor_pkey" PRIMARY KEY ("bookId","authorId")
);

-- CreateTable
CREATE TABLE "catalog"."BookCategory" (
    "bookId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BookCategory_pkey" PRIMARY KEY ("bookId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "catalog"."Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn13_key" ON "catalog"."Book"("isbn13");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "catalog"."Book"("title");

-- CreateIndex
CREATE INDEX "Book_isbn_idx" ON "catalog"."Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_publisher_idx" ON "catalog"."Book"("publisher");

-- CreateIndex
CREATE INDEX "Book_isActive_idx" ON "catalog"."Book"("isActive");

-- CreateIndex
CREATE INDEX "Author_name_idx" ON "catalog"."Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "catalog"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "catalog"."Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "catalog"."Category"("slug");

-- AddForeignKey
ALTER TABLE "catalog"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "catalog"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."BookAuthor" ADD CONSTRAINT "BookAuthor_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "catalog"."Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."BookAuthor" ADD CONSTRAINT "BookAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "catalog"."Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."BookCategory" ADD CONSTRAINT "BookCategory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "catalog"."Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."BookCategory" ADD CONSTRAINT "BookCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "catalog"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
