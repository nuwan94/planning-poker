import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  Story, 
  CreateStoryRequest, 
  UpdateStoryRequest, 
  ApiResponse 
} from '@planning-poker/shared';

const router = Router();

// In-memory storage (replace with database in production)
const stories = new Map<string, Story>();

// Get all stories for a room
router.get('/', (req: Request, res: Response<ApiResponse<Story[]>>) => {
  const { roomId } = req.query;
  
  if (!roomId) {
    return res.status(400).json({
      success: false,
      message: 'Room ID is required'
    });
  }

  // Filter stories by room (in real app, this would be a database query)
  const roomStories = Array.from(stories.values()).filter(story => 
    story.id.startsWith(roomId as string)
  );

  res.json({
    success: true,
    data: roomStories
  });
});

// Get story by ID
router.get('/:id', (req: Request, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  const story = stories.get(id);

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
});

// Create a new story
router.post('/', (req: Request<{}, ApiResponse<Story>, CreateStoryRequest & { roomId: string }>, res: Response<ApiResponse<Story>>) => {
  const { roomId, title, description, acceptanceCriteria } = req.body;

  if (!roomId || !title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Room ID and story title are required'
    });
  }

  const storyId = `${roomId}_${uuidv4()}`;
  
  const story: Story = {
    id: storyId,
    title: title.trim(),
    description: description?.trim(),
    acceptanceCriteria: acceptanceCriteria?.filter(criteria => criteria.trim().length > 0),
    votes: [],
    isRevealed: false,
    createdAt: new Date()
  };

  stories.set(storyId, story);

  res.status(201).json({
    success: true,
    data: story
  });
});

// Update story
router.put('/:id', (req: Request<{id: string}, ApiResponse<Story>, UpdateStoryRequest>, res: Response<ApiResponse<Story>>) => {
  const { id } = req.params;
  const { title, description, acceptanceCriteria, finalEstimate } = req.body;
  
  const story = stories.get(id);
  
  if (!story) {
    return res.status(404).json({
      success: false,
      message: 'Story not found'
    });
  }

  if (title !== undefined) {
    if (title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Story title cannot be empty'
      });
    }
    story.title = title.trim();
  }

  if (description !== undefined) {
    story.description = description.trim() || undefined;
  }

  if (acceptanceCriteria !== undefined) {
    story.acceptanceCriteria = acceptanceCriteria.filter(criteria => criteria.trim().length > 0);
  }

  if (finalEstimate !== undefined) {
    story.finalEstimate = finalEstimate.trim() || undefined;
  }

  stories.set(id, story);

  res.json({
    success: true,
    data: story
  });
});

// Delete story
router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;
  
  if (!stories.has(id)) {
    return res.status(404).json({
      success: false,
      message: 'Story not found'
    });
  }

  stories.delete(id);
  
  res.json({
    success: true,
    message: 'Story deleted successfully'
  });
});

export { router as storyRoutes };