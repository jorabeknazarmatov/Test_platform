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
    group_name?: string;
  };
  test?: {
    id: number;
    name: string;
    subject_name?: string;
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultData[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [maxPercentage, setMaxPercentage] = useState('');

  // Unique values for filters
  const [groups, setGroups] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [tests, setTests] = useState<string[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [results, searchQuery, selectedGroup, selectedSubject, selectedTest, minPercentage, maxPercentage]);

  const loadResults = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getResults(credentials.login, credentials.password);
      setResults(response.data);

      // Extract unique values for filters
      const uniqueGroups = [...new Set(response.data.map((r: ResultData) => r.student?.group_name).filter(Boolean))] as string[];
      const uniqueSubjects = [...new Set(response.data.map((r: ResultData) => r.test?.subject_name).filter(Boolean))] as string[];
      const uniqueTests = [...new Set(response.data.map((r: ResultData) => r.test?.name).filter(Boolean))] as string[];

      setGroups(uniqueGroups);
      setSubjects(uniqueSubjects);
      setTests(uniqueTests);
    } catch (err) {
      setError('Natijalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    // Search by student name
    if (searchQuery) {
      filtered = filtered.filter((result) =>
        result.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by group
    if (selectedGroup) {
      filtered = filtered.filter((result) => result.student?.group_name === selectedGroup);
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter((result) => result.test?.subject_name === selectedSubject);
    }

    // Filter by test
    if (selectedTest) {
      filtered = filtered.filter((result) => result.test?.name === selectedTest);
    }

    // Filter by percentage range
    if (minPercentage) {
      filtered = filtered.filter((result) => result.percentage >= parseFloat(minPercentage));
    }
    if (maxPercentage) {
      filtered = filtered.filter((result) => result.percentage <= parseFloat(maxPercentage));
    }

    setFilteredResults(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGroup('');
    setSelectedSubject('');
    setSelectedTest('');
    setMinPercentage('');
    setMaxPercentage('');
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

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Filtrlar</h2>
              <Button onClick={resetFilters} variant="secondary" size="sm">
                🔄 Tozalash
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O'quvchi qidirish
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ism bo'yicha qidirish..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guruh
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Barchasi</option>
                  {groups
                  .sort((a, b) => {
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    return numA - numB;
                  })
                  .map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fan
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Barchasi</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test
                </label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Barchasi</option>
                  {tests.map((test) => (
                    <option key={test} value={test}>
                      {test}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimal foiz
                </label>
                <input
                  type="number"
                  value={minPercentage}
                  onChange={(e) => setMinPercentage(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimal foiz
                </label>
                <input
                  type="number"
                  value={maxPercentage}
                  onChange={(e) => setMaxPercentage(e.target.value)}
                  placeholder="100"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Jami: <span className="font-semibold">{results.length}</span> natija |
                Filtrlangan: <span className="font-semibold">{filteredResults.length}</span> natija
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Test natijalari</h2>
          </CardHeader>
          <CardBody>
            {filteredResults.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {results.length === 0 ? "Natijalar yo'q" : "Filter bo'yicha natija topilmadi"}
              </p>
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
                    {filteredResults.map((result, index) => (
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