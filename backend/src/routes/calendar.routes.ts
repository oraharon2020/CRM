import express, { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { calendarController } from '../controllers/calendar.controller';

const router: Router = Router();

// Jewish holidays routes
router.get('/jewish-holidays', calendarController.getJewishHolidays.bind(calendarController));
router.get('/jewish-holidays/upcoming', calendarController.getUpcomingJewishHolidays.bind(calendarController));

// Calendar events routes
router.get('/events', authenticate, calendarController.getEvents.bind(calendarController));
router.get('/events/:id', authenticate, calendarController.getEventById.bind(calendarController));
router.post('/events', authenticate, calendarController.createEvent.bind(calendarController));
router.put('/events/:id', authenticate, calendarController.updateEvent.bind(calendarController));
router.delete('/events/:id', authenticate, calendarController.deleteEvent.bind(calendarController));
router.patch('/events/:id/complete', authenticate, calendarController.markEventAsCompleted.bind(calendarController));
router.get('/upcoming', authenticate, calendarController.getUpcomingEvents.bind(calendarController));

export default router;
