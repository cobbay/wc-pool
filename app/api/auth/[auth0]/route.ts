import { auth0 } from '@/app/lib/auth0';

export async function GET(request: Request) {
  try {
    return await auth0.middleware(request);
  } catch (error) {
    return new Response('Authentication error', { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
