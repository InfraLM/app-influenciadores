const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: '7d',
  refreshTokenExpiresIn: '30d',
  bcryptSaltRounds: 10,
};

module.exports = { authConfig };
