-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 150,
    "fallbackAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_name_key" ON "agents"("name");

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_fallbackAgentId_fkey" FOREIGN KEY ("fallbackAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
