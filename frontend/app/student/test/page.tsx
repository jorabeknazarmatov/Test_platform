'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { testApi } from '@/lib/api';
import type { Question } from '@/types';

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sid = localStorage.getItem('testSessionId');
    const name = localStorage.getItem('studentName');

    if (!sid || !name) {
      router.push('/student');
      return;
    }

    setSessionId(parseInt(sid));
    setStudentName(name);
    loadQuestions(parseInt(sid));
  }, [router]);

  const loadQuestions = async (sid: number) => {
    try {
      const response = await testApi.getQuestions(sid);
      setQuestions(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Sessiya faol emas. OTP qayta kiriting.');
        setTimeout(() => router.push('/student/otp'), 2000);
      } else {
        setError('Savollarni yuklashda xatolik');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (optionId: number) => {
    if (!questions[currentQuestionIndex]) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentQuestionIndex].id]: optionId.toString(),
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;

    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!confirm('Barcha savollarga javob bermaganmisiz. Testni yakunlashni xohlaysizmi?')) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Barcha javoblarni yuborish
      for (const [questionId, answer] of Object.entries(selectedAnswers)) {
        await testApi.submitAnswer(sessionId, parseInt(questionId), answer);
      }

      // Testni yakunlash
      await testApi.finishTest(sessionId);

      // Natija sahifasiga o'tish
      router.push('/student/result');
    } catch (err) {
      setError('Testni yakunlashda xatolik');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loading text="Test yuklanmoqda..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md">
          <CardBody>
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md">
          <CardBody>
            <p className="text-gray-600 text-center">Savollar topilmadi</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test</h1>
          <p className="text-gray-600">{studentName}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Savol {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Object.keys(selectedAnswers).length} ta javob berilgan
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestion.text}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    selectedAnswers[currentQuestion.id] === option.id.toString();

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-gray-900">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Orqaga
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleFinish} isLoading={isSubmitting}>
              Testni yakunlash
            </Button>
          ) : (
            <Button onClick={handleNext}>Keyingi →</Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardBody>
            <p className="text-sm text-gray-600 mb-3">Savollarga o'tish:</p>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-blue-500 text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
