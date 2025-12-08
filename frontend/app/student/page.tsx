'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import AutocompleteInput from '@/components/ui/AutocompleteInput';
import { studentApi } from '@/lib/api';
import type { Group, Student } from '@/types';

export default function StudentLoginPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const studentInputRef = useRef<HTMLInputElement>(null);

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
    setIsLoadingStudents(true);
    try {
      const response = await studentApi.getStudentsByGroup(groupId);
      setStudents(response.data);
      setSelectedGroup(groupId);
      setSelectedStudent(null);
      setStudentSearch('');

      // Auto-focus student input after loading
      setTimeout(() => {
        studentInputRef.current?.focus();
      }, 100);
    } catch (err) {
      setError('O\'quvchilarni yuklashda xatolik');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Prepare options for autocomplete
  const groupOptions = groups.map((group) => ({
    id: group.id,
    label: group.name,
  }));

  const studentOptions = students.map((student) => ({
    id: student.id,
    label: student.full_name,
  }));

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
            <div className="space-y-6">
              {/* Guruh tanlash */}
              <AutocompleteInput
                label="1. Guruhni tanlang"
                placeholder="Guruh nomini kiriting..."
                options={groupOptions}
                value={selectedGroup}
                onChange={(value) => loadStudents(value)}
                searchValue={groupSearch}
                onSearchChange={setGroupSearch}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />

              {/* Student tanlash */}
              <AutocompleteInput
                label="2. Ismingizni tanlang"
                placeholder="Ismingizni kiriting..."
                options={studentOptions}
                value={selectedStudent}
                onChange={setSelectedStudent}
                searchValue={studentSearch}
                onSearchChange={setStudentSearch}
                disabled={!selectedGroup}
                loading={isLoadingStudents}
                inputRef={studentInputRef}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              {/* Success animation */}
              <AnimatePresence>
                {selectedStudent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                  >
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Tayyor!</p>
                      <p className="text-xs text-green-700">
                        {students.find(s => s.id === selectedStudent)?.full_name}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
