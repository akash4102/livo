const { v2: cloudinary } = require("cloudinary");

class Client {
  constructor(config) {
    this.config = config;
    this.storage = null;
  }

  // Method to configure cloudinary
  configure() {
    cloudinary.config({
      cloud_name: this.config.cloud_name,
      api_key: this.config.api_key,
      api_secret: this.config.api_secret,
    });
    console.log("Cloudinary Configured Successfully");
  }

  async uploadImage(filePath) {
    try {
      return await cloudinary.uploader.upload(filePath, {
        folder: "uploads",
      });
    } catch (err) {
      console.error("Cloudinary upload error: ", err);
      throw err;
    }
  }
}

module.exports = Client;
