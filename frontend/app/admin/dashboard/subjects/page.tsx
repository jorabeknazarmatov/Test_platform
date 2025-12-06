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
import type { Subject, Topic } from '@/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [topicNumber, setTopicNumber] = useState('');
  const [topicName, setTopicName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getSubjects(credentials.login, credentials.password);
      setSubjects(response.data);
    } catch (err) {
      setError('Fanlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopics = async (subjectId: number) => {
    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      const response = await adminApi.getTopicsBySubject(
        subjectId,
        credentials.login,
        credentials.password
      );
      setTopics(response.data);
      setSelectedSubject(subjectId);
    } catch (err) {
      setError('Mavzularni yuklashda xatolik');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.createSubject({ name: subjectName }, credentials.login, credentials.password);
      setSubjectName('');
      setShowSubjectForm(false);
      loadSubjects();
    } catch (err) {
      setError('Fan yaratishda xatolik');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setError('');

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.createTopic(
        {
          subject_id: selectedSubject,
          topic_number: parseInt(topicNumber),
          name: topicName,
        },
        credentials.login,
        credentials.password
      );
      setTopicNumber('');
      setTopicName('');
      setShowTopicForm(false);
      loadTopics(selectedSubject);
    } catch (err) {
      setError('Mavzu yaratishda xatolik');
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Fanni o\'chirmoqchimisiz?')) return;

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.deleteSubject(subjectId, credentials.login, credentials.password);
      setSelectedSubject(null);
      setTopics([]);
      loadSubjects();
    } catch (err) {
      setError('Fanni o\'chirishda xatolik');
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm('Mavzuni o\'chirmoqchimisiz?')) return;

    try {
      const credentials = getAdminCredentials();
      if (!credentials) return;

      await adminApi.deleteTopic(topicId, credentials.login, credentials.password);
      if (selectedSubject) loadTopics(selectedSubject);
    } catch (err) {
      setError('Mavzuni o\'chirishda xatolik');
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
          <h1 className="text-3xl font-bold text-gray-900">Fanlar</h1>
          <Button onClick={() => setShowSubjectForm(true)}>+ Fan qo'shish</Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showSubjectForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Yangi fan</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <Input
                  label="Fan nomi"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Masalan: Matematika"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Saqlash</Button>
                  <Button variant="secondary" onClick={() => setShowSubjectForm(false)}>
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
              <h2 className="text-xl font-semibold text-gray-900">Fanlar ro'yxati</h2>
            </CardHeader>
            <CardBody>
              {subjects.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Fanlar yo'q</p>
              ) : (
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedSubject === subject.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => loadTopics(subject.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubject(subject.id);
                          }}
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mavzular
                  {selectedSubject && (
                    <Badge variant="info" className="ml-2">
                      {subjects.find((s) => s.id === selectedSubject)?.name}
                    </Badge>
                  )}
                </h2>
                {selectedSubject && (
                  <Button size="sm" onClick={() => setShowTopicForm(true)}>
                    + Qo'shish
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {!selectedSubject ? (
                <p className="text-gray-600 text-center py-8">Fanni tanlang</p>
              ) : showTopicForm ? (
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <Input
                    label="Mavzu raqami"
                    type="number"
                    value={topicNumber}
                    onChange={(e) => setTopicNumber(e.target.value)}
                    placeholder="Masalan: 1"
                    required
                  />
                  <Input
                    label="Mavzu nomi"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="Masalan: Sonlar"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Saqlash
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowTopicForm(false)}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </form>
              ) : topics.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Mavzular yo'q</p>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge>{topic.topic_number}</Badge>
                        <span className="text-gray-900">{topic.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteTopic(topic.id)}
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
