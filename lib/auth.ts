'use client';

// Auth helper functions that call API routes instead of localStorage

export interface AuthUser {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
    onboardingCompleted: boolean;
    profile?: {
        dailyCalorieTarget: number;
        dailyStepsTarget: number;
        dailyWaterTarget: number;
    };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function login(username: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || 'Login gagal' };
        }

        return { user: data };
    } catch {
        return { error: 'Terjadi kesalahan jaringan' };
    }
}

export async function register(
    username: string,
    password: string,
    name: string,
    email: string,
): Promise<{ user?: AuthUser; error?: string }> {
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name, email }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || 'Registrasi gagal' };
        }

        return { user: data };
    } catch {
        return { error: 'Terjadi kesalahan jaringan' };
    }
}

export async function logout(): Promise<void> {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
        // ignore
    }
}

// initAuth is no longer needed since the admin is seeded in the database
export function initAuth(): void {
    // No-op — admin account is already seeded in MySQL
}
