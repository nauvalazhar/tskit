-- Step 1: Add slug column to plans (nullable temporarily)
ALTER TABLE "plans" ADD COLUMN "slug" text;
--> statement-breakpoint

-- Step 2: Backfill slug from plan name
UPDATE "plans" SET "slug" = lower(regexp_replace("name", '\s+', '-', 'g'));
--> statement-breakpoint

-- Step 3: Make slug NOT NULL + UNIQUE
ALTER TABLE "plans" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_slug_unique" UNIQUE("slug");
--> statement-breakpoint

-- Step 4: Create plan_prices table
CREATE TABLE "plan_prices" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"external_product_id" text NOT NULL,
	"external_price_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plan_prices_external_price_id_unique" UNIQUE("external_price_id")
);
--> statement-breakpoint

ALTER TABLE "plan_prices" ADD CONSTRAINT "plan_prices_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "plan_prices_planId_idx" ON "plan_prices" USING btree ("plan_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "plan_prices_planId_channel_unq" ON "plan_prices" USING btree ("plan_id","channel");
--> statement-breakpoint

-- Step 5: Migrate data from plans to plan_prices
INSERT INTO "plan_prices" ("plan_id", "channel", "external_product_id", "external_price_id")
SELECT "id", "channel", "external_product_id", "external_price_id" FROM "plans";
--> statement-breakpoint

-- Step 6: Drop old constraints and columns from plans
ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_external_product_id_unique";
--> statement-breakpoint
ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_external_price_id_unique";
--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN IF EXISTS "channel";
--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN IF EXISTS "external_product_id";
--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN IF EXISTS "external_price_id";
--> statement-breakpoint

-- Step 7: Change customers unique from (userId) to (userId, channel)
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_user_id_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX "customers_userId_channel_unq" ON "customers" USING btree ("user_id","channel");
