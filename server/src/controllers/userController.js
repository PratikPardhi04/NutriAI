import User from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const updates = { ...req.body };
    const setUpdates = {};
    
    // Flatten targets to prevent overwriting missing defaults
    if (updates.targets) {
      for (const key in updates.targets) {
        setUpdates[`targets.${key}`] = updates.targets[key];
      }
      delete updates.targets;
    }
    
    // Merge back other updates
    Object.assign(setUpdates, updates);

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { $set: setUpdates }, 
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}
