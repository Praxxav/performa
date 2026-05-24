import { Router } from 'express';
const router = Router();
import multer, { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../middleware/verifyToken.js';
import { User } from "../models/user.model.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// @route   GET api/settings
// @desc    Get user settings
// @access  Private
router.get('/user-settings', verifyToken, async (req, res) => {
  try {
    // Get user from database by id and exclude password
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return user settings
    res.json({
      businessName: user.businessName || '',
      email: user.email || '',
      city: user.city || '',
      country: user.country || '',
      state: user.state || '',
      phoneNumber: user.phoneNumber || '',
      logoUrl: user.logoUrl || ''
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings
// @desc    Update user settings
// @access  Private
router.put('/user-settings', verifyToken, async (req, res) => {
  const {
    businessName,
    email,
    city,
    country,
    state,
    phoneNumber,
    logoUrl
  } = req.body;

  // Build settings object
  const settingsFields = {};
  if (businessName) settingsFields.businessName = businessName;
  if (email) settingsFields.email = email;
  if (city) settingsFields.city = city;
  if (country) settingsFields.country = country;
  if (state) settingsFields.state = state;
  if (phoneNumber) settingsFields.phoneNumber = phoneNumber;
  if (logoUrl !== undefined) settingsFields.logoUrl = logoUrl;

  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: settingsFields },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/upload-logo
// @desc    Upload logo to Cloudinary
// @access  Private
router.post('/upload-logo', [verifyToken, upload.single('logo')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Convert buffer to base64
    const fileStr = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype;
    
    // Format for Cloudinary upload
    const fileUri = `data:${fileType};base64,${fileStr}`;
    
    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      folder: 'business_logos',
      public_id: `user_${req.user.id}_logo_${Date.now()}`,
      overwrite: true
    });
    
    // Update user with new logo URL
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { logoUrl: uploadResponse.secure_url } }
    );
    
    res.json({
      logoUrl: uploadResponse.secure_url
    });
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

// @route   POST api/settings/soft-delete
// @desc    Perform a soft delete on the user account
// @access  Private
router.patch('/soft-delete', async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({ message: "Soft delete successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;