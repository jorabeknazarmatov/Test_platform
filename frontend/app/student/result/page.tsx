'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { testApi } from '@/lib/api';
import type { Result } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sid = localStorage.getItem('testSessionId');
    const name = localStorage.getItem('studentName');

    if (!sid || !name) {
      router.push('/student');
      return;
    }

    setStudentName(name);
    loadResult(parseInt(sid));
  }, [router]);

  const loadResult = async (sessionId: number) => {
    try {
      const response = await testApi.getResult(sessionId);
      setResult(response.data);
    } catch (err) {
      setError('Natijani yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Local storage ni tozalash
    localStorage.removeItem('testSessionId');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');

    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loading text="Natija hisoblanmoqda..." />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md">
          <CardBody>
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg">{error || 'Natija topilmadi'}</p>
              <Button onClick={handleFinish} className="mt-4">
                Bosh sahifaga
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { text: 'A\'lo', color: 'text-green-600', emoji: '🌟' };
    if (percentage >= 80) return { text: 'Yaxshi', color: 'text-blue-600', emoji: '👍' };
    if (percentage >= 70) return { text: 'Qoniqarli', color: 'text-yellow-600', emoji: '😊' };
    if (percentage >= 60) return { text: 'O\'rtacha', color: 'text-orange-600', emoji: '😐' };
    return { text: 'Qoniqarsiz', color: 'text-red-600', emoji: '😔' };
  };

  const grade = getGrade(result.percentage);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-8xl mb-4"
          >
            {grade.emoji}
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test yakunlandi!</h1>
          <p className="text-gray-600">Natijangiz tayyor</p>
        </div>

        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-600 mb-2">Salom, {studentName}</p>
            <h2 className={`text-5xl font-bold mb-6 ${grade.color}`}>{grade.text}</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">To'g'ri javoblar</p>
                <p className="text-3xl font-bold text-green-600">{result.correct_count}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Jami savollar</p>
                <p className="text-3xl font-bold text-gray-900">{result.total_count}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Foiz</p>
                <p className="text-3xl font-bold text-blue-600">{result.percentage.toFixed(1)}%</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                  className={`h-4 rounded-full ${
                    result.percentage >= 80
                      ? 'bg-green-500'
                      : result.percentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <Button onClick={handleFinish} size="lg">
              Bosh sahifaga qaytish
            </Button>
          </CardBody>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Natijalaringiz tizimda saqlandi.</p>
          <p>Rahmat! 🙏</p>
        </div>
      </motion.div>
    </div>
  );
}
