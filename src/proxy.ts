import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin_session')?.value;
    if (!session || session !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname.startsWith('/scanner') && pathname !== '/scanner/login') {
    const session = request.cookies.get('scanner_session')?.value;
    if (!session || session !== process.env.SCANNER_PASSWORD) {
      return NextResponse.redirect(new URL('/scanner/login', request.url));
    }
  }

  if (pathname.startsWith('/api/scanner') && pathname !== '/api/scanner/login') {
    const session = request.cookies.get('scanner_session')?.value;
    if (!session || session !== process.env.SCANNER_PASSWORD) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/scanner/:path*', '/api/scanner/:path*'],
};
