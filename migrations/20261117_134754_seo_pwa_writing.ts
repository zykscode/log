import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_texts_order_parent\` ON \`users_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`language\` text DEFAULT 'en-GB';`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`x_handle\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`verification_google\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`verification_bing\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`verification_yandex\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`block_a_i_crawlers\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`app_short_name\` text DEFAULT 'Zykson';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_texts\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`language\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`x_handle\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`verification_google\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`verification_bing\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`verification_yandex\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`block_a_i_crawlers\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`app_short_name\`;`)
}
