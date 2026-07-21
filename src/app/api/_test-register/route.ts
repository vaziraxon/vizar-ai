import { NextResponse } from 'next/server';
import { registerAction } from '@/lib/actions/auth';

export async function GET() {
  // Minimal FormData-like object for testing the server action.
  const form = new Map<string, string | null>([
    ['firstName', 'TestRoute'],
    ['lastName', 'User'],
    ['email', `route-test-${Date.now()}@gmail.com`],
    ['phone', '+12345678901'],
    ['password', 'Password1!'],
    ['confirmPassword', 'Password1!'],
    ['termsAccepted', 'true'],
  ]);

  // Provide the minimal `.get()` API `registerAction` expects.
  const formLike = { get: (k: string) => form.get(k) ?? null } as unknown as FormData;

  const result = await registerAction(formLike);
  return NextResponse.json({ result });
}
