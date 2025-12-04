import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/student.api';
import { testApi } from '../../api/test.api';
import type { Group, Student } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { ArrowLeft, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchStudents(parseInt(selectedGroupId));
    } else {
      setStudents([]);
      setSelectedStudentId('');
    }
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    try {
      const data = await studentApi.getGroups();
      setGroups(data);
    } catch (error: any) {
      alert('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (groupId: number) => {
    try {
      const data = await studentApi.getStudentsByGroup(groupId);
      setStudents(data);
    } catch (error: any) {
      alert('Failed to fetch students');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim() || !otp.trim()) {
      alert('Please enter both Session ID and OTP');
      return;
    }

    setVerifying(true);
    try {
      const result = await testApi.verifyOTP(parseInt(sessionId), otp.trim());
      if (result.success) {
        navigate(`/test/${sessionId}`);
      } else {
        alert('Invalid OTP or Session ID');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <Loading size="xl" text="Loading..." fullScreen />;
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="mb-6 text-white hover:bg-white/10"
          >
            Back to Home
          </Button>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-center text-3xl">Student Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Group
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
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
                    Select Your Name
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={!selectedGroupId}
                  >
                    <option value="">Select your name</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Session ID"
                  type="number"
                  placeholder="Enter session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  disabled={verifying}
                  required
                />

                <Input
                  label="OTP"
                  type="text"
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={verifying}
                  required
                />

                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="w-full"
                  leftIcon={<LogIn />}
                  isLoading={verifying}
                >
                  Start Test
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
