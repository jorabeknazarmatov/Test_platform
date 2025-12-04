import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import type { Subject, Topic } from '../../types';
import { Plus, ChevronRight, ChevronDown } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopic, setNewTopic] = useState<{ subjectId: number | null; topicNumber: string; name: string }>({
    subjectId: null,
    topicNumber: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, password } = useAuthStore();

  const fetchSubjects = async () => {
    try {
      const data = await adminApi.getSubjects(login, password);
      setSubjects(data);
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

  useEffect(() => {
    fetchSubjects();
  }, []);

  const toggleSubject = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
      if (!topics[subjectId]) {
        fetchTopics(subjectId);
      }
    }
    setExpandedSubjects(newExpanded);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createSubject(newSubjectName, login, password);
      setNewSubjectName('');
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.subjectId) {
      alert('Fanni tanlang');
      return;
    }
    setLoading(true);
    try {
      await adminApi.createTopic(
        {
          subject_id: newTopic.subjectId,
          topic_number: parseInt(newTopic.topicNumber),
          name: newTopic.name,
        },
        login,
        password
      );
      setNewTopic({ subjectId: null, topicNumber: '', name: '' });
      fetchTopics(newTopic.subjectId);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Fanlar va Mavzular</h1>

      {/* Yangi fan qo'shish */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Yangi fan qo'shish</h2>
        <form onSubmit={handleCreateSubject} className="flex gap-4">
          <Input
            placeholder="Fan nomi"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Qo'shish
          </Button>
        </form>
      </Card>

      {/* Yangi mavzu qo'shish */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Yangi mavzu qo'shish</h2>
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <select
            value={newTopic.subjectId || ''}
            onChange={(e) => setNewTopic({ ...newTopic, subjectId: parseInt(e.target.value) })}
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
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Mavzu raqami"
              value={newTopic.topicNumber}
              onChange={(e) => setNewTopic({ ...newTopic, topicNumber: e.target.value })}
              required
              className="w-32"
            />
            <Input
              placeholder="Mavzu nomi"
              value={newTopic.name}
              onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Qo'shish
            </Button>
          </div>
        </form>
      </Card>

      {/* Fanlar ro'yxati */}
      <div className="space-y-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-4 -m-4"
              onClick={() => toggleSubject(subject.id)}
            >
              <div className="flex items-center gap-3">
                {expandedSubjects.has(subject.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <h3 className="font-bold text-lg">{subject.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {topics[subject.id]?.length || 0} ta mavzu
                  </p>
                </div>
              </div>
            </div>

            {expandedSubjects.has(subject.id) && (
              <div className="mt-4 pl-8 space-y-2">
                {topics[subject.id]?.length > 0 ? (
                  topics[subject.id].map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                        {topic.topic_number}
                      </span>
                      <span className="text-gray-800">{topic.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Mavzular mavjud emas</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
