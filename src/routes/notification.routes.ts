import { Router } from 'express';
import TreasuryBond from '../models/TreasuryBond';
import Notification from '../models/Notification';

const notificationsRouter = Router();

// Stub until connection to database is implemented
const notifications: Notification[] = [];

notificationsRouter.post('/', (request, response) => {
  const { bond, value, type, notifyByEmail, notifyByBrowser } = request.body;

  // Stub until connection to database is implemented
  const findNotificationForTheSameBond = notifications.find(
    notification => notification.bond.id === bond.id,
  );

  if (findNotificationForTheSameBond) {
    return response
      .status(400)
      .json({ message: 'A notification for this bond already exists.' });
  }

  const notification = new Notification(
    bond,
    value,
    type,
    notifyByEmail,
    notifyByBrowser,
  );

  return response.json(notification);
});

export default notificationsRouter;
