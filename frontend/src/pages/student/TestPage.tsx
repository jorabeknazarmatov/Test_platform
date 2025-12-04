import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api';
import { useTestStore } from '../../store/testStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const TestPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    setQuestions,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    setTimeRemaining,
    decrementTime,
  } = useTestStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchQuestions();
    }
  }, [sessionId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        decrementTime();
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && questions.length > 0) {
      handleFinish();
    }
  }, [timeRemaining]);

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const existingAnswer = answers.find((a) => a.questionId === currentQuestion.id);
      setSelectedAnswer(existingAnswer?.answer || '');
    }
  }, [currentQuestionIndex, questions, answers]);

  const fetchQuestions = async () => {
    try {
      const data = await testApi.getQuestions(parseInt(sessionId!));
      setQuestions(data);
      setTimeRemaining(30 * 60);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to load test');
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentQuestionIndex];
    submitAnswer(currentQuestion.id, answer);
  };

  const handleFinish = async () => {
    if (!confirm('Are you sure you want to finish the test?')) return;

    setSubmitting(true);
    try {
      await testApi.finishTest(parseInt(sessionId!));
      navigate(`/result/${sessionId}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loading size="xl" text="Loading test..." fullScreen />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card variant="gradient">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Test in Progress</h1>
              <p className="text-white/80">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Clock className="w-6 h-6" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-white/80">Time Remaining</p>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion?.text || 'Loading question...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion?.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option.text)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    selectedAnswer === option.text
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 bg-white hover:border-primary-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === option.text
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {selectedAnswer === option.text && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            leftIcon={<ChevronLeft />}
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Badge variant="primary" size="lg">
            {answers.length} / {questions.length} Answered
          </Badge>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="success"
              rightIcon={<CheckCircle />}
              onClick={handleFinish}
              isLoading={submitting}
            >
              Finish Test
            </Button>
          ) : (
            <Button
              variant="primary"
              rightIcon={<ChevronRight />}
              onClick={nextQuestion}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
