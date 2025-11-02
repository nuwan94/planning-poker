import { Router, Request, Response } from 'express';
import { 
  Room, 
  User, 
  CreateRoomRequest, 
  UpdateRoomRequest, 
  ApiResponse 
} from '@planning-poker/shared';
import { roomService } from '../services/roomService';
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
    const room = await roomService.getRoomById(id);
    
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
      message: 'Failed to fetch room'
    });
  }
});

// Create a new room
router.post('/', createRoomValidation, async (req: Request<{}, ApiResponse<Room>, CreateRoomRequest>, res: Response<ApiResponse<Room>>) => {
  const { name, description, owner } = req.body;

  try {
    const room = await roomService.createRoom(name, description, owner);
    
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
});

// Update room
router.put('/:id', updateRoomValidation, async (req: Request<{id: string}, ApiResponse<Room>, UpdateRoomRequest>, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const room = await roomService.updateRoom(id, { name, description });
    
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
  const { name, isSpectator = false } = req.body;
  
  try {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      isSpectator
    };
    
    const room = await roomService.addParticipant(id, user);
    
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

export { router as roomRoutes };