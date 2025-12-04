import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import type { Group } from '../../types';
import { Trash2, Plus } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, password } = useAuthStore();

  const fetchGroups = async () => {
    try {
      const data = await adminApi.getGroups(login, password);
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createGroup(newGroupName, login, password);
      setNewGroupName('');
      fetchGroups();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Guruhni o\'chirmoqchimisiz?')) return;
    try {
      await adminApi.deleteGroup(id, login, password);
      fetchGroups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Guruhlar</h1>

      <Card className="mb-6">
        <form onSubmit={handleCreate} className="flex gap-4">
          <Input
            placeholder="Guruh nomi"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Qo'shish
          </Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{group.name}</h3>
                <p className="text-gray-600 text-sm">
                  {group.students?.length || 0} ta o'quvchi
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDelete(group.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
