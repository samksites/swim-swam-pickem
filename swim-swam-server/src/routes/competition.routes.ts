import { Router, Request, Response, NextFunction } from 'express';
import { CompetitionData } from '../models/competition.model';
import competitionService from '../services/competition.service';
import { logLevels } from '../services/logger';
import { requireAdminWithUserId, extractUserId, requireAdmin } from '../middleware/auth.middleware';

const router = Router();


router.post('/createMeet', extractUserId('body'), requireAdmin, async (req: Request, res: Response) => {
    try {
        logLevels.info(`Admin user creating competition`, { 
            userId: req.userId, 
            competitionData: req.body 
        });

        const competitionData: CompetitionData = req.body;
        const competitionId = Number(
          competitionData.comp_id ?? competitionData.id ?? competitionData.competitionId ?? '-1'
        );

        const newID : number = await competitionService.updateCompetition(
          Number.isNaN(competitionId) ? -1 : competitionId,
          competitionData,
          req.userId as string
        );
        
        logLevels.info(`Competition created successfully`, { 
            userId: req.userId, 
            competitionId: newID
        });
        
        res.status(201).json({
            success: true,
            message: 'Competition created successfully',
            data: {
              ...competitionData,
              id: String(newID),
              comp_id: String(newID)
            }
        });

    } catch (error) {
        logLevels.error(`Failed to create competition`, { 
            userId: req.userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to create competition',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// PUT /api/competitions/update
// Creates or updates a competition (Admin only)
router.put('/update', extractUserId('body'), requireAdmin, async (req: Request, res: Response) => {
    try {
        // At this point, middleware has already verified:
        // 1. userId exists (available as req.userId)
        // 2. User is admin (req.isAdmin = true)
       
        logLevels.info(`Admin user updating competition`, { 
            userId: req.userId, 
          competitionId: req.body.comp_id ?? req.body.competitionId 
        });

        // User is admin, update competition
        const competitionId = Number(req.body.comp_id ?? req.body.id ?? req.body.competitionId ?? '-1');
        const updatedCompetition = await competitionService.updateCompetition(
          Number.isNaN(competitionId) ? -1 : competitionId,
          req.body,
          req.userId as string
        );
        
        logLevels.info(`Competition updated successfully`, { 
            userId: req.userId, 
          competitionId: req.body.comp_id ?? req.body.id ?? req.body.competitionId 
        });
        
        res.status(200).json({
            success: true,
            message: 'Competition updated successfully',
            data: {
              ...req.body,
              id: String(updatedCompetition),
              comp_id: String(updatedCompetition)
            }
        });

    } catch (error) {
        const newOrUpdated = String(req.body.comp_id ?? req.body.id ?? req.body.competitionId) === '-1' ? 'created' : 'updated';
        logLevels.error(`Failed to ${newOrUpdated} competition`, { 
            userId: req.userId,
          competitionId: req.body.comp_id ?? req.body.id ?? req.body.competitionId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        res.status(500).json({
            success: false,
            message: `Failed to ${newOrUpdated} competition`,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});



// DELETE /api/competitions/:id
// Delete competition by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement service call to delete competition
    // const deleted = await competitionService.deleteCompetition(id);
    
    // if (!deleted) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Competition not found'
    //   });
    // }
    
    res.status(200).json({
      success: true,
      message: 'Competition deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete competition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/competitions/:id/events
// Get all events for a specific competition
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement service call to get events for competition
    // const events = await competitionService.getCompetitionEvents(id);
    
    res.status(200).json({
      success: true,
      message: 'Competition events retrieved successfully',
      data: [] // events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve competition events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/competitions/:id/days
// Get all days for a specific competition
router.get('/:id/days', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement service call to get days for competition
    // const days = await competitionService.getCompetitionDays(id);
    
    res.status(200).json({
      success: true,
      message: 'Competition days retrieved successfully',
      data: [] // days
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve competition days',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PATCH /api/competitions/:id/status
// Update competition status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // TODO: Add validation for status values
    // if (![0, 1, 2].includes(status)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid status value'
    //   });
    // }
    
    // TODO: Implement service call to update competition status
    // const updatedCompetition = await competitionService.updateCompetitionStatus(id, status);
    
    res.status(200).json({
      success: true,
      message: 'Competition status updated successfully',
      data: null // updatedCompetition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update competition status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
