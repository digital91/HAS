module.exports = {
  apps: [{
    name: 'has-cinema-server',
    script: 'index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto restart
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '1G',
    
    // Advanced features
    min_uptime: '10s',
    max_restarts: 10,
    
    // Health monitoring
    health_check_grace_period: 3000,
    
    // Environment variables
    env_file: './config.env'
  }]
};
