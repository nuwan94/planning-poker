import { Router, Request, Response } from 'express';
import { 
  Room, 
  User, 
  CreateRoomRequest, 
  UpdateRoomRequest, 
  ApiResponse,
  SOCKET_EVENTS
} from '@planning-poker/shared';
import { roomService } from '../services/roomService';
import { io } from '../index';
import { 
  createRoomValidation, 
  updateRoomValidation, 
  roomIdValidation,
  joinRoomValidation 
} from '../middleware/validation';

const router = Router();

// Get all rooms
router.get('/', async (req: Request, res: Response<ApiResponse<Room[]>>) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
});

// Get rooms owned by a user
router.get('/owner/:ownerId', async (req: Request, res: Response<ApiResponse<Room[]>>) => {
  const { ownerId } = req.params;
  
  try {
    console.log(`[API] Getting rooms for owner: ${ownerId}`);
    const rooms = await roomService.getRoomsByOwner(ownerId);
    
    console.log(`[API] Found ${rooms.length} rooms for owner ${ownerId}`);
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error(`Error fetching rooms for owner ${ownerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
});

// Get room by ID
router.get('/:id', roomIdValidation, async (req: Request, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  
  try {
    console.log(`[API] Getting room: ${id}`);
    const room = await roomService.getRoomById(id);
    
    if (!room) {
      console.log(`[API] Room not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    console.log(`[API] Room found: ${room.name} with ${room.participants.length} participants`);
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room'
    });
  }
});

// Create a new room
router.post('/', createRoomValidation, async (req: Request<{}, ApiResponse<Room>, CreateRoomRequest>, res: Response<ApiResponse<Room>>) => {
  const { name, description, password, owner } = req.body;

  try {
    console.log('[API] Creating room:', { name, owner: owner?.name, hasPassword: !!password });
    const room = await roomService.createRoom(name, description, password, owner);
    
    console.log(`[API] Room created: ${room.id} - ${room.name}`);
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
});

// Update room
router.put('/:id', updateRoomValidation, async (req: Request<{id: string}, ApiResponse<Room>, UpdateRoomRequest>, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  const { name, description, cardDeckId } = req.body;
  
  try {
    const room = await roomService.updateRoom(id, { name, description, cardDeckId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Broadcast the update to all participants in the room
    io.to(id).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
    console.log(`[API] Room ${id} updated and broadcasted to participants`);

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error(`Error updating room ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room'
    });
  }
});

// Delete room
router.delete('/:id', roomIdValidation, async (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;
  
  try {
    const deleted = await roomService.deleteRoom(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete room'
    });
  }
});

// Join room
router.post('/:id/join', [...roomIdValidation, ...joinRoomValidation], async (req: Request, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  const { name, isSpectator = false, password } = req.body;
  
  try {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      isSpectator
    };
    
    const room = await roomService.addParticipant(id, user, password);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join room'
    });
  }
});

// Leave room
router.post('/:id/leave', roomIdValidation, async (req: Request, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  
  try {
    const room = await roomService.removeParticipant(id, userId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to leave room'
    });
  }
});

// Get room story history
router.get('/:id/stories', roomIdValidation, async (req: Request, res: Response<ApiResponse<Room['storyHistory']>>) => {
  const { id } = req.params;
  
  try {
    console.log(`[API] Getting story history for room: ${id}`);
    const storyHistory = await roomService.getStoryHistory(id);
    
    console.log(`[API] Found ${storyHistory.length} stories in history`);
    res.json({
      success: true,
      data: storyHistory
    });
  } catch (error) {
    console.error(`Error fetching story history for room ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch story history'
    });
  }
});

export { router as roomRoutes };