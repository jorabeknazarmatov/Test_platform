import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import type { Subject, Topic } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { Plus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const SubjectsPage: React.FC = () => {
  const { login, password } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicNumber, setNewTopicNumber] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await adminApi.getSubjects(login, password);
      setSubjects(data);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (subjectId: number) => {
    setLoadingTopics(true);
    try {
      const data = await adminApi.getTopicsBySubject(subjectId, login, password);
      setTopics(data);
      setSelectedSubjectId(subjectId);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to fetch topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setCreating(true);
    try {
      await adminApi.createSubject(newSubjectName.trim(), login, password);
      setNewSubjectName('');
      await fetchSubjects();
      alert('Subject created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create subject');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTopicNumber.trim() || !selectedSubjectId) return;

    const topicNum = parseInt(newTopicNumber);
    if (isNaN(topicNum) || topicNum <= 0) {
      alert('Topic number must be a positive number');
      return;
    }

    setCreatingTopic(true);
    try {
      await adminApi.createTopic(
        selectedSubjectId,
        topicNum,
        newTopicName.trim(),
        login,
        password
      );
      setNewTopicName('');
      setNewTopicNumber('');
      await fetchTopics(selectedSubjectId);
      alert('Topic created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create topic');
    } finally {
      setCreatingTopic(false);
    }
  };

  if (loading) {
    return <Loading size="xl" text="Loading subjects..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Subjects Management</h1>
        <p className="text-gray-600">Manage subjects and their topics</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subjects Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Subjects ({subjects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubject} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    disabled={creating}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Plus />}
                    disabled={creating || !newSubjectName.trim()}
                    isLoading={creating}
                  >
                    Add
                  </Button>
                </div>
              </form>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {subjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No subjects yet. Create one!
                  </p>
                ) : (
                  subjects.map((subject) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSubjectId === subject.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-400 bg-white'
                      }`}
                      onClick={() => fetchTopics(subject.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{subject.name}</p>
                          <p className="text-sm text-gray-500">ID: {subject.id}</p>
                        </div>
                      </div>
                      <Badge variant="primary">View Topics</Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Topics {selectedSubjectId ? `(${topics.length})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSubjectId ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a subject to view topics</p>
                </div>
              ) : loadingTopics ? (
                <div className="py-12">
                  <Loading size="lg" text="Loading topics..." />
                </div>
              ) : (
                <>
                  <form onSubmit={handleCreateTopic} className="mb-6 space-y-3">
                    <Input
                      placeholder="Topic number (e.g., 1)"
                      type="number"
                      min="1"
                      value={newTopicNumber}
                      onChange={(e) => setNewTopicNumber(e.target.value)}
                      disabled={creatingTopic}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter topic name"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        disabled={creatingTopic}
                      />
                      <Button
                        type="submit"
                        variant="success"
                        leftIcon={<Plus />}
                        disabled={
                          creatingTopic ||
                          !newTopicName.trim() ||
                          !newTopicNumber.trim()
                        }
                        isLoading={creatingTopic}
                      >
                        Add
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {topics.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No topics for this subject yet
                      </p>
                    ) : (
                      topics
                        .sort((a, b) => a.topic_number - b.topic_number)
                        .map((topic, index) => (
                          <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="primary" size="lg">
                                {topic.topic_number}
                              </Badge>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {topic.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Topic ID: {topic.id}
                                </p>
                              </div>
                            </div>
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
