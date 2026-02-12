'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { DashboardPage } from '@/components/pages/dashboard';
import { FoodPage } from '@/components/pages/food';
import { ActivityPage } from '@/components/pages/activity';
import { CoachPage } from '@/components/pages/coach';
import { CommunityPage } from '@/components/pages/community';
import { ProgressPage } from '@/components/pages/progress';
import { AdminPage } from '@/components/pages/admin';
import { AuthPage } from '@/components/auth-page';
import { Onboarding } from '@/components/onboarding';
import { getCurrentUser, AuthUser } from '@/lib/auth';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Check auth via API
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        if (user.role === 'admin') {
          setCurrentPage('admin');
        }
        if (!user.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleNavigate = (e: CustomEvent) => {
      setCurrentPage(e.detail);
    };

    window.addEventListener('navigateTo', handleNavigate as EventListener);
    return () =>
      window.removeEventListener('navigateTo', handleNavigate as EventListener);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-sm">Memuat PATHRA...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        onAuthenticated={async () => {
          const user = await getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
          if (user && !user.onboardingCompleted) {
            setShowOnboarding(true);
          }
        }}
      />
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={async () => {
          // Mark onboarding as complete via API
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ onboardingCompleted: true }),
          });
          setShowOnboarding(false);
        }}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'food':
        return <FoodPage />;
      case 'activity':
        return <ActivityPage />;
      case 'coach':
        return <CoachPage />;
      case 'community':
        return <CommunityPage />;
      case 'progress':
        return <ProgressPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentUser={currentUser} />
      <main className="flex-1 pt-16 md:pt-0">{renderPage()}</main>
    </div>
  );
}
