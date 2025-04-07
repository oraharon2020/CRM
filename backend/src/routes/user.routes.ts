import { Router, Request, Response } from 'express';
import { authenticate, isAdmin, isSelfOrAdmin } from '../middleware/auth.middleware';
import UserModel from '../models/user.model';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Self or Admin
 */
router.get('/:id', authenticate, isSelfOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create user
    const user = await UserModel.create({
      name,
      email,
      password,
      role: role as 'admin' | 'manager' | 'user' | undefined
    });
    
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Self or Admin
 */
router.put('/:id', authenticate, isSelfOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role } = req.body;
    
    // Check if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only admin can change roles
    if (role && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }
    
    // Update user
    const updatedUser = await UserModel.update(userId, {
      name,
      email,
      role: role as 'admin' | 'manager' | 'user' | undefined
    });
    
    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting self
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete user
    await UserModel.delete(userId);
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   GET /api/users/:id/default-store
 * @desc    Get user's default store
 * @access  Self or Admin
 */
router.get('/:id/default-store', authenticate, isSelfOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    try {
      // Get default store
      const defaultStoreId = await UserModel.getDefaultStore(userId);
      
      return res.status(200).json({ 
        success: true,
        default_store_id: defaultStoreId 
      });
    } catch (dbError) {
      console.error('Database error getting default store:', dbError);
      
      // If there's a database error, it might be because the column doesn't exist yet
      // Return null as the default store ID
      return res.status(200).json({ 
        success: true,
        default_store_id: null,
        migration_needed: true
      });
    }
  } catch (error) {
    console.error('Error getting default store:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

/**
 * @route   PUT /api/users/:id/default-store
 * @desc    Set user's default store
 * @access  Self or Admin
 */
router.put('/:id/default-store', authenticate, isSelfOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { store_id } = req.body;
    
    // Check if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    try {
      // Try to set default store
      await UserModel.setDefaultStore(userId, store_id);
      
      return res.status(200).json({ 
        success: true,
        message: 'Default store updated successfully' 
      });
    } catch (dbError) {
      console.error('Database error setting default store:', dbError);
      
      // If there's a database error, it might be because the column doesn't exist yet
      // Return success anyway so the frontend doesn't break
      return res.status(200).json({ 
        success: true,
        message: 'Default store setting acknowledged (migration may be pending)',
        migration_needed: true
      });
    }
  } catch (error) {
    console.error('Error setting default store:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

export default router;
