import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import type { Test, Subject, Student, Group, Topic } from '../../types';
import { Plus, Key, Upload } from 'lucide-react';

export const TestsPage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({});

  const [newTest, setNewTest] = useState({
    name: '',
    subject_id: '',
    duration_minutes: '',
    topic_numbers: '',
  });

  const [loading, setLoading] = useState(false);
  const { login, password } = useAuthStore();

  const fetchTests = async () => {
    try {
      const data = await adminApi.getTests(login, password);
      setTests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await adminApi.getSubjects(login, password);
      setSubjects(data);
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

  const fetchTopics = async (subjectId: number) => {
    try {
      const data = await adminApi.getTopics(subjectId, login, password);
      setTopics((prev) => ({ ...prev, [subjectId]: data }));
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
    fetchTests();
    fetchSubjects();
    fetchGroups();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const topicNumbers = newTest.topic_numbers
        .split(',')
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n));

      await adminApi.createTest(
        {
          name: newTest.name,
          subject_id: parseInt(newTest.subject_id),
          duration_minutes: parseInt(newTest.duration_minutes),
          topic_numbers: topicNumbers.length > 0 ? topicNumbers : undefined,
        },
        login,
        password
      );
      setNewTest({ name: '', subject_id: '', duration_minutes: '', topic_numbers: '' });
      fetchTests();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOTP = async () => {
    if (!selectedTest || !selectedStudent) {
      alert('Test va o\'quvchini tanlang');
      return;
    }
    setLoading(true);
    try {
      const response = await adminApi.generateOTP(selectedStudent, selectedTest, login, password);
      setGeneratedOTP(response.otp);
      alert(`OTP generatsiya qilindi: ${response.otp}`);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleImportTests = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await adminApi.importTests(file, login, password);
      alert('Testlar muvaffaqiyatli import qilindi');
      fetchTests();
    } catch (err: any) {
      alert(err.message || 'Import xatolik yuz berdi');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setNewTest({ ...newTest, subject_id: subjectId, topic_numbers: '' });
    if (subjectId) {
      fetchTopics(parseInt(subjectId));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Testlar</h1>

      {/* Yangi test qo'shish */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Yangi test qo'shish</h2>
        <form onSubmit={handleCreateTest} className="space-y-4">
          <Input
            placeholder="Test nomi"
            value={newTest.name}
            onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
            required
          />
          <select
            value={newTest.subject_id}
            onChange={(e) => handleSubjectChange(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Fanni tanlang</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Davomiyligi (daqiqa)"
            value={newTest.duration_minutes}
            onChange={(e) => setNewTest({ ...newTest, duration_minutes: e.target.value })}
            required
          />
          <div>
            <Input
              placeholder="Mavzu raqamlari (vergul bilan: 1,2,3)"
              value={newTest.topic_numbers}
              onChange={(e) => setNewTest({ ...newTest, topic_numbers: e.target.value })}
            />
            {newTest.subject_id && topics[parseInt(newTest.subject_id)] && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-semibold mb-1">Mavjud mavzular:</p>
                <div className="flex flex-wrap gap-2">
                  {topics[parseInt(newTest.subject_id)].map((topic) => (
                    <span
                      key={topic.id}
                      className="bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        const current = newTest.topic_numbers;
                        const newValue = current
                          ? `${current},${topic.topic_number}`
                          : `${topic.topic_number}`;
                        setNewTest({ ...newTest, topic_numbers: newValue });
                      }}
                    >
                      {topic.topic_number}. {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button type="submit" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Test yaratish
          </Button>
        </form>
      </Card>

      {/* Test import */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Excel fayldan import</h2>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportTests}
              className="hidden"
              disabled={loading}
            />
            <Button as="span" disabled={loading}>
              <Upload className="w-4 h-4 mr-2" />
              Excel yuklash
            </Button>
          </label>
          <p className="text-sm text-gray-600">
            Excel format: Sheet nomi - Subject nomi, har bir qator - test savoli
          </p>
        </div>
      </Card>

      {/* OTP generatsiya */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">OTP generatsiya qilish</h2>
        <div className="space-y-4">
          <select
            value={selectedTest || ''}
            onChange={(e) => setSelectedTest(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Testni tanlang</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name} ({subjects.find((s) => s.id === test.subject_id)?.name})
              </option>
            ))}
          </select>
          <select
            onChange={(e) => {
              const groupId = parseInt(e.target.value);
              if (groupId) fetchStudents(groupId);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Guruhni tanlang</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStudent || ''}
            onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">O'quvchini tanlang</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
          <Button onClick={handleGenerateOTP} disabled={loading || !selectedTest || !selectedStudent}>
            <Key className="w-4 h-4 mr-2" />
            OTP generatsiya qilish
          </Button>
          {generatedOTP && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Generatsiya qilingan OTP:</p>
              <p className="text-3xl font-bold text-green-600 font-mono">{generatedOTP}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Testlar ro'yxati */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mavjud testlar</h2>
        {tests.map((test) => (
          <Card key={test.id}>
            <div>
              <h3 className="font-bold text-lg">{test.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Fan:</span>{' '}
                  {subjects.find((s) => s.id === test.subject_id)?.name}
                </p>
                <p>
                  <span className="font-semibold">Davomiyligi:</span> {test.duration_minutes} daqiqa
                </p>
                {test.topic_numbers && test.topic_numbers.length > 0 && (
                  <p>
                    <span className="font-semibold">Mavzular:</span> {test.topic_numbers.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
