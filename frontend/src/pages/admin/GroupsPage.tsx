import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import type { Group, Student } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { Plus, Trash2, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const GroupsPage: React.FC = () => {
  const { login, password } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await adminApi.getGroups(login, password);
      setGroups(data);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (groupId: number) => {
    setLoadingStudents(true);
    try {
      const data = await adminApi.getStudentsByGroup(groupId, login, password);
      setStudents(data);
      setSelectedGroupId(groupId);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreating(true);
    try {
      await adminApi.createGroup(newGroupName.trim(), login, password);
      setNewGroupName('');
      await fetchGroups();
      alert('Group created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!confirm(`Are you sure you want to delete group "${groupName}"?`)) return;

    try {
      await adminApi.deleteGroup(groupId, login, password);
      await fetchGroups();
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setStudents([]);
      }
      alert('Group deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete group');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedGroupId) return;

    setCreatingStudent(true);
    try {
      await adminApi.createStudent(
        selectedGroupId,
        newStudentName.trim(),
        login,
        password
      );
      setNewStudentName('');
      await fetchStudents(selectedGroupId);
      alert('Student added successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add student');
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleDeleteStudent = async (studentId: number, studentName: string) => {
    if (!confirm(`Are you sure you want to delete student "${studentName}"?`)) return;

    try {
      await adminApi.deleteStudent(studentId, login, password);
      if (selectedGroupId) {
        await fetchStudents(selectedGroupId);
      }
      alert('Student deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete student');
    }
  };

  if (loading) {
    return <Loading size="xl" text="Loading groups..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Groups Management</h1>
        <p className="text-gray-600">Manage student groups and their members</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Groups Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Groups ({groups.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    disabled={creating}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Plus />}
                    disabled={creating || !newGroupName.trim()}
                    isLoading={creating}
                  >
                    Add
                  </Button>
                </div>
              </form>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {groups.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No groups yet. Create one!</p>
                ) : (
                  groups.map((group) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedGroupId === group.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-400 bg-white'
                      }`}
                      onClick={() => fetchStudents(group.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{group.name}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(group.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id, group.name);
                        }}
                      >
                        Delete
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Students {selectedGroupId ? `(${students.length})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedGroupId ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a group to view students</p>
                </div>
              ) : loadingStudents ? (
                <div className="py-12">
                  <Loading size="lg" text="Loading students..." />
                </div>
              ) : (
                <>
                  <form onSubmit={handleCreateStudent} className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter student full name"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        disabled={creatingStudent}
                      />
                      <Button
                        type="submit"
                        variant="success"
                        leftIcon={<Plus />}
                        disabled={creatingStudent || !newStudentName.trim()}
                        isLoading={creatingStudent}
                      >
                        Add
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {students.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No students in this group yet
                      </p>
                    ) : (
                      students.map((student, index) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-green-400 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="primary" size="md">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {student.full_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {student.id}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 />}
                            onClick={() =>
                              handleDeleteStudent(student.id, student.full_name)
                            }
                          >
                            Delete
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
