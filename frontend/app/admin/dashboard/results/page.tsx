'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { getAdminCredentials } from '@/lib/adminAuth';

interface ResultData {
  id: number;
  student_id: number;
  test_id: number;
  correct_count: number;
  total_count: number;
  percentage: number;
  student?: {
    id: number;
    full_name: string;
  };
  test?: {
    id: number;
    name: string;
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getResults(credentials.login, credentials.password);
      setResults(response.data);
    } catch (err) {
      setError('Natijalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.exportResults(credentials.login, credentials.password);

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'results.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export qilishda xatolik');
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
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
          <h1 className="text-3xl font-bold text-gray-900">Natijalar</h1>
          <Button onClick={handleExport} variant="secondary">
            📥 Excel export
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Test natijalari</h2>
          </CardHeader>
          <CardBody>
            {results.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Natijalar yo'q</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        O'quvchi
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Guruh
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Fan
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Test
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Natija
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Foiz
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {result.student?.full_name || `Student #${result.student_id}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {result.student?.group_name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {result.test?.subject_name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {result.test?.name || `Test #${result.test_id}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {result.correct_count} / {result.total_count}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getPercentageColor(result.percentage)}>
                            {result.percentage.toFixed(1)}%
                          </Badge>
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
