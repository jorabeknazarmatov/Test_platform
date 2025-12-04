import axiosInstance from './axios';
import type { Group, Student, Subject } from '../types';

const API_PREFIX = '/api/student';

export const studentApi = {
  getGroups: async () => {
    const response = await axiosInstance.get<Group[]>(`${API_PREFIX}/groups`);
    return response.data;
  },

  getStudentsByGroup: async (groupId: number) => {
    const response = await axiosInstance.get<Student[]>(
      `${API_PREFIX}/groups/${groupId}/students`
    );
    return response.data;
  },

  getSubjects: async () => {
    const response = await axiosInstance.get<Subject[]>(
      `${API_PREFIX}/subjects`
    );
    return response.data;
  },
};
