import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  Room, 
  User, 
  CreateRoomRequest, 
  UpdateRoomRequest, 
  ApiResponse 
} from '@planning-poker/shared';

const router = Router();

// In-memory storage (replace with database in production)
const rooms = new Map<string, Room>();

// Get all rooms
router.get('/', (req: Request, res: Response<ApiResponse<Room[]>>) => {
  const roomList = Array.from(rooms.values());
  res.json({
    success: true,
    data: roomList
  });
});

// Get room by ID
router.get('/:id', (req: Request, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  const room = rooms.get(id);

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
});

// Create a new room
router.post('/', (req: Request<{}, ApiResponse<Room>, CreateRoomRequest>, res: Response<ApiResponse<Room>>) => {
  const { name, description } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Room name is required'
    });
  }

  const roomId = uuidv4();
  const userId = uuidv4();
  
  // Create default owner user (in real app, this would come from auth)
  const owner: User = {
    id: userId,
    name: 'Room Owner',
    isSpectator: false
  };

  const room: Room = {
    id: roomId,
    name: name.trim(),
    description: description?.trim(),
    ownerId: userId,
    participants: [owner],
    isVotingActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  rooms.set(roomId, room);

  res.status(201).json({
    success: true,
    data: room
  });
});

// Update room
router.put('/:id', (req: Request<{id: string}, ApiResponse<Room>, UpdateRoomRequest>, res: Response<ApiResponse<Room>>) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const room = rooms.get(id);
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  if (name !== undefined) {
    if (name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Room name cannot be empty'
      });
    }
    room.name = name.trim();
  }

  if (description !== undefined) {
    room.description = description.trim() || undefined;
  }

  room.updatedAt = new Date();
  rooms.set(id, room);

  res.json({
    success: true,
    data: room
  });
});

// Delete room
router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;
  
  if (!rooms.has(id)) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  rooms.delete(id);
  
  res.json({
    success: true,
    message: 'Room deleted successfully'
  });
});

export { router as roomRoutes };