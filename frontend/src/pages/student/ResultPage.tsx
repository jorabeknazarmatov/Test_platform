import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api';
import type { TestResultResponse } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Trophy, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResultPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      const data = await testApi.getResult(parseInt(sessionId!));
      setResult(data);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to load result');
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="xl" text="Loading result..." fullScreen />;
  }

  if (!result) {
    return null;
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 80) return { text: 'Excellent!', color: 'from-green-500 to-emerald-600' };
    if (percentage >= 60) return { text: 'Good!', color: 'from-blue-500 to-cyan-600' };
    if (percentage >= 40) return { text: 'Pass', color: 'from-yellow-500 to-orange-600' };
    return { text: 'Need Improvement', color: 'from-red-500 to-rose-600' };
  };

  const grade = getGrade(result.percentage);

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glass">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-4xl">Test Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${grade.color} text-white shadow-xl mb-4`}>
                  <p className="text-5xl font-bold">{result.percentage.toFixed(1)}%</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">{grade.text}</p>
                <p className="text-lg text-gray-600">{result.result_text}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card variant="default">
                  <CardContent className="text-center py-6">
                    <p className="text-3xl font-bold text-green-600">
                      {result.correct_count}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Correct Answers</p>
                  </CardContent>
                </Card>
                <Card variant="default">
                  <CardContent className="text-center py-6">
                    <p className="text-3xl font-bold text-gray-900">
                      {result.total_count}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Total Questions</p>
                  </CardContent>
                </Card>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<Home />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
