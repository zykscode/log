import { cn } from '@/lib/utils';

/** GitHub-style grid of the last 53 weeks — one square per day with entries. */
export function Heatmap({
  days,
  label = 'entries',
}: {
  days: Record<string, number>;
  label?: string;
}) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 7 * 52 - today.getUTCDay());
  const cells: { key: string; count: number; month: number; date: Date }[] = [];
  for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    cells.push({
      key,
      count: days[key] ?? 0,
      month: d.getUTCMonth(),
      date: new Date(d),
    });
  }
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const total = Object.values(days).reduce((a, b) => a + b, 0);
  const active = Object.keys(days).length;

  // current streak (consecutive days up to today/yesterday)
  let streak = 0;
  const cursor = new Date(today);
  if (!days[cursor.toISOString().slice(0, 10)])
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days[cursor.toISOString().slice(0, 10)]) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return (
    <figure className="w-full">
      <div className="overflow-x-auto pb-2">
        <div
          className="inline-flex gap-[3px]"
          role="img"
          aria-label={`${total} ${label} in the past year`}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((c) => (
                <span
                  key={c.key}
                  title={`${c.count} ${label} · ${c.key}`}
                  className={cn(
                    'size-[11px] rounded-[2px]',
                    c.count === 0 && 'bg-fg/[0.08]',
                    c.count === 1 && 'bg-accent/45',
                    c.count === 2 && 'bg-accent/70',
                    c.count >= 3 && 'bg-accent',
                  )}
                />
              ))}
            </div>
          ))}
        </div>
        <div
          className="mt-1 flex gap-[3px] text-[0.62rem] text-faint"
          aria-hidden
        >
          {weeks.map((week, wi) => (
            <span
              key={wi}
              className="w-[11px] overflow-visible whitespace-nowrap"
            >
              {week[0] && week[0].date.getUTCDate() <= 7
                ? months[week[0].month]
                : ''}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
        <span>
          <strong className="font-medium text-fg">{total}</strong> {label} this
          year
        </span>
        <span>
          <strong className="font-medium text-fg">{active}</strong> days written
        </span>
        <span>
          <strong className="font-medium text-fg">{streak}</strong>-day streak
        </span>
      </figcaption>
    </figure>
  );
}
