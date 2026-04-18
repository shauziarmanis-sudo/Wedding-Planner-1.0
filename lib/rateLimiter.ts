export async function withRateLimit<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      const isRateLimit = error?.code === 429 || error?.status === 429;
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`Rate limit hit, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}
