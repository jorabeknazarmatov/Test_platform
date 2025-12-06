'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { getAdminCredentials } from '@/lib/adminAuth';

interface SessionData {
  id: number;
  student_id: number;
  test_id: number;
  otp: string;
  status: string;
  created_at: string;
  expires_at: string;
  started_at: string | null;
  completed_at: string | null;
  student: {
    id: number;
    full_name: string;
  } | null;
  test: {
    id: number;
    name: string;
  } | null;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getSessions(credentials.login, credentials.password);
      setSessions(response.data);
    } catch (err: any) {
      setError('Sessiyalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Sessiyani o\'chirmoqchimisiz?')) return;

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.deleteSession(sessionId, credentials.login, credentials.password);
      loadSessions();
    } catch (err) {
      setError('Sessiyani o\'chirishda xatolik');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info', text: string }> = {
      waiting: { variant: 'warning', text: 'Kutilmoqda' },
      active: { variant: 'info', text: 'Faol' },
      completed: { variant: 'success', text: 'Yakunlangan' },
      expired: { variant: 'danger', text: 'Muddati o\'tgan' },
      blocked: { variant: 'danger', text: 'Bloklangan' },
    };

    const statusInfo = statusMap[status] || { variant: 'default' as const, text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OTP Sessiyalar</h1>
          <Button onClick={loadSessions} variant="secondary">
            🔄 Yangilash
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Barcha sessiyalar ({sessions.length})
            </h2>
          </CardHeader>
          <CardBody>
            {sessions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Sessiyalar yo'q</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Session ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        O'quvchi
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Test
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        OTP
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Holat
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Yaratilgan
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {session.id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {session.student?.full_name || `Student #${session.student_id}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {session.test?.name || `Test #${session.test_id}`}
                        </td>
                        <td className="py-3 px-4">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-900">
                            {session.otp}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(session.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(session.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            O'chirish
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
