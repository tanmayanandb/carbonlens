import { createClient } from '@supabase/supabase-js';

// Replace with your actual credentials when ready
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
