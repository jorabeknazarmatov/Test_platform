'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { adminApi } from '@/lib/api';
import { getAdminCredentials } from '@/lib/adminAuth';
import Loading from '@/components/ui/Loading';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    groups: 0,
    subjects: 0,
    tests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const [groupsRes, subjectsRes, testsRes] = await Promise.all([
        adminApi.getGroups(credentials.login, credentials.password),
        adminApi.getSubjects(credentials.login, credentials.password),
        adminApi.getTests(credentials.login, credentials.password),
      ]);

      setStats({
        groups: groupsRes.data.length,
        subjects: subjectsRes.data.length,
        tests: testsRes.data.length,
      });
    } catch (error) {
      console.error('Statistikalarni yuklashda xatolik:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loading text="Yuklanmoqda..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bosh sahifa</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gruppalar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.groups}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fanlar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.subjects}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Testlar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tests}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Xush kelibsiz!</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600">
                Admin panelga xush kelibsiz. Bu yerda siz gruppalar, fanlar, testlar va natijalarni boshqarishingiz mumkin.
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>• Gruppalar bo'limida yangi guruhlar yaratish va o'quvchilarni qo'shish mumkin</p>
                <p>• Fanlar bo'limida fanlar va mavzularni boshqarish mumkin</p>
                <p>• Testlar bo'limida testlar yaratish va OTP generatsiya qilish mumkin</p>
                <p>• Natijalar bo'limida test natijalarini ko'rish va export qilish mumkin</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
