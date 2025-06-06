
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qricuwpzhkndzynndlai.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaWN1d3B6aGtuZHp5bm5kbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NDM1NzUsImV4cCI6MjA1NDQxOTU3NX0.1f67tDWL6ZUlxHVs-DpUzSbtR4W2O1AwnPjNyDSMDc0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
