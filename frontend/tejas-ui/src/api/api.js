import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getKpis = () => api.get('/dashboard/kpis');
export const getDispatchRecommendation = () => api.get('/orchestration/dispatch/recommendation');
export const executeDispatch = (id) => api.patch(`/orchestration/dispatch/events/${id}/execute`);
export const triggerDemoScenario = (scenario) => api.post(`/demo/scenario/${scenario}`);
export const getLeaderboard = () => api.get('/gamification/leaderboard');
export const getRewards = () => api.get('/gamification/rewards');
export const getExecutiveMetrics = () => api.get('/gamification/metrics/executive');

export default api;
