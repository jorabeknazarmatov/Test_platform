import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  groups: number;
  subjects: number;
  tests: number;
  results: number;
}

export const DashboardHome: React.FC = () => {
  const { login, password } = useAuthStore();
  const [stats, setStats] = useState<Stats>({ groups: 0, subjects: 0, tests: 0, results: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [groups, subjects, tests, results] = await Promise.all([
        adminApi.getGroups(login, password),
        adminApi.getSubjects(login, password),
        adminApi.getTests(login, password),
        adminApi.getResults(login, password),
      ]);

      setStats({
        groups: groups.length,
        subjects: subjects.length,
        tests: tests.length,
        results: results.length,
      });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="xl" text="Loading dashboard..." fullScreen />;
  }

  const statCards = [
    { label: 'Groups', value: stats.groups, icon: Users, color: 'from-blue-500 to-cyan-600' },
    { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'from-purple-500 to-pink-600' },
    { label: 'Tests', value: stats.tests, icon: FileText, color: 'from-green-500 to-emerald-600' },
    { label: 'Results', value: stats.results, icon: TrendingUp, color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card hover>
              <CardContent className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Use the sidebar to navigate to different sections:
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• <strong>Groups</strong> - Manage student groups and students</li>
              <li>• <strong>Subjects</strong> - Create subjects and topics</li>
              <li>• <strong>Tests</strong> - Create and manage tests</li>
              <li>• <strong>Results</strong> - View and export test results</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
