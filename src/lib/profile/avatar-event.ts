/**
 * Fired on window with the new photo URL (or null) so the top bar updates at
 * once. Its own module so the top bar can listen without loading the upload
 * code and the Supabase client.
 */
export const AVATAR_EVENT = "vizar-avatar-changed";
