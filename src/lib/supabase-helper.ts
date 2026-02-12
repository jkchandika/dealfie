import { supabase } from './supabase';

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('listings').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export function getSupabaseErrorMessage(error: any): string {
  if (!error) return 'Unknown error occurred';

  if (error.message?.includes('Failed to fetch')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  return error.message || 'An error occurred. Please try again.';
}
