'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Admin kredensiallarni localStorage ga saqlash
      localStorage.setItem('adminLogin', login);
      localStorage.setItem('adminPassword', password);

      // Dashboard ga yo'naltirish
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Kirish xatolik yuz berdi');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Tizimga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Kirish</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Login ni kiriting"
                required
              />

              <Input
                label="Parol"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                required
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Kirish
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-500 hover:text-blue-600 text-sm">
            ← Bosh sahifaga qaytish
          </a>
        </div>
      </motion.div>
    </div>
  );
}
