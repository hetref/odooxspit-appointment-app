import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, matchesRoute, hasRouteAccess, getRedirectUrl } from '@/lib/routes';

// API URL for token validation
const API_BASE_URL = "https://jeanene-unexposed-ingrid.ngrok-free.dev";

/**
 * Validate access token by calling the API
 */
async function validateAccessToken(accessToken: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Don't cache the validation request
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.success && data.data?.user) {
            return data.data.user;
        }

        return null;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get tokens from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const userDataCookie = request.cookies.get('user')?.value;

    let user = null;
    let isAuthenticated = false;

    // Parse cached user data from cookie
    try {
        if (userDataCookie) {
            user = JSON.parse(decodeURIComponent(userDataCookie));
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

    const userRole = user?.role as 'USER' | 'ORGANIZATION' | undefined;

    // Check if this is a public route
    const isPublicRoute = matchesRoute(pathname, ROUTES.PUBLIC);

    // Handle authentication redirect routes (login/register)
    // Redirect authenticated users away from auth pages to dashboard
    if (matchesRoute(pathname, ROUTES.AUTH_REDIRECT)) {
        if (accessToken && user) {
            // Quick check with cached user data
            const redirectUrl = getRedirectUrl(userRole);
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        // Allow unauthenticated users to access auth pages
        return NextResponse.next();
    }

    // Allow access to other public routes (like landing page)
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // All other routes (including /dashboard) require authentication
    // Validate the access token with the API
    if (accessToken) {
        // Validate token with API
        const validatedUser = await validateAccessToken(accessToken);

        if (validatedUser) {
            isAuthenticated = true;
            user = validatedUser;

            // Update user cookie with fresh data from API
            const response = NextResponse.next();
            response.cookies.set('user', encodeURIComponent(JSON.stringify(validatedUser)), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            const updatedUserRole = validatedUser.role as 'USER' | 'ORGANIZATION' | undefined;

            // Check if user has access to the route based on their role
            if (!hasRouteAccess(pathname, updatedUserRole, isAuthenticated)) {
                // Redirect to appropriate dashboard based on role
                const redirectUrl = getRedirectUrl(updatedUserRole);
                return NextResponse.redirect(new URL(redirectUrl, request.url));
            }

            return response;
        }
    }

    // Token is missing or invalid - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    // Clear invalid cookies
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('user');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - files with extensions (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
