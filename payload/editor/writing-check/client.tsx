'use client';

import { createClientFeature } from '@payloadcms/richtext-lexical/client';

import { WritingCheckPlugin } from './WritingCheckPlugin';

export const WritingCheckFeatureClient = createClientFeature({
  plugins: [{ Component: WritingCheckPlugin, position: 'belowContainer' }],
});
