'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { adminApi, studentApi } from '@/lib/api';
import { getAdminCredentials } from '@/lib/adminAuth';
import type { Test, Subject, Group, Student, Topic } from '@/types';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otpGenerationType, setOtpGenerationType] = useState<'single' | 'batch'>('single');
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [testName, setTestName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [duration, setDuration] = useState('60');
  const [otpCode, setOtpCode] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const [testsRes, subjectsRes, groupsRes] = await Promise.all([
        adminApi.getTests(credentials.login, credentials.password),
        adminApi.getSubjects(credentials.login, credentials.password),
        studentApi.getGroups(),
      ]);

      setTests(testsRes.data);
      setSubjects(subjectsRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopics = async (selectedSubjectId: string) => {
    if (!selectedSubjectId) {
      setTopics([]);
      return;
    }

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getTopicsBySubject(
        parseInt(selectedSubjectId),
        credentials.login,
        credentials.password
      );
      setTopics(response.data);
    } catch (err) {
      setError('Mavzularni yuklashda xatolik');
    }
  };

  const loadStudents = async (groupId: number) => {
    try {
      const response = await studentApi.getStudentsByGroup(groupId);
      setStudents(response.data);
      setSelectedGroup(groupId);
    } catch (err) {
      setError('O\'quvchilarni yuklashda xatolik');
    }
  };

  const handleSubjectChange = (selectedSubjectId: string) => {
    setSubjectId(selectedSubjectId);
    setSelectedTopics([]);
    loadTopics(selectedSubjectId);
  };

  const handleTopicToggle = (topicNumber: number) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicNumber)) {
        return prev.filter(t => t !== topicNumber);
      } else {
        return [...prev, topicNumber];
      }
    });
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map(t => t.topic_number));
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedTopics.length === 0) {
      setError('Kamida bitta mavzuni tanlang');
      return;
    }

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.createTest(
        {
          name: testName,
          subject_id: parseInt(subjectId),
          duration_minutes: parseInt(duration),
          topic_numbers: selectedTopics,
        },
        credentials.login,
        credentials.password
      );
      setTestName('');
      setSubjectId('');
      setSelectedTopics([]);
      setDuration('60');
      setTopics([]);
      setShowTestForm(false);
      setSuccess('Test muvaffaqiyatli yaratildi!');
      loadData();
    } catch (err) {
      setError('Test yaratishda xatolik');
    }
  };

  const handleImportTests = async (e: React.FormEvent) => {
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

      const response = await adminApi.importTests(
        importFile,
        credentials.login,
        credentials.password
      );

      if (response.data.success) {
        setSuccess(`${response.data.imported_count} ta test import qilindi!`);
        setImportFile(null);
        setShowImportForm(false);
        loadData();
      } else {
        setError(response.data.message || 'Import xatosi');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import xatosi');
    }
  };

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const credentials = getAdminCredentials();
    if (!credentials) return;

    try {
      if (otpGenerationType === 'single') {
        // Birma-bir generatsiya
        if (!selectedStudent || !selectedTest) return;

        const response = await adminApi.generateOTP(
          selectedStudent,
          selectedTest,
          credentials.login,
          credentials.password
        );
        setOtpCode(response.data.otp);
        alert(`Session ID: ${response.data.session_id}\nOTP: ${response.data.otp}\n\nBu ma'lumotlarni o'quvchiga bering.`);
        setShowOTPForm(false);
        setSelectedTest(null);
        setSelectedGroup(null);
        setSelectedStudent(null);
      } else {
        // Guruh uchun birdaniga
        if (!selectedGroup || !selectedTest) return;

        const response = await adminApi.generateOTPBatch(
          selectedGroup,
          selectedTest,
          credentials.login,
          credentials.password
        );

        setSuccess(`${response.data.count} ta o'quvchi uchun OTP yaratildi! Sessions sahifasidan ko'ring.`);
        setShowOTPForm(false);
        setSelectedTest(null);
        setSelectedGroup(null);
        setSelectedStudent(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'OTP yaratishda xatolik');
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Testni o\'chirmoqchimisiz?')) return;

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.deleteTest(testId, credentials.login, credentials.password);
      loadData();
    } catch (err) {
      setError('Testni o\'chirishda xatolik');
    }
  };

  const handleToggleTestStatus = async (testId: number) => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.toggleTestStatus(testId, credentials.login, credentials.password);
      setSuccess(response.data.message);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Test holatini o\'zgartirishda xatolik');
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
          <h1 className="text-3xl font-bold text-gray-900">Testlar</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowTestForm(true)}>+ Qo'lda yaratish</Button>
            <Button variant="secondary" onClick={() => setShowImportForm(true)}>
              JSON Import
            </Button>
            <Button variant="secondary" onClick={() => setShowOTPForm(true)}>
              OTP generatsiya
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {showTestForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Qo'lda test yaratish</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <Input
                  label="Test nomi"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Masalan: 1-Nazorat ishi"
                  required
                />
                <Select
                  label="Fan"
                  value={subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  required
                >
                  <option value="">Fanni tanlang</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>

                {subjectId && topics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mavzularni tanlang (nechinchi mavzugacha)
                    </label>
                    <div className="mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleSelectAllTopics}
                      >
                        {selectedTopics.length === topics.length ? 'Barchasini bekor qilish' : 'Hammasini tanlash'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {topics.map((topic) => (
                        <label
                          key={topic.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(topic.topic_number)}
                            onChange={() => handleTopicToggle(topic.topic_number)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {topic.topic_number}. {topic.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Tanlangan: {selectedTopics.length} ta mavzu
                    </p>
                  </div>
                )}

                <Input
                  label="Davomiyligi (daqiqada)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={!subjectId || selectedTopics.length === 0}>
                    Saqlash
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowTestForm(false);
                      setTestName('');
                      setSubjectId('');
                      setSelectedTopics([]);
                      setTopics([]);
                    }}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {showImportForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">JSON dan testlarni import qilish</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleImportTests} className="space-y-4">
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
                  <p className="text-sm text-gray-600 mt-2">
                    JSON formatda testlarni yuklash uchun fayl tanlang
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    <strong>Format namunasi:</strong>
                    <pre className="mt-2 text-xs overflow-x-auto">
{`[
  {
    "subject": "Matematika",
    "tests": {
      "theme": "Algebra",
      "testQuestions": [
        {
          "id": 1,
          "question": "2+2=?",
          "options": ["3", "4", "5"],
          "correctAnswer": "4"
        }
      ]
    }
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

        {showOTPForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">OTP generatsiya qilish</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleGenerateOTP} className="space-y-4">
                {/* Generatsiya turi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generatsiya turi
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="single"
                        checked={otpGenerationType === 'single'}
                        onChange={(e) => {
                          setOtpGenerationType('single');
                          setSelectedStudent(null);
                        }}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Birma-bir</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="batch"
                        checked={otpGenerationType === 'batch'}
                        onChange={(e) => {
                          setOtpGenerationType('batch');
                          setSelectedStudent(null);
                        }}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Butun guruh uchun</span>
                    </label>
                  </div>
                </div>

                <Select
                  label="Test"
                  value={selectedTest || ''}
                  onChange={(e) => setSelectedTest(parseInt(e.target.value))}
                  required
                >
                  <option value="">Testni tanlang</option>
                  {tests.filter(test => test.is_active).map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
                </Select>
                {tests.filter(test => test.is_active).length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Faol testlar yo'q. Avval testni faol holatga o'tkazing.
                  </p>
                )}

                <Select
                  label="Guruh"
                  value={selectedGroup || ''}
                  onChange={(e) => loadStudents(parseInt(e.target.value))}
                  required
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>

                {/* Faqat birma-bir generatsiyada o'quvchi tanlash */}
                {otpGenerationType === 'single' && selectedGroup && (
                  <Select
                    label="O'quvchi"
                    value={selectedStudent || ''}
                    onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
                    required
                  >
                    <option value="">O'quvchini tanlang</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))}
                  </Select>
                )}

                {/* Info message */}
                {otpGenerationType === 'batch' && selectedGroup && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    Guruhning barcha o'quvchilari uchun OTP yaratiladi. Yaratilgan OTPlarni Sessions sahifasidan ko'rishingiz mumkin.
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">
                    {otpGenerationType === 'single' ? 'OTP generatsiya qilish' : 'Barcha o\'quvchilar uchun yaratish'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowOTPForm(false);
                      setOtpGenerationType('single');
                      setSelectedTest(null);
                      setSelectedGroup(null);
                      setSelectedStudent(null);
                    }}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Testlar ro'yxati</h2>
          </CardHeader>
          <CardBody>
            {tests.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Testlar yo'q</p>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test.id} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{test.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="info">
                            {subjects.find((s) => s.id === test.subject_id)?.name}
                          </Badge>
                          <Badge variant={test.is_active ? 'success' : 'danger'}>
                            {test.is_active ? 'Faol' : 'Faol emas'}
                          </Badge>
                          <span>• {test.duration_minutes} daqiqa</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={test.is_active ? 'primary' : 'secondary'}
                          onClick={() => handleToggleTestStatus(test.id)}
                        >
                          {test.is_active ? 'Faol emasga' : 'Faolga'} o'tkazish
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteTest(test.id)}
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
      </div>
    </AdminLayout>
  );
}
