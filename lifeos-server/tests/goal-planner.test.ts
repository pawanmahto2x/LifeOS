import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { GoalService } from '../src/services/goal.service';
import { GoalRepository } from '../src/repositories/goal.repository';
import { Types } from 'mongoose';
import { IGoalDocument } from '../src/models/goal.model';
import { ProviderFactory } from '../src/ai/provider.factory';

describe('Phase 2 - Real LLM Goal Planner Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const goalId = new Types.ObjectId().toString();

  let goalService: GoalService;
  let mockGoalRepo: Partial<GoalRepository>;
  let mockProviderFactory: Partial<ProviderFactory>;
  let mockProvider: any;

  beforeEach(() => {
    mockGoalRepo = {
      findById: mock.fn(async () => {
        return {
          _id: new Types.ObjectId(goalId),
          title: 'Become an AI/ML Engineer',
          description: 'Learn ML and get a job',
          category: 'career',
          deadline: new Date('2026-12-31'),
        } as unknown as IGoalDocument;
      }),
    };

    mockProvider = {
      generateStructured: mock.fn(async () => {
        return {
          milestones: ['Learn Python', 'Learn PyTorch'],
          tasks: [
            { milestoneIndex: 0, title: 'Complete Python Course' },
            { milestoneIndex: 1, title: 'Build Neural Network' },
          ],
          habits: [
            { title: 'Code daily', frequency: 'daily' },
          ],
        };
      }),
    };

    mockProviderFactory = {
      getProvider: mock.fn(async () => mockProvider as any),
    };

    goalService = new GoalService(mockGoalRepo as GoalRepository);
    // Inject mock factory
    (goalService as any).providerFactory = mockProviderFactory;
  });

  it('should successfully generate a goal plan using the LLM provider', async () => {
    const plan = await goalService.generateAIPlan(goalId, userId);

    assert.ok(plan);
    assert.strictEqual(plan.milestones.length, 2);
    assert.strictEqual(plan.tasks.length, 2);
    assert.strictEqual(plan.habits.length, 1);
    
    // Verify provider was called
    assert.strictEqual(mockProvider.generateStructured.mock.callCount(), 1);
  });

  it('should throw an error if the AI provider is not configured', async () => {
    mockProviderFactory.getProvider = mock.fn(async () => {
      const error = new Error('Not configured');
      error.name = 'AIConfigurationError';
      throw error;
    });

    await assert.rejects(
      async () => goalService.generateAIPlan(goalId, userId),
      { message: /AI provider not configured/ }
    );
  });

  it('should handle malformed JSON gracefully and retry/fail', async () => {
    mockProvider.generateStructured = mock.fn(async () => {
      throw new Error('Failed to parse structured JSON');
    });

    await assert.rejects(
      async () => goalService.generateAIPlan(goalId, userId),
      { message: /Failed to generate a valid AI plan/ }
    );

    // Verify it retried
    assert.strictEqual(mockProvider.generateStructured.mock.callCount(), 2);
  });

  it('should fail business validation if tasks reference invalid milestone index', async () => {
    mockProvider.generateStructured = mock.fn(async () => {
      return {
        milestones: ['Only one milestone'],
        tasks: [
          { milestoneIndex: 99, title: 'Invalid reference' }, // 99 is invalid
        ],
        habits: [],
      };
    });

    await assert.rejects(
      async () => goalService.generateAIPlan(goalId, userId),
      { message: /Business Validation Failed: Tasks reference invalid milestone indices/ }
    );

    // Verify it retried due to business validation
    assert.strictEqual(mockProvider.generateStructured.mock.callCount(), 2);
  });

  it('should throw if Zod schema validation fails', async () => {
    mockProvider.generateStructured = mock.fn(async () => {
      return {
        milestones: 'Not an array', // Invalid type
        tasks: [],
        habits: [],
      };
    });

    await assert.rejects(
      async () => goalService.generateAIPlan(goalId, userId),
      { message: /Failed to generate a valid AI plan/ }
    );
  });
});
