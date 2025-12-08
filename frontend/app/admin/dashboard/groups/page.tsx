'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { getAdminCredentials } from '@/lib/adminAuth';
import type { Group, Student } from '@/types';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) {
        console.log('Admin kredensiallar topilmadi');
        setIsLoading(false);
        return;
      }

      console.log('Gruppalar yuklanmoqda...', credentials);
      const response = await adminApi.getGroups(credentials.login, credentials.password);
      console.log('Gruppalar yuklandi:', response.data);
      setGroups(response.data);
    } catch (err: any) {
      console.error('Gruppalarni yuklashda xatolik:', err);
      console.error('Error response:', err.response?.data);
      setError(`Gruppalarni yuklashda xatolik: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async (groupId: number) => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getStudentsByGroup(groupId, credentials.login, credentials.password);
      setStudents(response.data);
      setSelectedGroup(groupId);
    } catch (err) {
      setError('O\'quvchilarni yuklashda xatolik');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      console.log('Guruh yaratilmoqda:', groupName);
      await adminApi.createGroup({ name: groupName }, credentials.login, credentials.password);
      console.log('Guruh yaratildi');
      setGroupName('');
      setShowGroupForm(false);
      loadGroups();
    } catch (err: any) {
      console.error('Guruh yaratishda xatolik:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.detail || 'Guruh yaratishda xatolik';
      setError(errorMsg);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setError('');

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.createStudent(
        { group_id: selectedGroup, full_name: studentName },
        credentials.login,
        credentials.password
      );
      setStudentName('');
      setShowStudentForm(false);
      loadStudents(selectedGroup);
    } catch (err) {
      setError('O\'quvchi qo\'shishda xatolik');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Guruhni o\'chirmoqchimisiz?')) return;

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.deleteGroup(groupId, credentials.login, credentials.password);
      setSelectedGroup(null);
      setStudents([]);
      loadGroups();
    } catch (err) {
      setError('Guruhni o\'chirishda xatolik');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('O\'quvchini o\'chirmoqchimisiz?')) return;

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.deleteStudent(studentId, credentials.login, credentials.password);
      if (selectedGroup) loadStudents(selectedGroup);
    } catch (err) {
      setError('O\'quvchini o\'chirishda xatolik');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Guruxlar</h1>
          <Button onClick={() => setShowGroupForm(true)}>+ Guruh qo'shish</Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showGroupForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Yangi guruh</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <Input
                  label="Guruh nomi"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Masalan: 1-Guruh"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Saqlash</Button>
                  <Button variant="secondary" onClick={() => setShowGroupForm(false)}>
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Guruxlar ro'yxati</h2>
            </CardHeader>
            <CardBody>
              {groups.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Guruxlar yo'q</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedGroup === group.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => loadStudents(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                          >
                            O'chirish
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  O'quvchilar
                  {selectedGroup && (
                    <Badge variant="info" className="ml-2">
                      {groups.find((g) => g.id === selectedGroup)?.name}
                    </Badge>
                  )}
                </h2>
                {selectedGroup && (
                  <Button size="sm" onClick={() => setShowStudentForm(true)}>
                    + Qo'shish
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {!selectedGroup ? (
                <p className="text-gray-600 text-center py-8">Guruhni tanlang</p>
              ) : showStudentForm ? (
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <Input
                    label="O'quvchi F.I.O"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masalan: Ahmedov Ali"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Saqlash
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowStudentForm(false)}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </form>
              ) : students.length === 0 ? (
                <p className="text-gray-600 text-center py-8">O'quvchilar yo'q</p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <span className="text-gray-900">{student.full_name}</span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        O'chirish
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
