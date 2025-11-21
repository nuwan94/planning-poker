import { Router, Request, Response } from 'express';
import { 
  Story, 
  CreateStoryRequest, 
  UpdateStoryRequest, 
  ApiResponse,
  Vote,
  SOCKET_EVENTS
} from '@planning-poker/shared';
import { storyService } from '../services/storyService';
import { io } from '../index';
import { 
  createStoryValidation, 
  updateStoryValidation, 
  storyIdValidation,
  roomQueryValidation,
  voteValidation 
} from '../middleware/validation';

const router = Router();

// Get all stories for a room
router.get('/', roomQueryValidation, async (req: Request, res: Response<ApiResponse<Story[]>>) => {
  const { roomId } = req.query;
  
  try {
    const stories = await storyService.getStoriesByRoom(roomId as string);
    
    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stories'
    });
  }
});

// Get story by ID
router.get('/:id', storyIdValidation, async (req: Request, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  
  try {
    const story = await storyService.getStoryById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch story'
    });
  }
});

// Create a new story
router.post('/', createStoryValidation, async (req: Request<{}, ApiResponse<Story>, CreateStoryRequest>, res: Response<ApiResponse<Story>>) => {
  const { roomId, title, description, acceptanceCriteria } = req.body;

  try {
    const story = await storyService.createStory(roomId, title, description, acceptanceCriteria);
    
    // Emit socket event to notify all clients in the room
    io.to(roomId).emit(SOCKET_EVENTS.STORY_CREATED, story);
    
    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create story'
    });
  }
});

// Update story
router.put('/:id', updateStoryValidation, async (req: Request<{id: string}, ApiResponse<Story>, UpdateStoryRequest>, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  const { title, description, acceptanceCriteria, finalEstimate } = req.body;
  
  try {
    const story = await storyService.updateStory(id, { 
      title, 
      description, 
      acceptanceCriteria, 
      finalEstimate 
    });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update story'
    });
  }
});

// Delete story
router.delete('/:id', storyIdValidation, async (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;
  
  try {
    const deleted = await storyService.deleteStory(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete story'
    });
  }
});

// Vote on a story
router.post('/:id/vote', [...storyIdValidation, ...voteValidation], async (req: Request, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  const { userId, value } = req.body;
  
  try {
    const vote: Vote = {
      userId,
      value,
      submittedAt: new Date()
    };
    
    const story = await storyService.addVote(id, vote);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit vote'
    });
  }
});

// Clear votes for a story
router.post('/:id/clear-votes', storyIdValidation, async (req: Request, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  
  try {
    const story = await storyService.clearVotes(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear votes'
    });
  }
});

// Reveal votes for a story
router.post('/:id/reveal', storyIdValidation, async (req: Request, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  
  try {
    const story = await storyService.revealVotes(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reveal votes'
    });
  }
});

// Set final estimate
router.post('/:id/estimate', storyIdValidation, async (req: Request, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  const { estimate } = req.body;
  
  if (!estimate || typeof estimate !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Estimate is required'
    });
  }
  
  try {
    const story = await storyService.setFinalEstimate(id, estimate);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set estimate'
    });
  }
});

export { router as storyRoutes };