import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import type { Result, Test, Student, Group } from '../../types';
import { Download, Filter } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, password } = useAuthStore();

  const fetchResults = async () => {
    try {
      const data = await adminApi.getResults(
        login,
        password,
        selectedStudent || undefined,
        selectedTest || undefined
      );
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTests = async () => {
    try {
      const data = await adminApi.getTests(login, password);
      setTests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await adminApi.getGroups(login, password);
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (groupId: number) => {
    try {
      const data = await adminApi.getStudents(groupId, login, password);
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchTests();
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedStudent, selectedTest]);

  const handleExportResults = async () => {
    setLoading(true);
    try {
      const blob = await adminApi.exportResults(login, password);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `natijalar_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Export xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: number) => {
    const allStudents = groups.flatMap((g) => g.students || []);
    return allStudents.find((s) => s.id === studentId)?.full_name || `O'quvchi #${studentId}`;
  };

  const getTestName = (testId: number) => {
    return tests.find((t) => t.id === testId)?.name || `Test #${testId}`;
  };

  const getResultColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Natijalar</h1>

      {/* Filtrlar va Export */}
      <Card className="mb-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              onChange={(e) => {
                const groupId = parseInt(e.target.value);
                setSelectedGroup(groupId || null);
                setSelectedStudent(null);
                if (groupId) fetchStudents(groupId);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(parseInt(e.target.value) || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedGroup}
            >
              <option value="">Barcha o'quvchilar</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>

            <select
              value={selectedTest || ''}
              onChange={(e) => setSelectedTest(parseInt(e.target.value) || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Barcha testlar</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleExportResults} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Excel ga eksport qilish
          </Button>
        </div>
      </Card>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Jami natijalar</p>
            <p className="text-3xl font-bold text-blue-600">{results.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">O'rtacha ball</p>
            <p className="text-3xl font-bold text-green-600">
              {results.length > 0
                ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
                : 0}
              %
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">A'lo natijalar</p>
            <p className="text-3xl font-bold text-purple-600">
              {results.filter((r) => r.percentage >= 85).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Qoniqarsiz</p>
            <p className="text-3xl font-bold text-red-600">
              {results.filter((r) => r.percentage < 50).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Natijalar jadvali */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Natijalar ro'yxati</h2>
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Natijalar mavjud emas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">O'quvchi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Test</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">To'g'ri</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Jami</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Foiz</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Baho</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{getStudentName(result.student_id)}</td>
                    <td className="py-3 px-4">{getTestName(result.test_id)}</td>
                    <td className="text-center py-3 px-4">{result.correct_count}</td>
                    <td className="text-center py-3 px-4">{result.total_count}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-3 py-1 rounded-full font-semibold ${getResultColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold">
                      {result.percentage >= 85 ? '5' : result.percentage >= 70 ? '4' : result.percentage >= 50 ? '3' : '2'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
