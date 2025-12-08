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
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [groupName, setGroupName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmitGroup = (e: React.FormEvent) => {
    if (editingGroup) {
      handleUpdateGroup(e);
    } else {
      handleCreateGroup(e);
    }
  };
  
  // Import Groups
  const handleImportGroups = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!importFile) {
      setError('Fayl tanlang');
      return;
    }

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.importGroups(
        importFile,
        credentials.login,
        credentials.password
      );

      if (response.data.success) {
        setSuccess(
          `✓ ${response.data.imported_groups} ta guruh, ${response.data.imported_students} ta o'quvchi import qilindi!`
        );
        setImportFile(null);
        setShowImportForm(false);
        loadGroups();
      } else {
        setError(response.data.message || 'Import xatosi');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import xatosi');
    }
  };

  // Edit Group
  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setShowGroupForm(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    setError('');
    setSuccess('');

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.updateGroup(
        editingGroup.id,
        { name: groupName },
        credentials.login,
        credentials.password
      );

      setSuccess('Guruh nomi yangilandi!');
      setGroupName('');
      setShowGroupForm(false);
      setEditingGroup(null);
      loadGroups();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Guruhni yangilashda xatolik');
    }
  };

  // Edit Student
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.full_name);
    setShowStudentForm(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !selectedGroup) return;

    setError('');
    setSuccess('');

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.updateStudent(
        editingStudent.id,
        { full_name: studentName, group_id: selectedGroup },
        credentials.login,
        credentials.password
      );

      setSuccess('O\'quvchi ismi yangilandi!');
      setStudentName('');
      setShowStudentForm(false);
      setEditingStudent(null);
      loadStudents(selectedGroup);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'O\'quvchini yangilashda xatolik');
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
          <div className="flex gap-2">
            <Button onClick={() => setShowGroupForm(true)}>+ Guruh qo'shish</Button>
            <Button variant="secondary" onClick={() => setShowImportForm(true)}>
              📥 Import qilish
            </Button>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showImportForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Guruh va studentlarni import qilish</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleImportGroups} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON fayl
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                    required
                  />
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    <strong>Format:</strong>
                    <pre className="mt-2 text-xs overflow-x-auto">
        {
`[
  {
    "group_name": "101-guruh",
    "students": [
      {
        "first_name": "Otabek",
        "last_name": "Olimov",
        "middle_name": "Olim o'g'li"
      }
    ]
  }
]`}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Import qilish</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowImportForm(false);
                      setImportFile(null);
                    }}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {showGroupForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh qo\'shish'}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmitGroup} className="space-y-4">
                <Input
                  label="Guruh nomi"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Masalan: 1-Guruh"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingGroup ? 'Yangilash' : 'Saqlash'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowGroupForm(false);
                      setEditingGroup(null);
                      setGroupName('');
                    }}
                  >
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
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGroup(group);
                            }}
                          >
                            ✏️ Tahrirlash
                          </Button>
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
                <form onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent} className="space-y-4">
                  <Input
                    label="O'quvchi F.I.O"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masalan: Ahmedov Ali"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {editingStudent ? 'Yangilash' : 'Saqlash'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setShowStudentForm(false);
                        setEditingStudent(null);
                        setStudentName('');
                      }}
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditStudent(student)}
                        >
                          ✏️ Tahrirlash
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          O'chirish
                        </Button>
                      </div>
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
