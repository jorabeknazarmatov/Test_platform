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
    } catch (err) {
      setError('O\'quvchilarni yuklashda xatolik');
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">1. Guruhni tanlang</h2>
            </CardHeader>
            <CardBody>
              {groups.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Guruxlar yo'q</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => loadStudents(group.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedGroup === group.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">2. O'quvchini tanlang</h2>
            </CardHeader>
            <CardBody>
              {!selectedGroup ? (
                <p className="text-gray-600 text-center py-8">Avval guruhni tanlang</p>
              ) : students.length === 0 ? (
                <p className="text-gray-600 text-center py-8">O'quvchilar yo'q</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedStudent === student.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-gray-900">{student.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

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
