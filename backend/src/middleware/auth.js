const jwt = require('jsonwebtoken');
const { authConfig } = require('../config/auth');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);

    // Get user data including role and influencer_id (tabelas com prefixo inf_)
    const result = await query(`
      SELECT
        u.id,
        u.email,
        ur.role,
        i.id as influencer_id
      FROM inf_users u
      LEFT JOIN inf_user_roles ur ON u.id = ur.user_id
      LEFT JOIN inf_influencers i ON u.id = i.user_id
      WHERE u.id = $1
    `, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'influencer',
      influencerId: user.influencer_id,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin']);

module.exports = { authenticateToken, requireRole, requireAdmin };
