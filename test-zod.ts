import { z, ZodError } from 'zod';
try {
  z.string().parse(123);
} catch (e) {
  if (e instanceof ZodError) {
    console.log('Issues:', e.issues);
    // @ts-ignore
    console.log('Errors:', e.errors);
  }
}
