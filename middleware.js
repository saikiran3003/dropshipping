import { NextResponse } from 'next/server';

export function middleware(request) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/admin/login';

    // Extract the token from cookies
    const token = request.cookies.get('admin_token')?.value || '';

    // Redirect to login if not logged in and trying to access admin area
    if (!isPublicPath && path.startsWith('/admin') && !token) {
        return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
    }
}

// Map the routes that should trigger this middleware
export const config = {
    matcher: [
        '/admin',
        '/admin/:path*',
    ],
};
