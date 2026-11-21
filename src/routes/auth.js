const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const tokenFor = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })], validate, async (req, res, next) => {
  try { const user = await User.create(req.body); res.status(201).json({ token: tokenFor(user), user }); } catch (e) { next(e); }
});
router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], validate, async (req, res, next) => {
  try { const user = await User.findOne({ email: req.body.email }).select('+password'); if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: 'Invalid email or password.' }); res.json({ token: tokenFor(user), user: user.toJSON() }); } catch (e) { next(e); }
});
router.post('/logout', protect, (_req, res) => res.status(204).send());
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
router.patch('/me', protect, [body('name').optional().trim().notEmpty(), body('avatarUrl').optional().isURL()], validate, async (req, res, next) => {
  try { ['name', 'avatarUrl'].forEach((field) => { if (req.body[field] !== undefined) req.user[field] = req.body[field]; }); await req.user.save(); res.json({ user: req.user }); } catch (e) { next(e); }
});
module.exports = router;
