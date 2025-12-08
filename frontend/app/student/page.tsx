'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { studentApi } from '@/lib/api';
import type { Group, Student } from '@/types';

export default function StudentLoginPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await studentApi.getGroups();
      setGroups(response.data);
    } catch (err) {
      setError('Guruhlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async (groupId: number) => {
    try {
      const response = await studentApi.getStudentsByGroup(groupId);
      setStudents(response.data);
      setSelectedGroup(groupId);
      setSelectedStudent(null);
      setStudentSearch('');
    } catch (err) {
      setError('O\'quvchilarni yuklashda xatolik');
    }
  };

  // Filter groups based on search
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    student.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleContinue = () => {
    if (!selectedStudent) {
      setError('O\'quvchini tanlang');
      return;
    }

    // Student ma'lumotlarini saqlash
    localStorage.setItem('studentId', selectedStudent.toString());
    const student = students.find((s) => s.id === selectedStudent);
    if (student) {
      localStorage.setItem('studentName', student.full_name);
    }

    router.push('/student/otp');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test platformasi</h1>
          <p className="text-gray-600">Guruh va ismingizni tanlang</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guruh tanlash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Guruhni tanlang
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Guruhni qidirish..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="placeholder:text-gray-400 text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {groupSearch && (
                    <button
                      onClick={() => setGroupSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={selectedGroup || ''}
                  onChange={(e) => loadStudents(Number(e.target.value))}
                  className="text-gray-900 mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  size={8}
                >
                  <option value="" disabled>
                    Guruhni tanlang...
                  </option>
                  {filteredGroups.length === 0 ? (
                    <option disabled>Guruh topilmadi</option>
                  ) : (
                    filteredGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Student tanlash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Ismingizni tanlang
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ismingizni qidirish..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    disabled={!selectedGroup}
                    className="placeholder:text-gray-400 text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(Number(e.target.value))}
                  disabled={!selectedGroup}
                  className="text-gray-900 mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  size={8}
                >
                  <option value="" disabled>
                    {!selectedGroup ? 'Avval guruhni tanlang...' : 'Ismingizni tanlang...'}
                  </option>
                  {filteredStudents.length === 0 && selectedGroup ? (
                    <option disabled>O'quvchi topilmadi</option>
                  ) : (
                    filteredStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={handleContinue} disabled={!selectedStudent}>
            Davom etish
          </Button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-500 hover:text-blue-600 text-sm">
            ← Bosh sahifaga qaytish
          </a>
        </div>
      </motion.div>
    </div>
  );
}
