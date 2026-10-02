import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-user-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';

// Run this once for the entire test file to create a user and save auth state
test.beforeAll(async ({ request }) => {
  // Register a new user on the real backend
  const res = await request.post('http://localhost:5000/api/v1/auth/register', {
    data: {
      fullName: 'Playwright Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }
  });
  
  if (!res.ok()) {
    // If user already exists, we're fine, just login
    await request.post('http://localhost:5000/api/v1/auth/login', {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }
    });
  }
});

// For each test, login via the UI to seed auth state, then set up mocks
test.beforeEach(async ({ page }) => {
  // Perform real login
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign in")');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard');

  // Mock the initial goals fetch
  await page.route('**/api/v1/goals', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        json: { success: true, data: [] }
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        json: { 
          success: true, 
          data: { _id: 'mock-goal-123', title: 'Become an AI Engineer', category: 'career', progress: 0 } 
        }
      });
    } else {
      await route.continue();
    }
  });

  // Mock individual goal fetch
  await page.route('**/api/v1/goals/mock-goal-123', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          _id: 'mock-goal-123',
          title: 'Become an AI Engineer',
          category: 'career',
          progress: 0,
          milestones: []
        }
      }
    });
  });
});

test.describe('Goal Workflow with AI Planning', () => {

  test('handles empty states correctly on Dashboard', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.locator('text="Start with something you want to change, build, or achieve."')).toBeVisible();
    await expect(page.locator('text="Create Your First Goal"')).toBeVisible();
  });

  test('creates a goal, generates a plan, reviews, edits, and applies it', async ({ page }) => {
    // Mock AI Plan generation
    await page.route('**/api/v1/goals/mock-goal-123/ai-plan', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            milestones: ['Learn Basics', 'Build AI Project'],
            tasks: [{ milestoneIndex: 0, title: 'Read PyTorch docs' }],
            habits: [{ title: 'Code daily', frequency: 'daily' }]
          }
        }
      });
    });

    // Mock Apply Plan
    let appliedPlanData: any = null;
    await page.route('**/api/v1/goals/mock-goal-123/apply-plan', async (route) => {
      appliedPlanData = route.request().postDataJSON();
      await route.fulfill({
        json: { success: true, data: { _id: 'mock-goal-123' } }
      });
    });

    // Navigate to goals page
    await page.goto('/goals');

    // Create Goal
    await page.click('text="Create Your First Goal"');
    await expect(page.locator('text="What do you want to achieve?"')).toBeVisible();
    await page.fill('input[name="title"]', 'Become an AI Engineer');
    await page.fill('input[name="deadline"]', '2026-12-31');
    await page.click('button:has-text("Continue")');

    // Add Context step
    await expect(page.locator('text="Add Context for AI"')).toBeVisible();
    await page.fill('textarea[name="description"]', 'I only have 10 hours a week.');
    await page.click('button:has-text("Create Goal & Plan")');

    // Verify redirection
    await page.waitForURL('**/goals/mock-goal-123?generate=true');
    await expect(page.locator('text="Become an AI Engineer"')).toBeVisible();
    await expect(page.locator('text="AI Suggested Roadmap"')).toBeVisible();

    // Verify AI generation
    await expect(page.locator('text="Learn Basics"')).toBeVisible();
    await expect(page.locator('text="Build AI Project"')).toBeVisible();

    // Edit AI Plan
    const milestoneContainer = page.locator('.group:has-text("Learn Basics")').first();
    await milestoneContainer.hover();
    await milestoneContainer.locator('button').nth(0).click(); 
    
    const editInput = page.locator('input').first();
    await editInput.fill('Learn Advanced AI');
    await page.locator('button:has-text("")').locator('svg.lucide-check').first().click();

    await expect(page.locator('text="Learn Advanced AI"')).toBeVisible();

    // Remove a task
    const taskContainer = page.locator('.group:has-text("Read PyTorch docs")').first();
    await taskContainer.hover();
    await taskContainer.locator('button').nth(1).click(); // Click Trash icon
    await expect(page.locator('text="Read PyTorch docs"')).toBeHidden();

    // Approve / Apply Plan
    await page.click('button:has-text("Accept & Apply Plan")');

    // Validation
    expect(appliedPlanData).not.toBeNull();
    expect(appliedPlanData!.milestones[0]).toBe('Learn Advanced AI');
    expect(appliedPlanData!.tasks.length).toBe(0); // Task was removed
  });

  test('handles AI generation error gracefully', async ({ page }) => {
    // Mock AI Plan generation failure
    await page.route('**/api/v1/goals/mock-goal-123/ai-plan', async (route) => {
      await route.fulfill({
        status: 500,
        json: { success: false, message: 'AI provider not available' }
      });
    });

    await page.goto('/goals/mock-goal-123?generate=true');
    
    // UI should show the AI Generation Failed error block
    await expect(page.locator('text="AI Generation Failed"')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    
    // Dismiss the error block
    await page.click('button:has-text("Dismiss")');
    await expect(page.locator('text="This goal doesn\'t have a roadmap yet."')).toBeVisible();
  });

  test('allows the user to cancel/dismiss the AI plan', async ({ page }) => {
    // Mock AI Plan generation
    await page.route('**/api/v1/goals/mock-goal-123/ai-plan', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            milestones: ['Cancel Me'],
            tasks: [],
            habits: []
          }
        }
      });
    });

    await page.goto('/goals/mock-goal-123?generate=true');
    await expect(page.locator('text="Cancel Me"')).toBeVisible();
    
    // Dismiss
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text="Cancel Me"')).toBeHidden();
  });
});
