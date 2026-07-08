export const healthService = {
  getStatus() {
    return {
      status: 'ok',
      service: 'placement-tracker-pro-api',
      timestamp: new Date().toISOString(),
    };
  },
};
