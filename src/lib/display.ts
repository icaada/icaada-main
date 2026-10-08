import type { EventDto } from '@/Services/event.service';

/** 1 → "01" */
export const pad2 = (n: number) => String(n).padStart(2, '0');

export const phaseLabel: Record<EventDto['phase'], string> = {
  ENVISIONED: 'Envisioned',
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  PAST: 'Past',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' });

/** Exact dates when the event has them, otherwise the editor's date label. */
export function eventDateText(event: Pick<EventDto, 'startsAt' | 'endsAt' | 'dateLabel'>): string {
  if (event.startsAt) {
    const start = dateFormat.format(new Date(event.startsAt));
    const end = event.endsAt ? dateFormat.format(new Date(event.endsAt)) : null;
    return end && end !== start ? `${start} – ${end}` : start;
  }
  return event.dateLabel ?? 'Date to be announced';
}
