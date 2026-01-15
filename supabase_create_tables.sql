-- Supabase Manual Table Creation Script
-- Run this in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. AGENCIES (Root table - no dependencies)
-- ============================================
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    logo VARCHAR(500),
    "defaultCurrency" VARCHAR(10) DEFAULT 'CAD',
    "taxRate" DECIMAL(5, 2) DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    settings TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USERS (Depends on agencies)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    "isActive" BOOLEAN DEFAULT true,
    "agencyId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE SET NULL
);

-- ============================================
-- 3. CLIENTS (Depends on agencies)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    "companyName" VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clients_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE
);

-- ============================================
-- 4. PROJECTS (Depends on agencies and clients)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    "startDate" DATE,
    "deliveryDate" DATE,
    status VARCHAR(50) DEFAULT 'planning',
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'CAD',
    "clientId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_client FOREIGN KEY ("clientId") REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================
-- 5. PAYMENTS (Depends on agencies and projects)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CAD',
    status VARCHAR(50) DEFAULT 'unpaid',
    "paymentDate" DATE,
    notes TEXT,
    "projectId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_project FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 6. HOSTING SERVICES (Depends on agencies and projects)
-- ============================================
CREATE TABLE IF NOT EXISTS hosting_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    provider VARCHAR(255) NOT NULL,
    plan VARCHAR(500),
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "autoRenew" BOOLEAN DEFAULT false,
    "monthlyCost" DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'CAD',
    notes TEXT,
    "projectId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hosting_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_hosting_project FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE SET NULL
);

-- ============================================
-- 7. REMINDERS (Depends on agencies)
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "dueDate" DATE NOT NULL,
    "isCompleted" BOOLEAN DEFAULT false,
    "completedAt" DATE,
    "notificationStatus" VARCHAR(50) DEFAULT 'pending',
    "lastNotifiedAt" TIMESTAMP,
    "notificationAttempts" INTEGER DEFAULT 0,
    "relatedEntityType" VARCHAR(50),
    "relatedEntityId" UUID,
    "daysBeforeReminder" INTEGER DEFAULT 30,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminders_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE
);

-- ============================================
-- 8. INVOICES (Depends on agencies, clients, projects)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL UNIQUE,
    "clientId" UUID NOT NULL,
    "projectId" UUID,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CAD',
    status VARCHAR(50) DEFAULT 'draft',
    notes TEXT,
    "pdfPath" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_client FOREIGN KEY ("clientId") REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_project FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE SET NULL
);

-- ============================================
-- 9. INVOICE ITEMS (Depends on invoices)
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "invoiceId" UUID NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    "unitPrice" DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY ("invoiceId") REFERENCES invoices(id) ON DELETE CASCADE
);

-- ============================================
-- 10. CLIENT NOTES (Depends on agencies, clients, users)
-- ============================================
CREATE TABLE IF NOT EXISTS client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    content TEXT NOT NULL,
    "aiSummary" TEXT,
    "aiSuggestions" TEXT,
    "isAIGenerated" BOOLEAN DEFAULT false,
    category VARCHAR(50) DEFAULT 'general',
    "isImportant" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client_notes_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_notes_client FOREIGN KEY ("clientId") REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_notes_user FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 11. NOTIFICATIONS (Depends on agencies and users)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "agencyId" UUID NOT NULL,
    "userId" UUID,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    "isRead" BOOLEAN DEFAULT false,
    "readAt" TIMESTAMP,
    severity VARCHAR(50) DEFAULT 'info',
    "relatedEntityType" VARCHAR(50),
    "relatedEntityId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 12. PORTFOLIO (No dependencies)
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleTr" VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionTr" TEXT NOT NULL,
    image VARCHAR(500),
    technologies TEXT, -- Simple array stored as text
    category VARCHAR(100),
    "projectUrl" VARCHAR(500),
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. CONTACT SUBMISSIONS (No dependencies)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_agency ON users("agencyId");
CREATE INDEX IF NOT EXISTS idx_clients_agency ON clients("agencyId");
CREATE INDEX IF NOT EXISTS idx_projects_agency ON projects("agencyId");
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects("clientId");
CREATE INDEX IF NOT EXISTS idx_payments_agency ON payments("agencyId");
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments("projectId");
CREATE INDEX IF NOT EXISTS idx_hosting_agency ON hosting_services("agencyId");
CREATE INDEX IF NOT EXISTS idx_hosting_project ON hosting_services("projectId");
CREATE INDEX IF NOT EXISTS idx_reminders_agency ON reminders("agencyId");
CREATE INDEX IF NOT EXISTS idx_invoices_agency ON invoices("agencyId");
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices("clientId");
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items("invoiceId");
CREATE INDEX IF NOT EXISTS idx_client_notes_agency ON client_notes("agencyId");
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes("clientId");
CREATE INDEX IF NOT EXISTS idx_notifications_agency ON notifications("agencyId");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_portfolio_active ON portfolio("isActive");

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ All tables created successfully!';
    RAISE NOTICE '📊 Total tables: 13';
    RAISE NOTICE '🔗 Foreign keys: Created';
    RAISE NOTICE '📈 Indexes: Created';
END $$;
