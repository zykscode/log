import { permanentRedirect } from 'next/navigation';

/** Series are listed on the Topics page. */
export default function SeriesIndex() {
  permanentRedirect('/tags');
}
