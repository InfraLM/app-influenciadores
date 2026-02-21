const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');
const influencersController = require('../controllers/influencersController');
const contentsController = require('../controllers/contentsController');
const { createGenericController } = require('../controllers/genericController');

const router = express.Router();

// Auth routes (public)
router.post('/auth/login', authController.login);
router.post('/auth/signup', authController.signup);
router.post('/auth/logout', authController.logout);
router.get('/auth/session', authenticateToken, authController.getSession);

// Influencers routes
router.get('/influencers', authenticateToken, influencersController.getInfluencers);
router.get('/influencers/:id', authenticateToken, influencersController.getInfluencer);
router.post('/influencers', authenticateToken, requireAdmin, influencersController.createInfluencer);
router.put('/influencers/:id', authenticateToken, influencersController.updateInfluencer);
router.delete('/influencers/:id', authenticateToken, requireAdmin, influencersController.deleteInfluencer);

// Contents routes
router.get('/contents', authenticateToken, contentsController.getContents);
router.post('/contents', authenticateToken, contentsController.createContent);
router.put('/contents/:id', authenticateToken, contentsController.updateContent);
router.delete('/contents/:id', authenticateToken, contentsController.deleteContent);

// Generic routes for other tables (com prefixo inf_)
const performanceController = createGenericController('inf_performance_evaluations');
router.get('/performance-evaluations', authenticateToken, performanceController.getAll);
router.get('/performance-evaluations/:id', authenticateToken, performanceController.getById);
router.post('/performance-evaluations', authenticateToken, requireAdmin, performanceController.create);
router.put('/performance-evaluations/:id', authenticateToken, requireAdmin, performanceController.update);
router.delete('/performance-evaluations/:id', authenticateToken, requireAdmin, performanceController.delete);

const documentsController = createGenericController('inf_documents');
router.get('/documents', authenticateToken, documentsController.getAll);
router.get('/documents/:id', authenticateToken, documentsController.getById);
router.post('/documents', authenticateToken, requireAdmin, documentsController.create);
router.put('/documents/:id', authenticateToken, requireAdmin, documentsController.update);
router.delete('/documents/:id', authenticateToken, requireAdmin, documentsController.delete);

const monthlyGoalsController = createGenericController('inf_monthly_goals');
router.get('/monthly-goals', authenticateToken, monthlyGoalsController.getAll);
router.get('/monthly-goals/:id', authenticateToken, monthlyGoalsController.getById);
router.post('/monthly-goals', authenticateToken, requireAdmin, monthlyGoalsController.create);
router.put('/monthly-goals/:id', authenticateToken, requireAdmin, monthlyGoalsController.update);
router.delete('/monthly-goals/:id', authenticateToken, requireAdmin, monthlyGoalsController.delete);

const prospectsController = createGenericController('inf_prospect_cards');
router.get('/prospects', authenticateToken, prospectsController.getAll);
router.get('/prospects/:id', authenticateToken, prospectsController.getById);
router.post('/prospects', authenticateToken, prospectsController.create);
router.put('/prospects/:id', authenticateToken, prospectsController.update);
router.delete('/prospects/:id', authenticateToken, prospectsController.delete);

const prospectCommentsController = createGenericController('inf_prospect_comments');
router.get('/prospect-comments', authenticateToken, prospectCommentsController.getAll);
router.post('/prospect-comments', authenticateToken, prospectCommentsController.create);

const invitesController = createGenericController('inf_invites');
router.get('/invites', authenticateToken, requireAdmin, invitesController.getAll);
router.get('/invites/:id', authenticateToken, invitesController.getById);
router.post('/invites', authenticateToken, requireAdmin, invitesController.create);
router.put('/invites/:id', authenticateToken, requireAdmin, invitesController.update);
router.delete('/invites/:id', authenticateToken, requireAdmin, invitesController.delete);

const profilesController = createGenericController('inf_profiles');
router.get('/profiles', authenticateToken, requireAdmin, profilesController.getAll);
router.get('/profiles/:id', authenticateToken, profilesController.getById);
router.put('/profiles/:id', authenticateToken, profilesController.update);

const userRolesController = createGenericController('inf_user_roles');
router.get('/user-roles', authenticateToken, requireAdmin, userRolesController.getAll);
router.put('/user-roles/:id', authenticateToken, requireAdmin, userRolesController.update);

// Aliases with underscore for compatibility (frontend uses underscore)
router.get('/performance_evaluations', authenticateToken, performanceController.getAll);
router.get('/performance_evaluations/:id', authenticateToken, performanceController.getById);
router.post('/performance_evaluations', authenticateToken, requireAdmin, performanceController.create);
router.put('/performance_evaluations/:id', authenticateToken, requireAdmin, performanceController.update);
router.delete('/performance_evaluations/:id', authenticateToken, requireAdmin, performanceController.delete);

router.get('/monthly_goals', authenticateToken, monthlyGoalsController.getAll);
router.get('/monthly_goals/:id', authenticateToken, monthlyGoalsController.getById);
router.post('/monthly_goals', authenticateToken, requireAdmin, monthlyGoalsController.create);
router.put('/monthly_goals/:id', authenticateToken, requireAdmin, monthlyGoalsController.update);
router.delete('/monthly_goals/:id', authenticateToken, requireAdmin, monthlyGoalsController.delete);

router.get('/user_roles', authenticateToken, requireAdmin, userRolesController.getAll);
router.put('/user_roles/:id', authenticateToken, requireAdmin, userRolesController.update);

module.exports = router;
