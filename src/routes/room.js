const Router = require("@koa/router");
const Controller = require("../controllers");
const fs = require("fs");
const utilities = require("../utilities");

let r = new Router();

r.get("/room-details/:roomId", async (ctx, next) => {
  let controller = new Controller.Room(ctx, next);
  await controller.execute("roomDetails");
});
r.post("/admin/add-room/:hotelId", async (ctx, next) => {
  const cloudinaryConn = utilities.Registry.get("cloudinary");
  const files = ctx.request.files ? ctx.request.files.images : null; // Get uploaded files
  const uploadedImages = [];
  const oldImages = ctx.request.body.images
    ? JSON.parse(ctx.request.body.images)
    : [];
    console.log("old images",oldImages);
  if (files) {
    if (Array.isArray(files)) {
      for (let file of files) {
        try {
          const result = await cloudinaryConn.uploadImage(file.filepath);
          uploadedImages.push(result.secure_url);
          fs.unlinkSync(file.filepath);
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          ctx.throw(500, "Error uploading image");
        }
      }
    } else {
      try {
        const result = await cloudinaryConn.uploadImage(files.filepath);
        uploadedImages.push(result.secure_url);
        fs.unlinkSync(files.filepath);
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        ctx.throw(500, "Error uploading image");
      }
    }
  }
  console.log("uploaded images",uploadedImages);
  ctx.request.body.images = [...oldImages, ...uploadedImages];
  let controller = new Controller.Room(ctx, next);
  await controller.execute("addRoom");
});
r.post("/admin/update-room-details/:roomId", async (ctx, next) => {
  console.log("this api is calling");
  const cloudinaryConn = utilities.Registry.get("cloudinary");
  const files = ctx.request.files ? ctx.request.files.images : null; // Get uploaded files
  const uploadedImages = [];
  const oldImages = ctx.request.body.images
    ? JSON.parse(ctx.request.body.images)
    : [];
  if (files) {
    if (Array.isArray(files)) {
      for (let file of files) {
        try {
          const result = await cloudinaryConn.uploadImage(file.filepath);
          uploadedImages.push(result.secure_url);
          fs.unlinkSync(file.filepath);
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          ctx.throw(500, "Error uploading image");
        }
      }
    } else {
      try {
        const result = await cloudinaryConn.uploadImage(files.filepath);
        uploadedImages.push(result.secure_url);
        fs.unlinkSync(files.filepath);
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        ctx.throw(500, "Error uploading image");
      }
    }
  }
  ctx.request.body.images = [...oldImages, ...uploadedImages];
  let controller = new Controller.Room(ctx, next);
  await controller.execute("updateRoomDetails");
});
r.delete("/admin/delete-room/:roomId", async (ctx, next) => {
  let controller = new Controller.Room(ctx, next);
  await controller.execute("deleteRoom");
});

module.exports = r;
