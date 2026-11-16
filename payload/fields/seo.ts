import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import type { Tab } from 'payload';

/** "SEO" tab: search/social title, description and share image (all optional). */
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO & sharing',
  fields: [
    OverviewField({
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
      imagePath: 'meta.image',
    }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaImageField({ relationTo: 'media' }),
    MetaDescriptionField({ hasGenerateFn: true }),
    PreviewField({
      hasGenerateFn: true,
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
    }),
    {
      name: 'noindex',
      type: 'checkbox',
      label: 'Hide from search engines (noindex)',
    },
  ],
};
