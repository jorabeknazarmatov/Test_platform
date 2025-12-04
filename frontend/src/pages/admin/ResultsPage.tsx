import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import type { Result, Test, Group, Student } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { Download, Filter, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResultsPage: React.FC = () => {
  const { login, password } = useAuthStore();
  const [results, setResults] = useState<Result[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filterTestId, setFilterTestId] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [filterStudentId, setFilterStudentId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filterGroupId) {
      fetchStudents(parseInt(filterGroupId));
    } else {
      setStudents([]);
      setFilterStudentId('');
    }
  }, [filterGroupId]);

  const fetchData = async () => {
    try {
      const [testsData, groupsData] = await Promise.all([
        adminApi.getTests(login, password),
        adminApi.getGroups(login, password),
      ]);
      setTests(testsData);
      setGroups(groupsData);
      await fetchResults();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (groupId: number) => {
    try {
      const data = await adminApi.getStudentsByGroup(groupId, login, password);
      setStudents(data);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const studentId = filterStudentId ? parseInt(filterStudentId) : undefined;
      const testId = filterTestId ? parseInt(filterTestId) : undefined;
      const data = await adminApi.getResults(login, password, studentId, testId);
      setResults(data);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to fetch results');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminApi.exportResults(login, password);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert('Results exported successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to export results');
    } finally {
      setExporting(false);
    }
  };

  const getResultBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: 'success' as const, text: 'Excellent' };
    if (percentage >= 60) return { variant: 'primary' as const, text: 'Good' };
    if (percentage >= 40) return { variant: 'warning' as const, text: 'Pass' };
    return { variant: 'danger' as const, text: 'Fail' };
  };

  if (loading) {
    return <Loading size="xl" text="Loading results..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Results</h1>
        <p className="text-gray-600">View and export test results</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button
                variant="success"
                leftIcon={<Download />}
                onClick={handleExport}
                isLoading={exporting}
              >
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Test
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                  value={filterTestId}
                  onChange={(e) => setFilterTestId(e.target.value)}
                >
                  <option value="">All Tests</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Group
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                  value={filterGroupId}
                  onChange={(e) => setFilterGroupId(e.target.value)}
                >
                  <option value="">All Groups</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Student
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                  value={filterStudentId}
                  onChange={(e) => setFilterStudentId(e.target.value)}
                  disabled={!filterGroupId}
                >
                  <option value="">All Students</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="primary"
                leftIcon={<Filter />}
                onClick={fetchResults}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => {
                const badge = getResultBadge(result.percentage);
                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-400 transition-all bg-white"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          Student ID: {result.student_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Test ID: {result.test_id} | Result ID: {result.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(result.created_at || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {result.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.correct_count} / {result.total_count}
                      </div>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {results.length === 0 && (
              <p className="text-gray-500 text-center py-12">
                No results found. Try adjusting the filters.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
