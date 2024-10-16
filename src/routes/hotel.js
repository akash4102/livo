const Router = require("@koa/router");
const Controller = require("../controllers");
const utilities = require("../utilities");
const fs = require("fs");

let r = new Router();

r.get("/all-hotel", async (ctx, next) => {
  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("allHotel");
});
r.get("/hotel-details/:hotelId", async (ctx, next) => {
  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("hotelDetails");
});
r.get("/search-hotel", async (ctx, next) => {
  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("searchHotel");
});
r.post("/admin/add-hotel", async (ctx, next) => {
  const cloudinaryConn = utilities.Registry.get("cloudinary");
  console.log("this is calling not that");
  const files = ctx.request.files ? ctx.request.files.images : null; // Get uploaded files
  const uploadedImages = [];
  // console.log("files are",files);
  if (files) {
    if (Array.isArray(files)) {
      // Handle multiple file uploads
      // console.log("here");
      for (let file of files) {
        // console.log("very file is",file.filepath);
        try {
          // console.log("Uploading file:", file.filepath); // Log file path

          const result = await cloudinaryConn.uploadImage(file.filepath); // Upload to Cloudinary
          uploadedImages.push(result.secure_url); // Push the Cloudinary URL to array
          // console.log("result is",result);
          fs.unlinkSync(file.filepath); // Delete file from temp folder after upload
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          ctx.throw(500, "Error uploading image");
        }
      }
    } else {
      // Handle single file upload
      try {
        //   console.log("Uploading file:", files.path); // Log file path

        const result = await cloudinaryConn.uploadImage(files.filepath); // Upload to Cloudinary
        uploadedImages.push(result.secure_url);

        fs.unlinkSync(files.filepath); // Delete file from temp folder after upload
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        ctx.throw(500, "Error uploading image");
      }
    }
  }

  ctx.request.body.images = uploadedImages; // Attach uploaded images to request body

  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("addHotel");
});
r.delete("/admin/remove-hotel/:hotelId", async (ctx, next) => {
  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("removeHotel");
});
r.post("/admin/update-hotel-details/:hotelId", async (ctx, next) => {
  const cloudinaryConn = utilities.Registry.get("cloudinary");

  const files = ctx.request.files ? ctx.request.files.images : null; // Get uploaded files
  const uploadedImages = [];

  const oldImages = ctx.request.body.oldImages
    ? JSON.parse(ctx.request.body.oldImages)
    : [];

  // console.log("files are",files);
  if (files) {
    if (Array.isArray(files)) {
      // Handle multiple file uploads
      // console.log("here");
      for (let file of files) {
        // console.log("very file is",file.filepath);
        try {
          // console.log("Uploading file:", file.filepath); // Log file path

          const result = await cloudinaryConn.uploadImage(file.filepath); // Upload to Cloudinary
          uploadedImages.push(result.secure_url); // Push the Cloudinary URL to array
          // console.log("result is",result);
          fs.unlinkSync(file.filepath); // Delete file from temp folder after upload
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          ctx.throw(500, "Error uploading image");
        }
      }
    } else {
      // Handle single file upload
      try {
        //   console.log("Uploading file:", files.path); // Log file path

        const result = await cloudinaryConn.uploadImage(files.filepath); // Upload to Cloudinary
        uploadedImages.push(result.secure_url);

        fs.unlinkSync(files.filepath); // Delete file from temp folder after upload
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        ctx.throw(500, "Error uploading image");
      }
    }
  }

  ctx.request.body.images = [...oldImages, ...uploadedImages];
  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("updateHotelDetails");
});
r.post("/add-hotel-review", async (ctx, next) => {
  let controller = new Controller.Hotel(ctx, next);
  await controller.execute("addReview");
});

module.exports = r;
