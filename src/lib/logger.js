function log(level, message, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...details,
  };

  const serialized = JSON.stringify(payload);
  if (level === 'error') {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

export function createLogger(job) {
  return {
    info(message, details) {
      log('info', message, { job, ...details });
    },
    warn(message, details) {
      log('warn', message, { job, ...details });
    },
    error(message, details) {
      log('error', message, { job, ...details });
    },
  };
}
