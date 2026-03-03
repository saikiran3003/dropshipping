import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    return Response.json({ message: 'Logged out' });
}
