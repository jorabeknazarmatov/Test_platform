'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { testApi } from '@/lib/api';

export default function OTPPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Student ma'lumotlarini olish
    const name = localStorage.getItem('studentName');
    if (!name) {
      router.push('/student');
      return;
    }
    setStudentName(name);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await testApi.verifyOTP(parseInt(sessionId), otp);

      if (response.data.success) {
        // Session ID ni saqlash
        localStorage.setItem('testSessionId', sessionId);
        router.push('/student/test');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Juda ko\'p urinish. Keyinroq qayta urinib ko\'ring.');
      } else if (err.response?.status === 401) {
        setError('OTP noto\'g\'ri yoki vaqti o\'tgan');
      } else {
        setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">OTP kiritish</h1>
          <p className="text-gray-600">Xush kelibsiz, {studentName}!</p>
          <p className="text-sm text-gray-500 mt-2">
            O'qituvchidan olgan OTP kodingizni kiriting
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Test sessiyasiga kirish</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Session ID"
                type="number"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Session ID ni kiriting"
                required
              />

              <Input
                label="OTP kod"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP kodni kiriting"
                required
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Testni boshlash
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <a href="/student" className="text-blue-500 hover:text-blue-600 text-sm">
            ← Orqaga qaytish
          </a>
        </div>
      </motion.div>
    </div>
  );
}
