const _ = require("lodash");
const env = process.env.NODE_ENV || "development";
const config = require(`./config/env/${env}.config.json`);
const utilities = require("./src/utilities");
const validations = require("./src/validations");

//set config and env in Registry
utilities.Registry.set("config", config);
utilities.Registry.set("env", env);
utilities.Registry.set("validations", validations);

//initialise mongodb connection
if (config.mongo_instances.primary_1.connect) {
  let mongoConn = new utilities.DBClient.MongoDB.Client(
    config.mongo_instances.primary_1,
    {}
  ).connect();
  utilities.Registry.set("mongodb", mongoConn);
} else {
  utilities.Registry.set("mongodb", false);
  console.log("Mongodb connection is false in config file");
}

//initialise cloudinary connection
if (config.cloudinary_instances.cloudinary_1.connect) {
  const cloudinaryConn = new utilities.DBClient.Cloudinary.Client(
    config.cloudinary_instances.cloudinary_1
  );
  cloudinaryConn.configure();
  utilities.Registry.set("cloudinary", cloudinaryConn);
} else {
  console.log("Cloudinary connection is false in config file");
  utilities.Registry.set("cloudinary", false);
}

//creating collection for all the mongodb schemas
const schemaList = require("./src/models");
utilities.Registry.set("schemas", schemaList);
let models = {};
_.each(schemaList, (value, key) => {
  let mongoConn = utilities.Registry.get("mongodb");
  if (!mongoConn) return;
  models[key] = mongoConn.model(key, value.schema.schema);
});
utilities.Registry.set("models", models);

//initialise application
const koa = require("koa");
const app = new koa();

//add middlewares to the application
const { koaBody } = require("koa-body");
require("koa-qs")(app, "extended");

const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: uploadDir,
      keepExtensions: true,
    },
  })
);

app.use(async (ctx, next) => {
  try {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Methods", "*");
    ctx.set("Access-Control-Allow-Headers", "*");
    await next();
  } catch (error) {
    console.log("Process.Error", error);
    ctx.status = error.status || 500;
    ctx.body = {
      success: false,
      message:
        "Internal Server error, dev team has been notified. Please try again after sometime!!",
    };
    ctx.app.emit("error", error);
  }
});

//initalise all the routes/apis of the application
const { r: router } = require("./src/routes");
app.use(router.routes());
app.use(router.allowedMethods());

//iterative method

// _.each(routesList, (router, key) => {
// 	app.use(router.routes());
// 	app.use(router.allowedMethods());
// });

//start the server
let server = app.listen(config.application.port, () => {
  console.log(`Application is [ started ] on port ${config.application.port}`);
});

module.exports = server;
