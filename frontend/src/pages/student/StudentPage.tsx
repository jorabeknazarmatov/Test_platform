import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/student.api';
import { testApi } from '../../api/test.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import type { Group, Student } from '../../types';
import { LogIn, Users, User } from 'lucide-react';

export const StudentPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const data = await studentApi.getGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (groupId: number) => {
    try {
      const data = await studentApi.getStudentsByGroup(groupId);
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupChange = (groupId: string) => {
    const id = parseInt(groupId);
    setSelectedGroup(id || null);
    setSelectedStudent(null);
    setStudents([]);
    if (id) {
      fetchStudents(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sessionId || !otp) {
      setError('Sessiya ID va OTP ni kiriting');
      return;
    }

    setLoading(true);
    try {
      const response = await testApi.verifyOTP(parseInt(sessionId), otp);
      if (response.success) {
        navigate(`/student/test/${response.session_id}`);
      } else {
        setError('OTP noto\'g\'ri yoki muddati o\'tgan');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Test Platformasi</h1>
          <p className="text-gray-600">O'quvchi tizimiga kirish</p>
        </div>

        <Card className="mb-6">
          <div className="space-y-6">
            {/* Guruh tanlash */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Guruhni tanlang
              </label>
              <select
                value={selectedGroup || ''}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Guruhni tanlang</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* O'quvchi tanlash */}
            {selectedGroup && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  O'quvchini tanlang
                </label>
                <select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(parseInt(e.target.value) || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">O'quvchini tanlang</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {selectedStudent && (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Test boshlash</h2>
                <p className="text-sm text-gray-600 mb-4">
                  O'qituvchidan Sessiya ID va OTP kodni oling
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sessiya ID
                </label>
                <Input
                  type="number"
                  placeholder="Sessiya ID raqamini kiriting"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OTP Kod
                </label>
                <Input
                  type="text"
                  placeholder="6 xonali OTP kodni kiriting"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  required
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
                <LogIn className="w-5 h-5 mr-2" />
                Testni boshlash
              </Button>
            </form>
          </Card>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    </div>
  );
};
