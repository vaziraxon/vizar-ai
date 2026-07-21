import { NextResponse } from 'next/server';
import { registerAction } from '@/lib/actions/auth';

export async function GET() {
  const form = new Map<string, string | null>([
    ['firstName', 'RouteTest'],
    ['lastName', 'User'],
    ['email', `route-test-${Date.now()}@gmail.com`],
    ['phone', '+12345678901'],
    ['password', 'Password1!'],
    ['confirmPassword', 'Password1!'],
    ['termsAccepted', 'true'],
  ]);

  const formLike = { get: (k: string) => form.get(k) ?? null } as unknown as FormData;
  const result = await registerAction(formLike);
  return NextResponse.json({ result });
}
