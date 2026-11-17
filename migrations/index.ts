import * as migration_20261116_081440_initial from './20261116_081440_initial';
import * as migration_20261117_134754_seo_pwa_writing from './20261117_134754_seo_pwa_writing';

export const migrations = [
  {
    up: migration_20261116_081440_initial.up,
    down: migration_20261116_081440_initial.down,
    name: '20261116_081440_initial',
  },
  {
    up: migration_20261117_134754_seo_pwa_writing.up,
    down: migration_20261117_134754_seo_pwa_writing.down,
    name: '20261117_134754_seo_pwa_writing'
  },
];
