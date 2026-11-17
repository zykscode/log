import { createServerFeature } from '@payloadcms/richtext-lexical';

/**
 * "Writing check" panel under the editor: spelling, grammar & style
 * (LanguageTool) with one-click fixes, plus readability analysis and the
 * browser's own spellcheck while typing.
 */
export const WritingCheckFeature = createServerFeature({
  feature: {
    ClientFeature:
      '@/payload/editor/writing-check/client#WritingCheckFeatureClient',
  },
  key: 'writingCheck',
});
