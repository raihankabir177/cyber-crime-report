-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('victim', 'officer', 'admin');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('Open', 'Under Investigation', 'Closed', 'Rejected');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "victims" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nid" VARCHAR(50),
    "address" TEXT,
    "emergency_contact" VARCHAR(20),

    CONSTRAINT "victims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "badge_number" VARCHAR(20),
    "department" VARCHAR(100),
    "specialization" VARCHAR(100),
    "rank_name" VARCHAR(50) NOT NULL DEFAULT 'Officer',

    CONSTRAINT "officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "admin_code" VARCHAR(50),
    "position" VARCHAR(100),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "victim_id" INTEGER NOT NULL,
    "crime_type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "date_occurred" DATE NOT NULL,
    "date_submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255),
    "status" "ReportStatus" NOT NULL DEFAULT 'Open',
    "priority" "ReportPriority" NOT NULL DEFAULT 'Medium',
    "assigned_officer_id" INTEGER,
    "assignment_date" TIMESTAMP(3),
    "assignment_note" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255),
    "file_path" TEXT,
    "cloudinary_url" TEXT,
    "cloudinary_public_id" VARCHAR(255),
    "file_size" INTEGER,
    "content_type" VARCHAR(100),
    "uploaded_by" INTEGER NOT NULL,
    "description" TEXT,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_logs" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "officer_id" INTEGER NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "log_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50),

    CONSTRAINT "case_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Success',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "victims_user_id_key" ON "victims"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "officers_user_id_key" ON "officers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "officers_badge_number_key" ON "officers"("badge_number");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_id_key" ON "admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_admin_code_key" ON "admins"("admin_code");

-- AddForeignKey
ALTER TABLE "victims" ADD CONSTRAINT "victims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_logs" ADD CONSTRAINT "case_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_logs" ADD CONSTRAINT "case_logs_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
