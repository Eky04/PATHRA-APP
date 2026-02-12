'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, register } from '@/lib/auth';
import {
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    Heart,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    User,
    Lock,
    Mail,
} from 'lucide-react';

interface AuthPageProps {
    onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Login state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!loginUsername.trim() || !loginPassword.trim()) {
            setError('Mohon isi username dan password');
            setIsLoading(false);
            return;
        }

        const result = await login(loginUsername.trim(), loginPassword);
        if (result.error) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        setSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => onAuthenticated(), 600);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
            setError('Mohon isi semua field');
            setIsLoading(false);
            return;
        }

        if (regPassword.length < 6) {
            setError('Password minimal 6 karakter');
            setIsLoading(false);
            return;
        }

        if (regPassword !== regConfirmPassword) {
            setError('Konfirmasi password tidak cocok');
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail)) {
            setError('Format email tidak valid');
            setIsLoading(false);
            return;
        }

        const result = await register(
            regUsername.trim(),
            regPassword,
            regName.trim(),
            regEmail.trim(),
        );

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        setSuccess('Akun berhasil dibuat! Silakan masuk dengan akun baru Anda.');
        setTimeout(() => {
            setMode('login');
            setLoginUsername(regUsername); // Pre-fill username
            setSuccess(''); // Clear success message from register tab
            setError('');
        }, 1500);
    };

    const switchToRegister = () => {
        setMode('register');
        setError('');
        setSuccess('');
    };

    const switchToLogin = () => {
        setMode('login');
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        animation: 'float 8s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full opacity-15"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        animation: 'float 10s ease-in-out infinite reverse',
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                        animation: 'float 6s ease-in-out infinite 2s',
                    }}
                />
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

            <div className="w-full max-w-md relative z-10">
                {/* Logo / Branding */}
                <div className="text-center mb-8 animate-slideUp">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl mb-4 shadow-lg border border-white/30 overflow-hidden">
                        <img src="/logo.png" alt="PATHRA Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">PATHRA</h1>
                    <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI-Powered Health & Fitness
                    </p>
                </div>

                {/* Card */}
                <div
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 animate-slideUp"
                    style={{ animationDelay: '0.1s' }}
                >
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                        <button
                            onClick={switchToLogin}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'login'
                                ? 'bg-white text-foreground shadow-md'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <LogIn className="w-4 h-4" />
                            Masuk
                        </button>
                        <button
                            onClick={switchToRegister}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'register'
                                ? 'bg-white text-foreground shadow-md'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" />
                            Buat Akun
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium animate-shake border border-red-100">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium animate-fadeIn border border-green-100">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {/* Login Form */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="login-username"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="login-username"
                                        type="text"
                                        placeholder="Masukkan username"
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="login-password"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all duration-300 disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <LogIn className="w-4 h-4" />
                                        Masuk
                                    </div>
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground mt-4">
                                Belum punya akun?{' '}
                                <button
                                    type="button"
                                    onClick={switchToRegister}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Buat Akun
                                </button>
                            </p>
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
                            <div className="space-y-2">
                                <Label htmlFor="reg-name" className="text-sm font-semibold text-foreground">
                                    Nama Lengkap
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="reg-name"
                                        type="text"
                                        placeholder="Masukkan nama lengkap"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reg-username" className="text-sm font-semibold text-foreground">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="reg-username"
                                        type="text"
                                        placeholder="Masukkan username"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reg-email" className="text-sm font-semibold text-foreground">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="contoh@email.com"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reg-password" className="text-sm font-semibold text-foreground">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimal 6 karakter"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="reg-confirm-password"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Konfirmasi Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="reg-confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Ulangi password"
                                        value={regConfirmPassword}
                                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-gray-50/50"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all duration-300 disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Buat Akun
                                    </div>
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground mt-4">
                                Sudah punya akun?{' '}
                                <button
                                    type="button"
                                    onClick={switchToLogin}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Masuk
                                </button>
                            </p>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-white/60 text-xs mt-6 animate-fadeIn">
                    © 2026 PATHRA. All rights reserved.
                </p>
            </div>
        </div>
    );
}
