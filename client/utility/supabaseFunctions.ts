import { supabase } from '@/lib/supabase';

export const upsertUserCalendarPreferences = async (googleId: string, palette: any, groups: any, hiddenCalendars: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase
    .from('user_calendar_preferences')
    .upsert(
      {
        id: user.id,
        google_id: googleId,
        palette,
        groups,
        hiddenCalendars,
      },
      {
        onConflict: 'id',
      },
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

export const upsertUserColorPalette = async (googleId: string, palette: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase
    .from('user_calendar_preferences')
    .upsert(
      {
        id: user.id,
        google_id: googleId,
        palette: palette,
      },
      {
        onConflict: 'id',
      },
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

export const upsertUserGroups = async (googleId: string, groups: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase
    .from('user_calendar_preferences')
    .upsert(
      {
        id: user.id,
        google_id: googleId,
        groups,
      },
      {
        onConflict: 'id',
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertUserHiddenCalendars = async (googleId: string, hiddenCalendars: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase
    .from('user_calendar_preferences')
    .upsert(
      {
        id: user.id,
        google_id: googleId,
        hiddenCalendars,
      },
      {
        onConflict: 'id',
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserColorPalette = async (userId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase.from('user_calendar_preferences').select('id, palette').eq('id', user.id).maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

export const getUserCalendarGroups = async (userId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase.from('user_calendar_preferences').select('id, groups').eq('id', user.id).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserHiddenCalendars = async (userId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data, error } = await supabase.from('user_calendar_preferences').select('id, hiddenCalendars').eq('id', user.id).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};
