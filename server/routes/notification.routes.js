const { authJwt } = require("../middleware");
const controller = require("../controllers/notification.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get unread notifications for the logged-in user
  app.get(
    "/api/notifications/unread",
    [authJwt.verifyToken], // Any logged-in user can get their notifications
    controller.listMyUnreadNotifications
  );

  // Mark specific notifications as read
  app.patch( // Use PATCH as we are updating status
    "/api/notifications/read",
    [authJwt.verifyToken],
    controller.markNotificationsAsRead
  );

   // Mark all notifications as read
  app.patch(
    "/api/notifications/read-all",
    [authJwt.verifyToken],
    controller.markAllNotificationsAsRead
  );

};
