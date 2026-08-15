/**
 * Generates and persists a privacy-safe anonymous session identifier for guest users.
 * Used exclusively for non-authenticated recommendation personalization.
 */
export const getSessionId = (): string => {
  const SESSION_STORAGE_KEY = 'smartshop_guest_session_id';
  
  try {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      // Generate a standard pseudo-UUID
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch (e) {
    return 'sess_fallback_' + Date.now();
  }
};
