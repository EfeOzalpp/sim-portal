CREATE TABLE "HiddenTagSuggestion" (
    "kind" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "HiddenTagSuggestion_pkey" PRIMARY KEY ("kind", "tag")
);
