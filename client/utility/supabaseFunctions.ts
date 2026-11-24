import { supabase } from '@/lib/supabase';
import type { calendarGroup, colorCache } from '@/utility/types';

export type CalendarPreferences = {
  palette: colorCache[];
  groups: calendarGroup[];
  hiddenCalendars: string[];
};

export async function readCalendarPreferences(userId: string) {
  const { data, error } = await supabase.from('user_calendar_preferences')
    .select('palette, groups, hiddenCalendars').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as { [Key in keyof CalendarPreferences]: CalendarPreferences[Key] | null } | null;
}

export async function writeCalendarPreferences(
  userId: string,
  changes: Partial<CalendarPreferences>,
  rowExists: boolean,
  googleId?: string,
) {
  const table = supabase.from('user_calendar_preferences');
  const { error } = await (rowExists
    ? table.update(changes).eq('id', userId)
    : table.upsert({ id: userId, ...(googleId ? { google_id: googleId } : {}), ...changes }, { onConflict: 'id' }));
  if (error) throw error;
}
