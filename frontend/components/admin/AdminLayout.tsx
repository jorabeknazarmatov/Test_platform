'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { isAdminAuthenticated, clearAdminCredentials } from '@/lib/adminAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    clearAdminCredentials();
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Bosh sahifa', path: '/admin/dashboard', icon: '🏠' },
    { name: 'Guruxlar', path: '/admin/dashboard/groups', icon: '👥' },
    { name: 'Fanlar', path: '/admin/dashboard/subjects', icon: '📚' },
    { name: 'Testlar', path: '/admin/dashboard/tests', icon: '📝' },
    { name: 'OTP Sessiyalar', path: '/admin/dashboard/sessions', icon: '🔐' },
    { name: 'Natijalar', path: '/admin/dashboard/results', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
          >
            <span className="text-xl">🚪</span>
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
