import { Router, Request, Response, NextFunction } from 'express';
import { CompetitionData } from '../models/competition.model';
import competitionService, { CompetitionValidationError } from '../services/competition.service';
import { logLevels } from '../services/logger';
import { requireAdminWithUserId, extractUserId, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

type CompetitionListStatus = 'incomplete' | 'upcoming' | 'open' | 'current' | 'completed';
type RawPublicPick = {
  eventId?: string | number;
  predictedWinnerId?: string | number | null;
  predictedSecondId?: string | number | null;
  predictedThirdId?: string | number | null;
  predictedFourthId?: string | number | null;
};

const toNullableNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// GET /api/competitions/live
// Returns public active competitions for the home page
router.get('/live', async (_req: Request, res: Response) => {
  try {
    const rows = await competitionService.getPublicActiveCompetitions();

    res.status(200).json({
      success: true,
      message: 'Live competitions retrieved successfully',
      data: rows,
    });
  } catch (error) {
    logLevels.error('Failed to query public live competitions', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to query live competitions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/competitions/public/:id
// Returns competition entry data for non-admin pages.
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const competitionId = String(req.params.id ?? '').trim();
    if (!competitionId) {
      res.status(400).json({
        success: false,
        message: 'Competition ID is required',
      });
      return;
    }

    const competition = await competitionService.getCompetitionEditorDataById(competitionId);
    if (!competition) {
      res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
      return;
    }

    const entryData = {
      id: String(competition.id ?? competition.comp_id ?? competitionId),
      title: competition.title,
      startDate: String(competition.startDate ?? competition.starts_on ?? ''),
      days: (competition.days ?? []).map((day) => ({
        id: String(day.id ?? day.day_id ?? ''),
        title: String(day.title ?? day.day_title ?? ''),
        dayOrder: Number(day.day_order ?? 0),
        events: (day.events ?? []).map((event) => ({
          id: String(event.id ?? event.event_id ?? ''),
          title: String(event.title ?? event.event_title ?? ''),
          eventOrder: Number(event.event_order ?? event.index ?? 0),
          swimmers: (event.swimmers ?? []).map((swimmer) => ({
            id: String(swimmer.id ?? swimmer.swimmer_id ?? ''),
            name: String(swimmer.name ?? swimmer.swimmer_name ?? ''),
            time: swimmer.time ?? swimmer.swimmer_time ?? '',
            placeFinish: swimmer.place_finish ?? null,
          })),
        })),
      })),
    };

    res.status(200).json({
      success: true,
      message: 'Competition entry data retrieved successfully',
      data: entryData,
    });
  } catch (error) {
    logLevels.error('Failed to query public competition entry data', {
      competitionId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to query competition entry data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/competitions/public/:id/picks
// Saves user picks for one competition using swimmer IDs.
router.get('/public/:id/picks/:publicUserId', async (req: Request, res: Response) => {
  try {
    const competitionId = Number(String(req.params.id ?? '').trim());
    const publicUserId = Number(String(req.params.publicUserId ?? '').trim());

    if (!Number.isInteger(competitionId) || competitionId <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid competition ID is required',
      });
      return;
    }

    if (!Number.isInteger(publicUserId) || publicUserId <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid publicUserId is required',
      });
      return;
    }

    const rows = await competitionService.getUserCompetitionPicks(publicUserId, competitionId);
    res.status(200).json({
      success: true,
      message: 'Competition picks retrieved successfully',
      data: rows,
    });
  } catch (error) {
    const isValidation = error instanceof CompetitionValidationError;

    logLevels.error('Failed to load competition picks', {
      competitionId: req.params.id,
      publicUserId: req.params.publicUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(isValidation ? 400 : 500).json({
      success: false,
      message: isValidation ? (error as Error).message : 'Failed to load competition picks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/public/:id/picks', async (req: Request, res: Response) => {
  try {
    const competitionIdRaw = String(req.params.id ?? '').trim();
    const competitionId = Number(competitionIdRaw);
    if (!Number.isInteger(competitionId) || competitionId <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid competition ID is required',
      });
      return;
    }

    const publicUserId = Number(req.body?.publicUserId);
    if (!Number.isInteger(publicUserId) || publicUserId <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid publicUserId is required',
      });
      return;
    }

    const rawPicks = Array.isArray(req.body?.picks) ? (req.body.picks as RawPublicPick[]) : [];
    if (rawPicks.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one pick is required',
      });
      return;
    }

    const picks = rawPicks.map((pick) => ({
      eventId: Number(pick.eventId),
      predictedWinnerId: toNullableNumber(pick.predictedWinnerId),
      predictedSecondId: toNullableNumber(pick.predictedSecondId),
      predictedThirdId: toNullableNumber(pick.predictedThirdId),
      predictedFourthId: toNullableNumber(pick.predictedFourthId),
    }));

    const result = await competitionService.saveUserCompetitionPicks(publicUserId, competitionId, picks);

    res.status(200).json({
      success: true,
      message: 'Competition picks saved successfully',
      data: result,
    });
  } catch (error) {
    const isValidation = error instanceof CompetitionValidationError;

    logLevels.error('Failed to save competition picks', {
      competitionId: req.params.id,
      publicUserId: req.body?.publicUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(isValidation ? 400 : 500).json({
      success: false,
      message: isValidation ? (error as Error).message : 'Failed to save competition picks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});


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
      if (error instanceof CompetitionValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: error.message,
        });
        return;
      }

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
      if (error instanceof CompetitionValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: error.message,
        });
        return;
      }

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

// POST /api/competitions/query
// Returns competitions filtered by status/search (Admin only)
router.post('/query', extractUserId('body'), requireAdmin, async (req: Request, res: Response) => {
  try {
    const rawStatuses = Array.isArray(req.body?.statuses) ? req.body.statuses : [];
    const statuses = rawStatuses
      .map((value: unknown) => String(value).trim().toLowerCase())
      .filter((value: string): value is CompetitionListStatus => (
        value === 'incomplete' || value === 'upcoming' || value === 'open' || value === 'current' || value === 'completed'
      ));
    const search = String(req.body?.search ?? '').trim();
    const page = Math.max(1, Number(req.body?.page ?? 1));
    const pageSize = Math.max(1, Number(req.body?.pageSize ?? 10));

    const rows = await competitionService.getCompetitionsByFilters({ statuses, search, page, pageSize });

    res.status(200).json({
      success: true,
      message: 'Competitions retrieved successfully',
      data: rows,
    });
  } catch (error) {
    logLevels.error('Failed to query competitions', {
      userId: req.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      search: req.body?.search,
      statuses: req.body?.statuses,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to query competitions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/competitions/queryById
// Returns full competition payload for editor by comp_id (Admin only)
router.post('/queryById', extractUserId('body'), requireAdmin, async (req: Request, res: Response) => {
  try {
    const competitionId = String(req.body?.comp_id ?? req.body?.id ?? '').trim();
    if (!competitionId) {
      res.status(400).json({
        success: false,
        message: 'Competition ID is required',
      });
      return;
    }

    const competition = await competitionService.getCompetitionEditorDataById(competitionId);
    if (!competition) {
      res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Competition retrieved successfully',
      data: competition,
    });
  } catch (error) {
    logLevels.error('Failed to query competition by ID', {
      userId: req.userId,
      competitionId: req.body?.comp_id ?? req.body?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to query competition',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/competitions/active
// Returns all active competitions (Admin only)
router.post('/active', extractUserId('body'), requireAdmin, async (req: Request, res: Response) => {
  try {
    const rows = await competitionService.getActiveCompetitions();

    res.status(200).json({
      success: true,
      message: 'Active competitions retrieved successfully',
      data: rows,
    });
  } catch (error) {
    logLevels.error('Failed to query active competitions', {
      userId: req.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: 'Failed to query active competitions',
      error: error instanceof Error ? error.message : 'Unknown error',
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
