import { Request, Response, NextFunction } from 'express';
import adminService from '../services/admin.service';
import { logLevels } from '../services/logger';

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      isAdmin?: boolean;
    }
  }
}

/**
 * Middleware to extract and validate user ID from request
 * Can extract from headers, params, or body depending on configuration
 */
export const extractUserId = (source: 'header' | 'param' | 'body' = 'header') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    let userId: string | undefined;

    // Extract userId based on source
    switch (source) {
      case 'header':
        userId = req.headers['userID'] as string;
        break;
      case 'param':
        userId = req.params['userID'] || req.params.userId;
        break;
      case 'body':
        userId = req.body.userID;
        break;
    }

    logLevels.debug(`Extracting userId from ${source}`, { userId, endpoint: req.path });

    if (!userId) {
      logLevels.warn(`Missing user ID in ${source}`, { 
        endpoint: req.path, 
        method: req.method,
        ip: req.ip 
      });
      
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Attach userId to request object for downstream middleware/routes
    req.userId = userId;
    logLevels.debug(`User ID extracted successfully`, { userId, endpoint: req.path });
    
    next();
  };
};

/**
 * Middleware to verify if the user is an admin
 * Requires userId to be already extracted and attached to req.userId
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      logLevels.error('Admin verification attempted without userId', { endpoint: req.path });
      res.status(500).json({
        success: false,
        message: 'Internal error: User ID not found'
      });
      return;
    }

    logLevels.debug(`Verifying admin privileges for user`, { userId, endpoint: req.path });

    // Verify admin access
    const isAdmin = await adminService.verifyAdminUser(userId);
    
    logLevels.debug(`Admin verification result`, { userId, isAdmin, endpoint: req.path });

    if (!isAdmin) {
      logLevels.warn(`Unauthorized admin access attempt`, { 
        userId, 
        endpoint: req.path, 
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(403).json({
        success: false,
        message: 'Unauthorized access - Admin privileges required'
      });
      return;
    }

    // Attach admin status to request for downstream use
    req.isAdmin = true;
    logLevels.info(`Admin access granted`, { userId, endpoint: req.path });
    
    next();
  } catch (error) {
    logLevels.error(`Admin verification failed`, { 
      userId: req.userId, 
      endpoint: req.path,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify admin privileges',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


/**
 * Combined middleware: Extract userId and require admin in one step
 * Usage: router.get('/admin-only', requireAdminWithUserId('header'), handler)
 */
export const requireAdminWithUserId = (source: 'header' | 'param' | 'body' = 'header') => {
  return [extractUserId(source), requireAdmin];
};

/**
 * Optional admin verification - doesn't fail if user is not admin
 * Just sets req.isAdmin boolean for conditional logic in routes
 */
export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      req.isAdmin = false;
      return next();
    }

    const isAdmin = await adminService.verifyAdminUser(userId);
    req.isAdmin = isAdmin;
    
    logLevels.debug(`Admin check completed`, { userId, isAdmin, endpoint: req.path });
    
    next();
  } catch (error) {
    logLevels.warn(`Admin check failed, proceeding as non-admin`, { 
      userId: req.userId, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    req.isAdmin = false;
    next();
  }
};


