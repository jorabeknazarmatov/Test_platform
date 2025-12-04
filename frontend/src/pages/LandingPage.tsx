import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Test Platform
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Professional testing system for educational institutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="glass" hover className="h-full">
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Student Portal
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Access your tests and view results
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/student')}
                >
                  Enter as Student
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card variant="glass" hover className="h-full">
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Admin Panel
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Manage tests, students, and results
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="success"
                  className="w-full"
                  onClick={() => navigate('/admin/login')}
                >
                  Admin Login
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-white/80">
            Powered by modern web technologies
          </p>
        </motion.div>
      </div>
    </div>
  );
};
