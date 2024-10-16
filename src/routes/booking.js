const Router = require("@koa/router");
const Controller = require("../controllers");

let r = new Router();

r.post("/book-hotel", async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('bookHotel');
});
r.post("/check-availibility",async (ctx,next)=>{
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('checkRoomsAvailability');
})
r.get("/bookings", async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('getAllBookings');
});
r.post("/get-booking/:bookingId",async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('getbookingDetails');
})
r.get("/admin/all-bookings", async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('getAllBookingsAdmin');
});
r.post("/cancel-booking/:bookingId", async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('cancleBooking');
});
r.post("/update-booking-status/:bookingId", async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('updateBookingStatus');
});

r.post("/update-booking-details/:bookingId", async (ctx, next) => {
    let controller = new Controller.Booking(ctx, next);
    await controller.execute('updateBookingDetails');
});

module.exports = r;