export async function withResilience<T>(
    fn: () => Promise<T>,
    options: { retries: number; timeout: number } = { retries: 3, timeout: 5000 }
): Promise<T> {
    let attempts = 0;
    while (attempts < options.retries) {
        try {
            attempts++;
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), options.timeout)
            );

            // Race the function against the timeout
            return (await Promise.race([fn(), timeoutPromise])) as T;
        } catch (err) {
            if (attempts >= options.retries) throw err;
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
        }
    }
    throw new Error('Unreachable');
}
