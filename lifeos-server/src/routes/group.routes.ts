import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createGroupSchema,
  updateGroupSchema,
  joinGroupByCodeSchema,
  updateMemberRoleSchema,
  voteGoalSchema,
} from '../validators/group.validator';

const router = Router();
export const groupController = new GroupController();

// All group endpoints require authentication
router.use(authenticateUser);

router.post('/', validateRequest({ body: createGroupSchema }), groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.post('/join', validateRequest({ body: joinGroupByCodeSchema }), groupController.joinGroup);

router.get('/:groupId', groupController.getGroupDetails);
router.patch(
  '/:groupId',
  validateRequest({ body: updateGroupSchema }),
  groupController.updateGroup,
);
router.delete('/:groupId', groupController.deleteGroup);

router.post('/:groupId/leave', groupController.leaveGroup);
router.delete('/:groupId/members/:userId', groupController.removeMember);
router.patch(
  '/:groupId/members/:userId',
  validateRequest({ body: updateMemberRoleSchema }),
  groupController.updateMemberRole,
);

router.post(
  '/:groupId/goals/vote',
  validateRequest({ body: voteGoalSchema }),
  groupController.voteGoal,
);

export default router;
