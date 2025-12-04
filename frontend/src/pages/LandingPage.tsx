import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { User, GraduationCap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Test Platformasi
          </h1>
          <p className="text-lg text-gray-600">
            Kollej o'quvchilari uchun online test tizimi
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/admin/login')}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin</h2>
              <p className="text-gray-600">
                Guruhlar, testlar va natijalarni boshqarish
              </p>
              <Button variant="primary" className="w-full">
                Admin panelga kirish
              </Button>
            </div>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/student')}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 p-4 rounded-full">
                <GraduationCap className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">O'quvchi</h2>
              <p className="text-gray-600">
                Test topshirish va natijalarni ko'rish
              </p>
              <Button variant="success" className="w-full">
                Test topshirish
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
