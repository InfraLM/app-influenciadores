const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, pool } = require('../config/database');
const { authConfig } = require('../config/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Find user (tabela inf_users)
    const result = await query(
      'SELECT * FROM inf_users WHERE email = $1',
      [email]
    );

    console.log('User query result:', { found: result.rows.length > 0 });

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, hasEncryptedPassword: !!user.encrypted_password });

    // Verify password
    console.log('Comparing passwords...', {
      providedPassword: password,
      storedHash: user.encrypted_password?.substring(0, 20) + '...'
    });
    const isValidPassword = await bcrypt.compare(password, user.encrypted_password);
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('Password valid, fetching user details...');

    // Get user role and profile
    const [roleResult, profileResult, influencerResult] = await Promise.all([
      query('SELECT role FROM inf_user_roles WHERE user_id = $1', [user.id]),
      query('SELECT * FROM inf_profiles WHERE user_id = $1', [user.id]),
      query('SELECT id FROM inf_influencers WHERE user_id = $1', [user.id]),
    ]);

    const role = roleResult.rows[0]?.role || 'influencer';
    const profile = profileResult.rows[0];
    const influencerId = influencerResult.rows[0]?.id;

    console.log('User details fetched:', { role, hasProfile: !!profile, influencerId });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    console.log('Token generated successfully');

    const response = {
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        access_token: token,
      },
      profile,
      role,
      influencerId,
    };

    console.log('Sending success response');
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

const signup = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    // Begin transaction
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM inf_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds);
    const userId = uuidv4();

    // Create user
    await client.query(`
      INSERT INTO inf_users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
      VALUES ($1, $2, $3, NOW(), NOW(), NOW(), $4)
    `, [userId, email, hashedPassword, JSON.stringify({ name })]);

    // Create profile (manually, since no trigger)
    await client.query(`
      INSERT INTO inf_profiles (user_id, name, email, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'active', NOW(), NOW())
    `, [userId, name, email]);

    // Create user role (default: influencer)
    await client.query(`
      INSERT INTO inf_user_roles (user_id, role)
      VALUES ($1, 'influencer')
    `, [userId]);

    // Commit transaction
    await client.query('COMMIT');

    // Get created profile and role
    const [profileResult, roleResult] = await Promise.all([
      query('SELECT * FROM inf_profiles WHERE user_id = $1', [userId]),
      query('SELECT role FROM inf_user_roles WHERE user_id = $1', [userId]),
    ]);

    const profile = profileResult.rows[0];
    const role = roleResult.rows[0]?.role || 'influencer';

    // Generate token
    const token = jwt.sign(
      { userId },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    res.status(201).json({
      user: {
        id: userId,
        email,
      },
      session: {
        access_token: token,
      },
      profile,
      role,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    client.release();
  }
};

const adminCreateUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, name, role = 'influencer', influencerId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    await client.query('BEGIN');

    const existingUser = await client.query('SELECT id FROM inf_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Já existe um usuário com este e-mail' });
    }

    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds);
    const userId = uuidv4();

    await client.query(`
      INSERT INTO inf_users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
      VALUES ($1, $2, $3, NOW(), NOW(), NOW(), $4)
    `, [userId, email, hashedPassword, JSON.stringify({ name })]);

    await client.query(`
      INSERT INTO inf_profiles (user_id, name, email, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'active', NOW(), NOW())
    `, [userId, name, email]);

    await client.query(`
      INSERT INTO inf_user_roles (user_id, role) VALUES ($1, $2)
    `, [userId, role]);

    if (influencerId) {
      await client.query(
        `UPDATE inf_influencers SET user_id = $1, updated_at = NOW() WHERE id = $2`,
        [userId, influencerId]
      );
    }

    await client.query('COMMIT');

    const profileResult = await query('SELECT * FROM inf_profiles WHERE user_id = $1', [userId]);
    res.status(201).json({ user: { id: userId, email }, profile: profileResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Admin create user error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  } finally {
    client.release();
  }
};

const createInviteWithEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, name, role = 'influencer', influencerId, expiresInDays = 7 } = req.body;

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    const inviteId = uuidv4();

    await client.query(`
      INSERT INTO inf_invites (id, token, email, name, role, influencer_id, status, created_by, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW(), $8)
    `, [inviteId, token, email || null, name || null, role, influencerId || null, req.user.id, expiresAt.toISOString()]);

    await client.query('COMMIT');

    // Send email if SMTP is configured
    if (email && process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        const appUrl = process.env.APP_URL || 'https://influenciadores.lmedu.com.br';
        const inviteLink = `${appUrl}/aceitar-convite?token=${token}`;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Convite para a plataforma',
          html: `<p>Olá${name ? ` ${name}` : ''}!</p><p>Você foi convidado para acessar a plataforma. Clique no link abaixo para criar sua conta:</p><p><a href="${inviteLink}">${inviteLink}</a></p><p>Este link é válido por ${expiresInDays} dia(s).</p>`,
        });
        console.log('Invite email sent to:', email);
      } catch (emailError) {
        console.error('Email send error (invite still created):', emailError.message);
      }
    }

    const inviteResult = await query('SELECT * FROM inf_invites WHERE id = $1', [inviteId]);
    res.status(201).json({ invite: inviteResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create invite error:', error);
    res.status(500).json({ error: 'Erro ao criar convite' });
  } finally {
    client.release();
  }
};

const revokeInvite = async (req, res) => {
  try {
    const { inviteId } = req.body;
    if (!inviteId) return res.status(400).json({ error: 'inviteId é obrigatório' });
    await query(`UPDATE inf_invites SET status = 'revoked' WHERE id = $1`, [inviteId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Revoke invite error:', error);
    res.status(500).json({ error: 'Erro ao revogar convite' });
  }
};

const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logout realizado com sucesso' });
};

const getSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const [profileResult, influencerResult] = await Promise.all([
      query('SELECT * FROM inf_profiles WHERE user_id = $1', [req.user.id]),
      query('SELECT id FROM inf_influencers WHERE user_id = $1', [req.user.id]),
    ]);

    const profile = profileResult.rows[0];
    const influencerId = influencerResult.rows[0]?.id;

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      profile,
      role: req.user.role,
      influencerId,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

module.exports = { login, signup, logout, getSession, adminCreateUser, createInviteWithEmail, revokeInvite };
