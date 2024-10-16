const Router = require("@koa/router");
const Controller = require("../controllers");

let r = new Router();

r.post("/auth/register", async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('register');
});
r.post("/auth/login",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('login');
});
r.get("/auth",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('authenticateUser');
});
r.post("/change-password",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('changePassword');
});
r.post("/update-profile",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('updateProfile');
});
r.get("/logout",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('logout');
});
r.post("/admin/create-admin",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('toggleUser');
});
r.post("/admin/block-user",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('blockUser');
});
r.get("/admin/get-all-users",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('getAllUsers');
})
r.get("/admin/get-dashboard-details",async (ctx, next) => {
    let controller = new Controller.Auth(ctx, next);
    await controller.execute('getDashboardDetails');
})


module.exports = r;