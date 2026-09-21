const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      '⚠️  [WARNING] SUPABASE_URL or SUPABASE_ANON_KEY is missing in your .env file.\n' +
      'Database operations will fail until valid Supabase credentials are configured.'
    );
  }
}

// Normalize URL by removing trailing slashes or /rest/v1 path if provided
const formatSupabaseUrl = (url) => {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const sanitizedUrl = formatSupabaseUrl(supabaseUrl);

// Initialize Supabase client
// During tests without live credentials, fall back to placeholder values so the app can boot
const supabase = createClient(
  sanitizedUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

module.exports = supabase;
