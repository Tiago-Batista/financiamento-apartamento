// This file previously contained configurations for Google API Key, Client ID,
// Drive scopes, and folder names. These are no longer needed after
// removing Google integration features.

// Add any future non-Google related configurations here.

export const GOOGLE_CLIENT_ID = "365090582875-vkbm0fa5bbdfaobg3u818q0f85pfi0mc.apps.googleusercontent.com";

// Scopes required by the application.
// drive.file: Per-file access to files created or opened by the app.
// openid, email, profile: Standard OpenID Connect scopes for user information.
export const GOOGLE_SCOPES = "openid email profile https://www.googleapis.com/auth/drive.file";
