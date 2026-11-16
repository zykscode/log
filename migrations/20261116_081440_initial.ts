import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`cover_image_id\` integer,
  	\`content\` text,
  	\`excerpt\` text,
  	\`category_id\` integer,
  	\`series_id\` integer,
  	\`series_order\` numeric,
  	\`featured\` integer,
  	\`show_toc\` integer DEFAULT true,
  	\`allow_comments\` integer DEFAULT true,
  	\`large_type\` integer,
  	\`canonical_url\` text,
  	\`meta_title\` text,
  	\`meta_image_id\` integer,
  	\`meta_description\` text,
  	\`meta_noindex\` integer,
  	\`slug\` text,
  	\`published_at\` text,
  	\`visibility\` text DEFAULT 'public',
  	\`reading_time\` numeric,
  	\`word_count\` numeric,
  	\`search_text\` text,
  	\`auto_excerpt\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_cover_image_idx\` ON \`posts\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_category_idx\` ON \`posts\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_series_idx\` ON \`posts\` (\`series_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_meta_meta_image_idx\` ON \`posts\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_published_at_idx\` ON \`posts\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_visibility_idx\` ON \`posts\` (\`visibility\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`posts__status_idx\` ON \`posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`tags_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_tags_id_idx\` ON \`posts_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_users_id_idx\` ON \`posts_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_subtitle\` text,
  	\`version_cover_image_id\` integer,
  	\`version_content\` text,
  	\`version_excerpt\` text,
  	\`version_category_id\` integer,
  	\`version_series_id\` integer,
  	\`version_series_order\` numeric,
  	\`version_featured\` integer,
  	\`version_show_toc\` integer DEFAULT true,
  	\`version_allow_comments\` integer DEFAULT true,
  	\`version_large_type\` integer,
  	\`version_canonical_url\` text,
  	\`version_meta_title\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_description\` text,
  	\`version_meta_noindex\` integer,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_visibility\` text DEFAULT 'public',
  	\`version_reading_time\` numeric,
  	\`version_word_count\` numeric,
  	\`version_search_text\` text,
  	\`version_auto_excerpt\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_parent_idx\` ON \`_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_cover_image_idx\` ON \`_posts_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_category_idx\` ON \`_posts_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_series_idx\` ON \`_posts_v\` (\`version_series_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_meta_version_meta_image_idx\` ON \`_posts_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_slug_idx\` ON \`_posts_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_published_at_idx\` ON \`_posts_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_visibility_idx\` ON \`_posts_v\` (\`version_visibility\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_updated_at_idx\` ON \`_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_created_at_idx\` ON \`_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version__status_idx\` ON \`_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_created_at_idx\` ON \`_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_updated_at_idx\` ON \`_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_latest_idx\` ON \`_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_autosave_idx\` ON \`_posts_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`tags_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_posts_id_idx\` ON \`_posts_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_tags_id_idx\` ON \`_posts_v_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_users_id_idx\` ON \`_posts_v_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`journal_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`journal\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`journal_highlights_order_idx\` ON \`journal_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`journal_highlights_parent_id_idx\` ON \`journal_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`journal\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`type\` text DEFAULT 'journal',
  	\`mood\` text,
  	\`weather\` text,
  	\`content\` text,
  	\`location\` text,
  	\`listening_to\` text,
  	\`reading\` text,
  	\`watching\` text,
  	\`cover_image_id\` integer,
  	\`meta_title\` text,
  	\`meta_image_id\` integer,
  	\`meta_description\` text,
  	\`meta_noindex\` integer,
  	\`slug\` text,
  	\`published_at\` text,
  	\`visibility\` text DEFAULT 'private',
  	\`reading_time\` numeric,
  	\`word_count\` numeric,
  	\`search_text\` text,
  	\`auto_excerpt\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`journal_cover_image_idx\` ON \`journal\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`journal_meta_meta_image_idx\` ON \`journal\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`journal_slug_idx\` ON \`journal\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`journal_published_at_idx\` ON \`journal\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`journal_visibility_idx\` ON \`journal\` (\`visibility\`);`)
  await db.run(sql`CREATE INDEX \`journal_updated_at_idx\` ON \`journal\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`journal_created_at_idx\` ON \`journal\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`journal__status_idx\` ON \`journal\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`journal_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`journal\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`journal_rels_order_idx\` ON \`journal_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`journal_rels_parent_idx\` ON \`journal_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`journal_rels_path_idx\` ON \`journal_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`journal_rels_tags_id_idx\` ON \`journal_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`_journal_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_journal_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_journal_v_version_highlights_order_idx\` ON \`_journal_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_highlights_parent_id_idx\` ON \`_journal_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_journal_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_type\` text DEFAULT 'journal',
  	\`version_mood\` text,
  	\`version_weather\` text,
  	\`version_content\` text,
  	\`version_location\` text,
  	\`version_listening_to\` text,
  	\`version_reading\` text,
  	\`version_watching\` text,
  	\`version_cover_image_id\` integer,
  	\`version_meta_title\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_description\` text,
  	\`version_meta_noindex\` integer,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_visibility\` text DEFAULT 'private',
  	\`version_reading_time\` numeric,
  	\`version_word_count\` numeric,
  	\`version_search_text\` text,
  	\`version_auto_excerpt\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`journal\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_journal_v_parent_idx\` ON \`_journal_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version_cover_image_idx\` ON \`_journal_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_meta_version_meta_image_idx\` ON \`_journal_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version_slug_idx\` ON \`_journal_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version_published_at_idx\` ON \`_journal_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version_visibility_idx\` ON \`_journal_v\` (\`version_visibility\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version_updated_at_idx\` ON \`_journal_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version_created_at_idx\` ON \`_journal_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_version_version__status_idx\` ON \`_journal_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_created_at_idx\` ON \`_journal_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_updated_at_idx\` ON \`_journal_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_latest_idx\` ON \`_journal_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_autosave_idx\` ON \`_journal_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_journal_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_journal_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_journal_v_rels_order_idx\` ON \`_journal_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_rels_parent_idx\` ON \`_journal_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_rels_path_idx\` ON \`_journal_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_journal_v_rels_tags_id_idx\` ON \`_journal_v_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_disciplines\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_disciplines_order_idx\` ON \`projects_disciplines\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_disciplines_parent_idx\` ON \`projects_disciplines\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_links_order_idx\` ON \`projects_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_links_parent_id_idx\` ON \`projects_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_metrics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_metrics_order_idx\` ON \`projects_metrics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_metrics_parent_id_idx\` ON \`projects_metrics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`summary\` text,
  	\`cover_image_id\` integer,
  	\`role\` text,
  	\`client\` text,
  	\`year\` text,
  	\`status\` text DEFAULT 'shipped',
  	\`content\` text,
  	\`testimonial_quote\` text,
  	\`testimonial_author\` text,
  	\`testimonial_author_role\` text,
  	\`meta_title\` text,
  	\`meta_image_id\` integer,
  	\`meta_description\` text,
  	\`meta_noindex\` integer,
  	\`slug\` text,
  	\`published_at\` text,
  	\`visibility\` text DEFAULT 'public',
  	\`featured\` integer,
  	\`sort_order\` numeric DEFAULT 100,
  	\`reading_time\` numeric,
  	\`word_count\` numeric,
  	\`search_text\` text,
  	\`auto_excerpt\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_cover_image_idx\` ON \`projects\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_meta_meta_image_idx\` ON \`projects\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_published_at_idx\` ON \`projects\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_visibility_idx\` ON \`projects\` (\`visibility\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`projects_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_texts_order_parent\` ON \`projects_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`posts_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_media_id_idx\` ON \`projects_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_posts_id_idx\` ON \`projects_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_tags_id_idx\` ON \`projects_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_disciplines\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_disciplines_order_idx\` ON \`_projects_v_version_disciplines\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_disciplines_parent_idx\` ON \`_projects_v_version_disciplines\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_links_order_idx\` ON \`_projects_v_version_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_links_parent_id_idx\` ON \`_projects_v_version_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_metrics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_metrics_order_idx\` ON \`_projects_v_version_metrics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_metrics_parent_id_idx\` ON \`_projects_v_version_metrics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_cover_image_id\` integer,
  	\`version_role\` text,
  	\`version_client\` text,
  	\`version_year\` text,
  	\`version_status\` text DEFAULT 'shipped',
  	\`version_content\` text,
  	\`version_testimonial_quote\` text,
  	\`version_testimonial_author\` text,
  	\`version_testimonial_author_role\` text,
  	\`version_meta_title\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_description\` text,
  	\`version_meta_noindex\` integer,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_visibility\` text DEFAULT 'public',
  	\`version_featured\` integer,
  	\`version_sort_order\` numeric DEFAULT 100,
  	\`version_reading_time\` numeric,
  	\`version_word_count\` numeric,
  	\`version_search_text\` text,
  	\`version_auto_excerpt\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_cover_image_idx\` ON \`_projects_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_meta_version_meta_image_idx\` ON \`_projects_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_published_at_idx\` ON \`_projects_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_visibility_idx\` ON \`_projects_v\` (\`version_visibility\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_autosave_idx\` ON \`_projects_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_texts_order_parent\` ON \`_projects_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`posts_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_media_id_idx\` ON \`_projects_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_posts_id_idx\` ON \`_projects_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_tags_id_idx\` ON \`_projects_v_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`content\` text,
  	\`width\` text DEFAULT 'normal',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_order_idx\` ON \`pages_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_parent_id_idx\` ON \`pages_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_path_idx\` ON \`pages_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_big_text_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_big_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_big_text_lines_order_idx\` ON \`pages_blocks_big_text_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_big_text_lines_parent_id_idx\` ON \`pages_blocks_big_text_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_big_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tone\` text DEFAULT 'fg',
  	\`align\` text DEFAULT 'left',
  	\`caption\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_big_text_order_idx\` ON \`pages_blocks_big_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_big_text_parent_id_idx\` ON \`pages_blocks_big_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_big_text_path_idx\` ON \`pages_blocks_big_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_media_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`caption\` text,
  	\`size\` text DEFAULT 'wide',
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_section_order_idx\` ON \`pages_blocks_media_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_section_parent_id_idx\` ON \`pages_blocks_media_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_section_path_idx\` ON \`pages_blocks_media_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_section_media_idx\` ON \`pages_blocks_media_section\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`layout\` text DEFAULT 'masonry',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_section_order_idx\` ON \`pages_blocks_gallery_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_section_parent_id_idx\` ON \`pages_blocks_gallery_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_section_path_idx\` ON \`pages_blocks_gallery_section\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`style\` text DEFAULT 'primary',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_links_order_idx\` ON \`pages_blocks_cta_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_links_parent_id_idx\` ON \`pages_blocks_cta_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_posts_feed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`source\` text DEFAULT 'latest',
  	\`layout\` text DEFAULT 'list',
  	\`limit\` numeric DEFAULT 5,
  	\`category_id\` integer,
  	\`tag_id\` integer,
  	\`series_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`skip_featured\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_posts_feed_order_idx\` ON \`pages_blocks_posts_feed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_posts_feed_parent_id_idx\` ON \`pages_blocks_posts_feed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_posts_feed_path_idx\` ON \`pages_blocks_posts_feed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_posts_feed_category_idx\` ON \`pages_blocks_posts_feed\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_posts_feed_tag_idx\` ON \`pages_blocks_posts_feed\` (\`tag_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_posts_feed_series_idx\` ON \`pages_blocks_posts_feed\` (\`series_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_projects_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`source\` text DEFAULT 'featured',
  	\`limit\` numeric DEFAULT 4,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_projects_grid_order_idx\` ON \`pages_blocks_projects_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_projects_grid_parent_id_idx\` ON \`pages_blocks_projects_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_projects_grid_path_idx\` ON \`pages_blocks_projects_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_journal_feed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`entry_type\` text DEFAULT 'all',
  	\`limit\` numeric DEFAULT 4,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_journal_feed_order_idx\` ON \`pages_blocks_journal_feed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_journal_feed_parent_id_idx\` ON \`pages_blocks_journal_feed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_journal_feed_path_idx\` ON \`pages_blocks_journal_feed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`period\` text,
  	\`title\` text,
  	\`org\` text,
  	\`description\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_items_order_idx\` ON \`pages_blocks_timeline_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_items_parent_id_idx\` ON \`pages_blocks_timeline_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_order_idx\` ON \`pages_blocks_timeline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_parent_id_idx\` ON \`pages_blocks_timeline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_path_idx\` ON \`pages_blocks_timeline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_items_order_idx\` ON \`pages_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_items_parent_id_idx\` ON \`pages_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`auto\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_order_idx\` ON \`pages_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_parent_id_idx\` ON \`pages_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_path_idx\` ON \`pages_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`attribution\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_order_idx\` ON \`pages_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_parent_id_idx\` ON \`pages_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_path_idx\` ON \`pages_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_accordion_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`content\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_accordion\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_accordion_items_order_idx\` ON \`pages_blocks_accordion_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_accordion_items_parent_id_idx\` ON \`pages_blocks_accordion_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_accordion\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_accordion_order_idx\` ON \`pages_blocks_accordion\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_accordion_parent_id_idx\` ON \`pages_blocks_accordion\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_accordion_path_idx\` ON \`pages_blocks_accordion\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_link_list_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_link_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_link_list_links_order_idx\` ON \`pages_blocks_link_list_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_link_list_links_parent_id_idx\` ON \`pages_blocks_link_list_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_link_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`layout\` text DEFAULT 'list',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_link_list_order_idx\` ON \`pages_blocks_link_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_link_list_parent_id_idx\` ON \`pages_blocks_link_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_link_list_path_idx\` ON \`pages_blocks_link_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_embed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`url\` text,
  	\`caption\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_section_order_idx\` ON \`pages_blocks_embed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_section_parent_id_idx\` ON \`pages_blocks_embed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_embed_section_path_idx\` ON \`pages_blocks_embed_section\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_columns_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_columns_columns_order_idx\` ON \`pages_blocks_columns_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_columns_columns_parent_id_idx\` ON \`pages_blocks_columns_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_columns_order_idx\` ON \`pages_blocks_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_columns_parent_id_idx\` ON \`pages_blocks_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_columns_path_idx\` ON \`pages_blocks_columns\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`success_message\` text DEFAULT 'Thanks — your message is in. I’ll get back to you soon.',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_order_idx\` ON \`pages_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_parent_id_idx\` ON \`pages_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_path_idx\` ON \`pages_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_tag_cloud\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_tag_cloud_order_idx\` ON \`pages_blocks_tag_cloud\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tag_cloud_parent_id_idx\` ON \`pages_blocks_tag_cloud\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tag_cloud_path_idx\` ON \`pages_blocks_tag_cloud\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`size\` text DEFAULT 'md',
  	\`line\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_spacer_order_idx\` ON \`pages_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_spacer_parent_id_idx\` ON \`pages_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_spacer_path_idx\` ON \`pages_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`hero_style\` text DEFAULT 'giant',
  	\`hero_kicker\` text,
  	\`hero_heading\` text,
  	\`hero_intro\` text,
  	\`hero_media_id\` integer,
  	\`meta_title\` text,
  	\`meta_image_id\` integer,
  	\`meta_description\` text,
  	\`meta_noindex\` integer,
  	\`slug\` text,
  	\`visibility\` text DEFAULT 'public',
  	\`show_in_menu\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_hero_hero_media_idx\` ON \`pages\` (\`hero_media_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_visibility_idx\` ON \`pages\` (\`visibility\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_media_id_idx\` ON \`pages_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_projects_id_idx\` ON \`pages_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`content\` text,
  	\`width\` text DEFAULT 'normal',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_order_idx\` ON \`_pages_v_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_parent_id_idx\` ON \`_pages_v_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_path_idx\` ON \`_pages_v_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_big_text_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_big_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_big_text_lines_order_idx\` ON \`_pages_v_blocks_big_text_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_big_text_lines_parent_id_idx\` ON \`_pages_v_blocks_big_text_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_big_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tone\` text DEFAULT 'fg',
  	\`align\` text DEFAULT 'left',
  	\`caption\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_big_text_order_idx\` ON \`_pages_v_blocks_big_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_big_text_parent_id_idx\` ON \`_pages_v_blocks_big_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_big_text_path_idx\` ON \`_pages_v_blocks_big_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_media_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`caption\` text,
  	\`size\` text DEFAULT 'wide',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_section_order_idx\` ON \`_pages_v_blocks_media_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_section_parent_id_idx\` ON \`_pages_v_blocks_media_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_section_path_idx\` ON \`_pages_v_blocks_media_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_section_media_idx\` ON \`_pages_v_blocks_media_section\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`layout\` text DEFAULT 'masonry',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_section_order_idx\` ON \`_pages_v_blocks_gallery_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_section_parent_id_idx\` ON \`_pages_v_blocks_gallery_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_section_path_idx\` ON \`_pages_v_blocks_gallery_section\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`style\` text DEFAULT 'primary',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_links_order_idx\` ON \`_pages_v_blocks_cta_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_links_parent_id_idx\` ON \`_pages_v_blocks_cta_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_posts_feed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`source\` text DEFAULT 'latest',
  	\`layout\` text DEFAULT 'list',
  	\`limit\` numeric DEFAULT 5,
  	\`category_id\` integer,
  	\`tag_id\` integer,
  	\`series_id\` integer,
  	\`show_view_all\` integer DEFAULT true,
  	\`skip_featured\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_posts_feed_order_idx\` ON \`_pages_v_blocks_posts_feed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_posts_feed_parent_id_idx\` ON \`_pages_v_blocks_posts_feed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_posts_feed_path_idx\` ON \`_pages_v_blocks_posts_feed\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_posts_feed_category_idx\` ON \`_pages_v_blocks_posts_feed\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_posts_feed_tag_idx\` ON \`_pages_v_blocks_posts_feed\` (\`tag_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_posts_feed_series_idx\` ON \`_pages_v_blocks_posts_feed\` (\`series_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_projects_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`source\` text DEFAULT 'featured',
  	\`limit\` numeric DEFAULT 4,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_projects_grid_order_idx\` ON \`_pages_v_blocks_projects_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_projects_grid_parent_id_idx\` ON \`_pages_v_blocks_projects_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_projects_grid_path_idx\` ON \`_pages_v_blocks_projects_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_journal_feed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`entry_type\` text DEFAULT 'all',
  	\`limit\` numeric DEFAULT 4,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_journal_feed_order_idx\` ON \`_pages_v_blocks_journal_feed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_journal_feed_parent_id_idx\` ON \`_pages_v_blocks_journal_feed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_journal_feed_path_idx\` ON \`_pages_v_blocks_journal_feed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`period\` text,
  	\`title\` text,
  	\`org\` text,
  	\`description\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_items_order_idx\` ON \`_pages_v_blocks_timeline_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_items_parent_id_idx\` ON \`_pages_v_blocks_timeline_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_order_idx\` ON \`_pages_v_blocks_timeline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_parent_id_idx\` ON \`_pages_v_blocks_timeline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_path_idx\` ON \`_pages_v_blocks_timeline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_items_order_idx\` ON \`_pages_v_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_items_parent_id_idx\` ON \`_pages_v_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`auto\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_order_idx\` ON \`_pages_v_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_parent_id_idx\` ON \`_pages_v_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_path_idx\` ON \`_pages_v_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`attribution\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_order_idx\` ON \`_pages_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_parent_id_idx\` ON \`_pages_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_path_idx\` ON \`_pages_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_accordion_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`content\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_accordion\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accordion_items_order_idx\` ON \`_pages_v_blocks_accordion_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accordion_items_parent_id_idx\` ON \`_pages_v_blocks_accordion_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_accordion\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accordion_order_idx\` ON \`_pages_v_blocks_accordion\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accordion_parent_id_idx\` ON \`_pages_v_blocks_accordion\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_accordion_path_idx\` ON \`_pages_v_blocks_accordion\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_link_list_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_link_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_link_list_links_order_idx\` ON \`_pages_v_blocks_link_list_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_link_list_links_parent_id_idx\` ON \`_pages_v_blocks_link_list_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_link_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`layout\` text DEFAULT 'list',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_link_list_order_idx\` ON \`_pages_v_blocks_link_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_link_list_parent_id_idx\` ON \`_pages_v_blocks_link_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_link_list_path_idx\` ON \`_pages_v_blocks_link_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_embed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`url\` text,
  	\`caption\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_embed_section_order_idx\` ON \`_pages_v_blocks_embed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_embed_section_parent_id_idx\` ON \`_pages_v_blocks_embed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_embed_section_path_idx\` ON \`_pages_v_blocks_embed_section\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_columns_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_columns_columns_order_idx\` ON \`_pages_v_blocks_columns_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_columns_columns_parent_id_idx\` ON \`_pages_v_blocks_columns_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_columns_order_idx\` ON \`_pages_v_blocks_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_columns_parent_id_idx\` ON \`_pages_v_blocks_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_columns_path_idx\` ON \`_pages_v_blocks_columns\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`success_message\` text DEFAULT 'Thanks — your message is in. I’ll get back to you soon.',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_order_idx\` ON \`_pages_v_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_parent_id_idx\` ON \`_pages_v_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_path_idx\` ON \`_pages_v_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tag_cloud\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tag_cloud_order_idx\` ON \`_pages_v_blocks_tag_cloud\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tag_cloud_parent_id_idx\` ON \`_pages_v_blocks_tag_cloud\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tag_cloud_path_idx\` ON \`_pages_v_blocks_tag_cloud\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_spacer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`size\` text DEFAULT 'md',
  	\`line\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_spacer_order_idx\` ON \`_pages_v_blocks_spacer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_spacer_parent_id_idx\` ON \`_pages_v_blocks_spacer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_spacer_path_idx\` ON \`_pages_v_blocks_spacer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_hero_style\` text DEFAULT 'giant',
  	\`version_hero_kicker\` text,
  	\`version_hero_heading\` text,
  	\`version_hero_intro\` text,
  	\`version_hero_media_id\` integer,
  	\`version_meta_title\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_description\` text,
  	\`version_meta_noindex\` integer,
  	\`version_slug\` text,
  	\`version_visibility\` text DEFAULT 'public',
  	\`version_show_in_menu\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_version_hero_media_idx\` ON \`_pages_v\` (\`version_hero_media_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_visibility_idx\` ON \`_pages_v\` (\`version_visibility\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_media_id_idx\` ON \`_pages_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_projects_id_idx\` ON \`_pages_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE TABLE \`categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`tags\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tags_slug_idx\` ON \`tags\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`tags_updated_at_idx\` ON \`tags\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tags_created_at_idx\` ON \`tags\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`series\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`cover_image_id\` integer,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`series_cover_image_idx\` ON \`series\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`series_slug_idx\` ON \`series\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`series_updated_at_idx\` ON \`series\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`series_created_at_idx\` ON \`series\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`caption\` text,
  	\`credit\` text,
  	\`blur_data_u_r_l\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumb_url\` text,
  	\`sizes_thumb_width\` numeric,
  	\`sizes_thumb_height\` numeric,
  	\`sizes_thumb_mime_type\` text,
  	\`sizes_thumb_filesize\` numeric,
  	\`sizes_thumb_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_feature_url\` text,
  	\`sizes_feature_width\` numeric,
  	\`sizes_feature_height\` numeric,
  	\`sizes_feature_mime_type\` text,
  	\`sizes_feature_filesize\` numeric,
  	\`sizes_feature_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text,
  	\`sizes_og_url\` text,
  	\`sizes_og_width\` numeric,
  	\`sizes_og_height\` numeric,
  	\`sizes_og_mime_type\` text,
  	\`sizes_og_filesize\` numeric,
  	\`sizes_og_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\` ON \`media\` (\`sizes_thumb_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_feature_sizes_feature_filename_idx\` ON \`media\` (\`sizes_feature_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`)
  await db.run(sql`CREATE TABLE \`messages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`subject\` text,
  	\`message\` text NOT NULL,
  	\`page\` text,
  	\`status\` text DEFAULT 'new',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`messages_updated_at_idx\` ON \`messages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`messages_created_at_idx\` ON \`messages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'admin' NOT NULL,
  	\`avatar_id\` integer,
  	\`bio\` text,
  	\`website\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`users_avatar_idx\` ON \`users\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to_type\` text DEFAULT 'reference',
  	\`to_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`journal_id\` integer,
  	\`projects_id\` integer,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`journal_id\`) REFERENCES \`journal\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`redirects_rels_order_idx\` ON \`redirects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_parent_idx\` ON \`redirects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_path_idx\` ON \`redirects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_posts_id_idx\` ON \`redirects_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_journal_id_idx\` ON \`redirects_rels\` (\`journal_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_projects_id_idx\` ON \`redirects_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_pages_id_idx\` ON \`redirects_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`journal_id\` integer,
  	\`projects_id\` integer,
  	\`pages_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	\`series_id\` integer,
  	\`media_id\` integer,
  	\`messages_id\` integer,
  	\`users_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`journal_id\`) REFERENCES \`journal\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`messages_id\`) REFERENCES \`messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_journal_id_idx\` ON \`payload_locked_documents_rels\` (\`journal_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_series_id_idx\` ON \`payload_locked_documents_rels\` (\`series_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`settings_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`in_header\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_nav_items_order_idx\` ON \`settings_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_nav_items_parent_id_idx\` ON \`settings_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_socials_order_idx\` ON \`settings_socials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_socials_parent_id_idx\` ON \`settings_socials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'Zykson' NOT NULL,
  	\`author_name\` text DEFAULT 'Zykson',
  	\`wordmark\` text DEFAULT 'Zykson.com',
  	\`tagline\` text DEFAULT 'Writing, journal, diary & work',
  	\`description\` text DEFAULT 'A personal blog, journal, diary, archive and portfolio.',
  	\`avatar_id\` integer,
  	\`og_image_id\` integer,
  	\`location\` text,
  	\`email\` text,
  	\`now_emoji\` text,
  	\`now_text\` text,
  	\`announcement_enabled\` integer,
  	\`announcement_text\` text,
  	\`announcement_url\` text,
  	\`footer_note\` text DEFAULT 'Made with care. Words are mine.',
  	\`posts_per_page\` numeric DEFAULT 12,
  	\`entries_per_page\` numeric DEFAULT 20,
  	\`comments_enabled\` integer,
  	\`comments_repo\` text,
  	\`comments_repo_id\` text,
  	\`comments_category\` text,
  	\`comments_category_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_avatar_idx\` ON \`settings\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_og_image_idx\` ON \`settings\` (\`og_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`journal_highlights\`;`)
  await db.run(sql`DROP TABLE \`journal\`;`)
  await db.run(sql`DROP TABLE \`journal_rels\`;`)
  await db.run(sql`DROP TABLE \`_journal_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_journal_v\`;`)
  await db.run(sql`DROP TABLE \`_journal_v_rels\`;`)
  await db.run(sql`DROP TABLE \`projects_disciplines\`;`)
  await db.run(sql`DROP TABLE \`projects_links\`;`)
  await db.run(sql`DROP TABLE \`projects_metrics\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_texts\`;`)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_disciplines\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_links\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_metrics\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_texts\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_big_text_lines\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_big_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_media_section\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_section\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_posts_feed\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_projects_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_journal_feed\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timeline_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timeline\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_accordion_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_accordion\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_link_list_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_link_list\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_embed_section\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_columns_columns\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_columns\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_tag_cloud\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_big_text_lines\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_big_text\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_media_section\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_section\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_posts_feed\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_projects_grid\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_journal_feed\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_accordion_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_accordion\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_link_list_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_link_list\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_embed_section\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_columns_columns\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_columns\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tag_cloud\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_spacer\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`DROP TABLE \`tags\`;`)
  await db.run(sql`DROP TABLE \`series\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`messages\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`redirects_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`settings_nav_items\`;`)
  await db.run(sql`DROP TABLE \`settings_socials\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
}
