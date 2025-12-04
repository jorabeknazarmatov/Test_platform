import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import type { Test, Subject, Student, Group } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { Plus, FileText, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export const TestsPage: React.FC = () => {
  const { login, password } = useAuthStore();
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generatingOTP, setGeneratingOTP] = useState(false);

  const [newTestName, setNewTestName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [duration, setDuration] = useState('');
  const [topicNumbers, setTopicNumbers] = useState('');

  const [otpStudentId, setOtpStudentId] = useState('');
  const [otpTestId, setOtpTestId] = useState('');
  const [selectedGroupForOTP, setSelectedGroupForOTP] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsData, subjectsData, groupsData] = await Promise.all([
        adminApi.getTests(login, password),
        adminApi.getSubjects(login, password),
        adminApi.getGroups(login, password),
      ]);
      setTests(testsData);
      setSubjects(subjectsData);
      setGroups(groupsData);
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
      alert(error.response?.data?.detail || 'Failed to fetch students');
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !selectedSubjectId || !duration || !topicNumbers.trim()) {
      alert('Please fill all fields');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      alert('Duration must be a positive number');
      return;
    }

    const topicsArray = topicNumbers
      .split(',')
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));

    if (topicsArray.length === 0) {
      alert('Please enter valid topic numbers (e.g., 1,2,3)');
      return;
    }

    setCreating(true);
    try {
      await adminApi.createTest(
        newTestName.trim(),
        parseInt(selectedSubjectId),
        durationNum,
        topicsArray,
        login,
        password
      );
      setNewTestName('');
      setSelectedSubjectId('');
      setDuration('');
      setTopicNumbers('');
      await fetchData();
      alert('Test created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create test');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateOTP = async () => {
    if (!otpStudentId || !otpTestId) {
      alert('Please select both student and test');
      return;
    }

    setGeneratingOTP(true);
    try {
      const result = await adminApi.generateOTP(
        parseInt(otpStudentId),
        parseInt(otpTestId),
        login,
        password
      );
      alert(
        `OTP Generated!\n\nSession ID: ${result.session_id}\nOTP: ${result.otp}\nExpires: ${new Date(result.expires_at).toLocaleString()}`
      );
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to generate OTP');
    } finally {
      setGeneratingOTP(false);
    }
  };

  if (loading) {
    return <Loading size="xl" text="Loading tests..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tests Management</h1>
        <p className="text-gray-600">Create tests and generate OTP for students</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Test */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Create New Test</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <Input
                  label="Test Name"
                  placeholder="Enter test name"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  disabled={creating}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    disabled={creating}
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Duration (minutes)"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={creating}
                />
                <Input
                  label="Topic Numbers (comma-separated)"
                  placeholder="1,2,3"
                  value={topicNumbers}
                  onChange={(e) => setTopicNumbers(e.target.value)}
                  disabled={creating}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<Plus />}
                  isLoading={creating}
                >
                  Create Test
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generate OTP */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Generate OTP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Group
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                  value={selectedGroupForOTP}
                  onChange={(e) => {
                    setSelectedGroupForOTP(e.target.value);
                    if (e.target.value) {
                      fetchStudents(parseInt(e.target.value));
                    } else {
                      setStudents([]);
                    }
                    setOtpStudentId('');
                  }}
                >
                  <option value="">Select group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                  value={otpStudentId}
                  onChange={(e) => setOtpStudentId(e.target.value)}
                  disabled={!selectedGroupForOTP}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Test
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                  value={otpTestId}
                  onChange={(e) => setOtpTestId(e.target.value)}
                >
                  <option value="">Select test</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} ({test.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="success"
                size="lg"
                className="w-full"
                leftIcon={<Key />}
                onClick={handleGenerateOTP}
                isLoading={generatingOTP}
                disabled={!otpStudentId || !otpTestId}
              >
                Generate OTP
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tests List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>All Tests ({tests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-400 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{test.name}</p>
                      <div className="mt-2 space-y-1">
                        <Badge variant="primary" size="sm">
                          {test.duration_minutes} minutes
                        </Badge>
                        <p className="text-xs text-gray-500">Test ID: {test.id}</p>
                        <p className="text-xs text-gray-500">
                          Topics: {test.topic_numbers?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {tests.length === 0 && (
              <p className="text-gray-500 text-center py-8">No tests created yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
