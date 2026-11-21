const router = require('express').Router();
const { body, param } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const { requireTeamMember } = require('../utils/access');
router.use(protect);

router.get('/', async (req, res, next) => { try { res.json({ teams: await Team.find({ 'members.user': req.user.id }).populate('owner', 'name email').sort('-createdAt') }); } catch (e) { next(e); } });
router.post('/', [body('name').trim().notEmpty(), body('description').optional().trim()], validate, async (req, res, next) => {
  try { const team = await Team.create({ name: req.body.name, description: req.body.description, owner: req.user.id, members: [{ user: req.user.id, role: 'owner' }] }); res.status(201).json({ team }); } catch (e) { next(e); }
});
router.get('/:teamId', [param('teamId').isMongoId()], validate, async (req, res, next) => { try { const result = await requireTeamMember(req.params.teamId, req.user.id); if (result.error) return res.status(result.error === 'Team not found.' ? 404 : 403).json({ message: result.error }); await result.team.populate('members.user', 'name email avatarUrl'); res.json({ team: result.team }); } catch (e) { next(e); } });
router.post('/:teamId/members', [param('teamId').isMongoId(), body('email').isEmail().normalizeEmail()], validate, async (req, res, next) => {
  try { const result = await requireTeamMember(req.params.teamId, req.user.id); if (result.error) return res.status(403).json({ message: result.error }); if (result.membership.role !== 'owner') return res.status(403).json({ message: 'Only team owners can add members.' }); const user = await User.findOne({ email: req.body.email }); if (!user) return res.status(404).json({ message: 'No user found with that email.' }); if (result.team.members.some((m) => m.user.equals(user.id))) return res.status(409).json({ message: 'User is already in this team.' }); result.team.members.push({ user: user.id }); await result.team.save(); res.status(201).json({ team: result.team }); } catch (e) { next(e); }
});
router.delete('/:teamId/members/:userId', [param('teamId').isMongoId(), param('userId').isMongoId()], validate, async (req, res, next) => {
  try { const result = await requireTeamMember(req.params.teamId, req.user.id); if (result.error) return res.status(403).json({ message: result.error }); if (result.membership.role !== 'owner') return res.status(403).json({ message: 'Only team owners can remove members.' }); if (result.team.owner.equals(req.params.userId)) return res.status(400).json({ message: 'The team owner cannot be removed.' }); result.team.members = result.team.members.filter((m) => !m.user.equals(req.params.userId)); await result.team.save(); await Task.updateMany({ team: result.team.id, assignee: req.params.userId }, { $set: { assignee: null } }); res.status(204).send(); } catch (e) { next(e); }
});
module.exports = router;
