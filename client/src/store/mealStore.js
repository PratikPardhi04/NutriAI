import { create } from 'zustand';
import api from '../services/api';

const useMealStore = create((set, get) => ({
  meals: [],
  dailySummary: null,
  weeklyReport: null,
  loading: false,
  error: null,

  fetchTodayMeals: async () => {
    set({ loading: true });
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.get(`/meals?date=${today}`);
    set({ meals: data.data, loading: false });
  },

  fetchDailySummary: async (date) => {
    const d = date || new Date().toISOString().split('T')[0];
    const { data } = await api.get(`/meals/summary?date=${d}`);
    set({ dailySummary: data.data });
  },

  fetchWeeklyReport: async () => {
    const { data } = await api.get('/meals/weekly');
    set({ weeklyReport: data.data });
  },

  addMeal: (meal) => set(state => ({ meals: [meal, ...state.meals] })),

  deleteMeal: async (id) => {
    await api.delete(`/meals/${id}`);
    set(state => ({ meals: state.meals.filter(m => m._id !== id) }));
  }
}));

export default useMealStore;
