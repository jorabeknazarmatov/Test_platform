import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api';
import { useTestStore } from '../../store/testStore';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export const TestPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    setSession,
    setQuestions,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    setTimeRemaining,
    decrementTime,
    startTest,
    endTest,
    reset,
  } = useTestStore();

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.question_id === currentQuestion?.id);

  useEffect(() => {
    if (!sessionId) {
      navigate('/student');
      return;
    }

    const loadTest = async () => {
      try {
        const session = await testApi.getSession(parseInt(sessionId));
        const testQuestions = await testApi.getQuestions(parseInt(sessionId));

        setSession(parseInt(sessionId), session.test_id);
        setQuestions(testQuestions);

        // Calculate time remaining
        if (session.started_at) {
          const startTime = new Date(session.started_at).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          // Assuming duration is in session or we get it from test
          // For now, let's set a default of 60 minutes
          const totalSeconds = 60 * 60; // You should get this from the test duration
          const remaining = Math.max(0, totalSeconds - elapsed);
          setTimeRemaining(remaining);
        } else {
          // Test not started yet, set full duration
          setTimeRemaining(60 * 60); // 60 minutes default
        }

        startTest();
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Test yuklashda xatolik');
        setLoading(false);
      }
    };

    loadTest();

    return () => {
      endTest();
    };
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (!loading && timeRemaining > 0) {
      const timer = setInterval(() => {
        decrementTime();
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !loading) {
      handleFinishTest();
    }
  }, [timeRemaining, loading]);

  const handleAnswerSelect = async (answer: string) => {
    if (!currentQuestion || !sessionId) return;

    submitAnswer(currentQuestion.id, answer);

    // Auto-save answer to backend
    try {
      await testApi.submitAnswer(parseInt(sessionId), currentQuestion.id, answer);
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleFinishTest = async () => {
    if (!sessionId || submitting) return;

    const confirmed = window.confirm('Testni yakunlamoqchimisiz?');
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await testApi.finishTest(parseInt(sessionId));
      reset();
      navigate(`/student/result/${sessionId}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Testni yakunlashda xatolik');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 600) return 'text-green-600';
    if (timeRemaining > 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Test yuklanmoqda...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/student')}>Orqaga qaytish</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Savollar topilmadi</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Test</h1>
              <p className="text-sm text-gray-600">
                Savol {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${getTimeColor()}`}>
                <Clock className="w-6 h-6" />
                {formatTime(timeRemaining)}
              </div>
              <Button variant="danger" onClick={handleFinishTest} disabled={submitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Yakunlash
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-lg flex-shrink-0">
                {currentQuestionIndex + 1}
              </span>
              <p className="text-lg text-gray-800 flex-1 pt-1">{currentQuestion.text}</p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = currentAnswer?.answer === optionLetter;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(optionLetter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="flex-1 pt-1 text-gray-800">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Oldingi
            </Button>

            <div className="text-sm text-gray-600">
              Javob berilgan: {answers.length} / {questions.length}
            </div>

            <Button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Keyingi
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Question Grid */}
        <Card className="max-w-4xl mx-auto mt-6">
          <h3 className="font-semibold mb-4">Savollar ro'yxati</h3>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {questions.map((question, index) => {
              const hasAnswer = answers.some((a) => a.question_id === question.id);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    const diff = index - currentQuestionIndex;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) nextQuestion();
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) previousQuestion();
                    }
                  }}
                  className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white scale-110'
                      : hasAnswer
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
