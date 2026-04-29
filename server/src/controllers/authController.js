import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signAccess(id)   { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }); }
function signRefresh(id)  { return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }); }

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
    
    const user = await User.create({ name, email, password });
    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();
    
    res.status(201).json({ success: true, accessToken, refreshToken, user });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    
    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();
    
    res.json({ success: true, accessToken, refreshToken, user });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function refreshTokens(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
    
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken))
      return res.status(403).json({ message: 'Invalid refresh token' });
    
    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const newAccess  = signAccess(user._id);
    const newRefresh = signRefresh(user._id);
    user.refreshTokens.push(newRefresh);
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();
    
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id).select('+refreshTokens');
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}
