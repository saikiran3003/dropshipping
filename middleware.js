import { NextResponse } from 'next/server';

export function middleware(request) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/admin/login' || path === '/dropshipper/login';

    // Extract tokens from cookies
    const adminToken = request.cookies.get('admin_token')?.value || '';
    const dropshipperToken = request.cookies.get('dropshipper_token')?.value || '';

    // Admin Protection
    if (path.startsWith('/admin') && path !== '/admin/login' && !adminToken) {
        return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
    }

    // Dropshipper Protection
    if (path.startsWith('/dropshipper') && path !== '/dropshipper/login' && !dropshipperToken) {
        return NextResponse.redirect(new URL('/dropshipper/login', request.nextUrl));
    }
}

// Map the routes that should trigger this middleware
export const config = {
    matcher: [
        '/admin/:path*',
        '/dropshipper/:path*',
    ],
};
