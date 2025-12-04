import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import type { TestResultResponse } from '../../types';
import { CheckCircle, XCircle, Home, TrendingUp } from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/student');
      return;
    }

    const loadResult = async () => {
      try {
        const data = await testApi.getResult(parseInt(sessionId));
        setResult(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Natijani yuklashda xatolik');
        setLoading(false);
      }
    };

    loadResult();
  }, [sessionId]);

  const getResultColor = () => {
    if (!result) return 'text-gray-600';
    if (result.percentage >= 85) return 'text-green-600';
    if (result.percentage >= 70) return 'text-blue-600';
    if (result.percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResultBgColor = () => {
    if (!result) return 'bg-gray-50';
    if (result.percentage >= 85) return 'bg-green-50';
    if (result.percentage >= 70) return 'bg-blue-50';
    if (result.percentage >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getResultIcon = () => {
    if (!result) return null;
    if (result.percentage >= 50) {
      return <CheckCircle className="w-24 h-24 text-green-500" />;
    }
    return <XCircle className="w-24 h-24 text-red-500" />;
  };

  const getGrade = () => {
    if (!result) return '-';
    if (result.percentage >= 85) return '5';
    if (result.percentage >= 70) return '4';
    if (result.percentage >= 50) return '3';
    return '2';
  };

  const getResultMessage = () => {
    if (!result) return '';
    if (result.percentage >= 85) return 'A\'lo! Siz ajoyib natija ko\'rsatdingiz!';
    if (result.percentage >= 70) return 'Yaxshi! Ko\'p savolga to\'g\'ri javob berdingiz.';
    if (result.percentage >= 50) return 'Qoniqarli. Keyingi safar yaxshiroq tayyorlaning.';
    return 'Qoniqarsiz. Ko\'proq o\'rganishingiz kerak.';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Natijalar yuklanmoqda...</p>
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
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/student')}>Bosh sahifaga qaytish</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center">
          {/* Icon */}
          <div className="mb-6">{getResultIcon()}</div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test yakunlandi!</h1>
          <p className="text-gray-600 mb-8">{getResultMessage()}</p>

          {/* Score Display */}
          <div className={`${getResultBgColor()} rounded-2xl p-8 mb-8`}>
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-2">Sizning natijangiz</p>
              <div className={`text-7xl font-bold ${getResultColor()}`}>{result.percentage}%</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm mb-1">To'g'ri</p>
                <p className="text-2xl font-bold text-green-600">{result.correct_count}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Noto'g'ri</p>
                <p className="text-2xl font-bold text-red-600">
                  {result.total_count - result.correct_count}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Jami</p>
                <p className="text-2xl font-bold text-gray-800">{result.total_count}</p>
              </div>
            </div>
          </div>

          {/* Grade */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-8 py-4 shadow-lg">
              <span className="text-gray-600 font-semibold">Baho:</span>
              <span className={`text-5xl font-bold ${getResultColor()}`}>{getGrade()}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Muvaffaqiyat</span>
              </div>
              <p className={`text-3xl font-bold ${getResultColor()}`}>{result.percentage}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">To'g'ri javoblar</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {result.correct_count}/{result.total_count}
              </p>
            </div>
          </div>

          {/* Result Text */}
          {result.result_text && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-gray-700 text-lg">{result.result_text}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/student')} size="lg">
              <Home className="w-5 h-5 mr-2" />
              Bosh sahifaga qaytish
            </Button>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Natijalaringiz o'qituvchiga yuborildi. Tabriklaymiz!
          </p>
        </div>
      </div>
    </div>
  );
};
