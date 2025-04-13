import express, { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { settingsService, StatusSettings } from '../services/settings.service';

const router: Router = Router();

// Get status settings
router.get('/statuses', authenticate, async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getStatusSettings();
    
    res.status(200).json({
      success: true,
      message: 'Status settings retrieved successfully',
      settings
    });
  } catch (error: any) {
    console.error('Error retrieving status settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve status settings',
      error: error.message || 'Unknown error'
    });
  }
});

// Save status settings
router.post('/statuses', authenticate, async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    
    // Validate input
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }
    
    // Validate the structure of the settings object
    if (!settings.included_statuses || typeof settings.included_statuses !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings structure'
      });
    }
    
    // Save the settings
    const success = await settingsService.saveStatusSettings(settings as StatusSettings);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Status settings saved successfully',
        settings
      });
    } else {
      throw new Error('Failed to save status settings');
    }
  } catch (error: any) {
    console.error('Error saving status settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save status settings',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;
