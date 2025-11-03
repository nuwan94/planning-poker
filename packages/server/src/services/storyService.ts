import { Story as IStory, Vote, isValidCardValue } from '@planning-poker/shared';
import { Story, IStory as IStoryDoc } from '../models/Story';
import { Room } from '../models/Room';
import { v4 as uuidv4 } from 'uuid';

export class StoryService {
  async createStory(roomId: string, title: string, description?: string, acceptanceCriteria?: string[]): Promise<IStory> {
    const storyId = uuidv4();
    
    const story = new Story({
      id: storyId,
      title,
      description,
      acceptanceCriteria,
      votes: [],
      isRevealed: false,
      roomId
    });

    await story.save();
    return story.toJSON() as IStory;
  }

  async getStoryById(storyId: string): Promise<IStory | null> {
    const story = await Story.findOne({ id: storyId });
    if (!story) return null;
    return story.toJSON() as IStory;
  }

  async getStoryDocument(storyId: string): Promise<IStoryDoc | null> {
    return await Story.findOne({ id: storyId });
  }

  async getStoriesByRoom(roomId: string): Promise<IStory[]> {
    const stories = await Story.find({ roomId }).sort({ createdAt: -1 });
    return stories.map(story => story.toJSON() as IStory);
  }

  async updateStory(storyId: string, updates: Partial<Pick<IStory, 'title' | 'description' | 'acceptanceCriteria' | 'finalEstimate'>>): Promise<IStory | null> {
    const story = await Story.findOneAndUpdate(
      { id: storyId },
      updates,
      { new: true }
    );
    
    if (!story) return null;
    return story.toJSON() as IStory;
  }

  async deleteStory(storyId: string): Promise<boolean> {
    const result = await Story.deleteOne({ id: storyId });
    return result.deletedCount > 0;
  }

  async addVote(storyId: string, vote: Vote): Promise<IStory | null> {
    const story = await Story.findOneAndUpdate(
      { id: storyId },
      { $pull: { votes: { userId: vote.userId } } }, // Remove existing vote first
      { new: true }
    );

    if (!story) return null;

    // Add the new vote
    const updatedStory = await Story.findOneAndUpdate(
      { id: storyId },
      { $push: { votes: vote } },
      { new: true }
    );

    if (!updatedStory) return null;
    return updatedStory.toJSON() as IStory;
  }

  async clearVotes(storyId: string): Promise<IStory | null> {
    const story = await Story.findOneAndUpdate(
      { id: storyId },
      { 
        $set: { votes: [], isRevealed: false },
        $unset: { finalEstimate: '' }  // Remove finalEstimate field completely
      },
      { new: true }
    );
    
    if (!story) return null;
    return story.toJSON() as IStory;
  }

  async revealVotes(storyId: string): Promise<IStory | null> {
    const story = await Story.findOneAndUpdate(
      { id: storyId },
      { isRevealed: true },
      { new: true }
    );
    
    if (!story) return null;
    return story.toJSON() as IStory;
  }

  async setFinalEstimate(storyId: string, estimate: string): Promise<IStory | null> {
    // Get the story to find the room
    const storyDoc = await Story.findOne({ id: storyId });
    if (!storyDoc) {
      console.error(`[StoryService] Story not found: ${storyId}`);
      return null;
    }

    // Get the room to check the card deck
    const room = await Room.findOne({ id: storyDoc.roomId });
    const cardDeckId = room?.cardDeckId || 'fibonacci';

    // Validate that the estimate is a valid card value for this deck
    if (!isValidCardValue(estimate, cardDeckId)) {
      console.error(`[StoryService] Invalid final estimate: ${estimate} for deck ${cardDeckId}`);
      throw new Error(`Final estimate must be a valid value from the ${cardDeckId} deck (excluding ? and ☕)`);
    }

    const story = await Story.findOneAndUpdate(
      { id: storyId },
      { finalEstimate: estimate },
      { new: true }
    );
    
    if (!story) return null;
    return story.toJSON() as IStory;
  }
}

export const storyService = new StoryService();