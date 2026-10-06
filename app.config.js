module.exports = ({ config }) => {
  const projectId = process.env.EAS_PROJECT_ID;
  const variant = process.env.EXPO_PUBLIC_APP_VARIANT ?? 'development';
  if (!projectId && ['staging', 'production'].includes(variant)) {
    throw new Error('EAS_PROJECT_ID must be configured for remote builds.');
  }
  return {
    ...config,
    extra: {
      ...config.extra,
      eas: projectId ? { projectId } : undefined,
    },
  };
};
