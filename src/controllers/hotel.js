const _ = require("lodash");
const BaseClass = require("./base");

class Hotel extends BaseClass {
  constructor(ctx, next) {
    super(ctx, next);
    this._beforeMethods = {
      // "allHotel": ['authenticate'],
      addHotel: ["authenticate"],
      updateHotelDetails: ["authenticate"],
      removeHotel: ["authenticate"],
      // "searchHotel": ['authenticate'],
      bookHotel: ["authenticate"],
      hotelDetails: ["authenticate"],
      addReview: ['authenticate'],
    };
  }

  async allHotel() {
    try {
      let hotels = await this.models.Hotel.find({ status: "active" });
      this.ctx.body = {
        success: true,
        message: "Fetched data successfully",
        data: hotels,
      };
    } catch (error) {
      this.ctx.body = {
        success: false,
        message: "Failed to fetch data",
        error: error.message,
      };
    }
  }

  // Admin can add a hotel
  // async addHotel() {
  //     let { value, error } = this.validations.Hotel.hotelValidationSchema.validate(this.ctx.request.body);
  //     if (error) {
  //         let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
  //         this.throwError("201", errorMessage);
  //     }
  //     let hotel = new this.models.Hotel({
  //         ...value,
  //         createdBy: this.ctx.user._id,
  //         status: this.schemas.Hotel.constants.status.active
  //     });

  //     try {
  //         await hotel.save();
  //     } catch (error) {
  //         this.throwError("301", "Failed to save hotel");
  //     }

  //     this.ctx.body = {
  //         success: true,
  //         message: "Hotel added successfully",
  //         data: { hotel }
  //     };
  // }
  // controllers/hotelController.js
  async preprocessHotelData(data) {
    try {
      data.address_list = JSON.parse(data.address_list);
      data.contact = JSON.parse(data.contact);
      data.policies = JSON.parse(data.policies);
      data.amenities = JSON.parse(data.amenities); // This should be an array

      // Return the preprocessed data
      return data;
    } catch (err) {
      console.error("Error parsing hotel data fields:", err);
      throw new Error("Invalid input data format");
    }
  }

  async addHotel() {
    // const preprocessedData = this.preprocessHotelData(this.ctx.request.body);
    // let { value, error } =
    //   this.validations.Hotel.hotelValidationSchema.validate(preprocessedData);

    // if (error) {
    //     console.log("error is",error);
    //   const errorMessage =
    //     _.size(error.details) > 0 ? error.details[0].message : null;
    //   this.throwError("201", errorMessage);
    // }
    const value = {
      name: this.ctx.request.body.name,
      address_list: JSON.parse(this.ctx.request.body.address_list),
      contact: JSON.parse(this.ctx.request.body.contact),
      policies: JSON.parse(this.ctx.request.body.policies),
      amenities: JSON.parse(this.ctx.request.body.amenities),
      map_url: this.ctx.request.body.map_url
    };
    console.log("image urls ", this.ctx.request.body.images);
    const hotel = new this.models.Hotel({
      ...value,
      images: this.ctx.request.body.images, // Save the image URLs from Cloudinary
      createdBy: this.ctx.user._id,
      status: this.schemas.Hotel.constants.status.active,
    });

    try {
      await hotel.save();
    } catch (error) {
      this.throwError("301", "Failed to save hotel");
    }

    this.ctx.body = {
      success: true,
      message: "Hotel added successfully",
      data: { hotel },
    };
  }

  // Admin can update hotel details
  async updateHotelDetails() {
    // let { value, error } = this.validations.Hotel.UpdateHotelSchema.validate(
    //   this.ctx.request.body
    // );
    // if (error) {
    //   let errorMessage =
    //     _.size(error.details) > 0 ? error.details[0].message : null;
    //   this.throwError("201", errorMessage);
    // }

    let hotel = await this.models.Hotel.findById(
      this.ctx.request.params.hotelId
    );
    if (!hotel) {
      this.throwError("404", "Hotel not found");
    }
    const value = {
      name: this.ctx.request.body.name,
      address_list: JSON.parse(this.ctx.request.body.address_list),
      contact: JSON.parse(this.ctx.request.body.contact),
      policies: JSON.parse(this.ctx.request.body.policies),
      amenities: JSON.parse(this.ctx.request.body.amenities),
      images: this.ctx.request.body.images,
      status: this.ctx.request.body.status
    };

    // console.log(this.ctx.request.body,"body is");

    hotel.set(value);
    hotel.map_url = this.ctx.request.body.map_url;
    try {
      await hotel.save();
    } catch (error) {
      this.throwError("301", "Failed to update hotel");
    }

    this.ctx.body = {
      success: true,
      message: "Hotel updated successfully",
      data: { hotel },
    };
  }

  // Admin can remove a hotel
  async removeHotel() {
    let hotel = await this.models.Hotel.findById(
      this.ctx.request.params.hotelId
    );
    if (!hotel) {
      this.throwError("404", "Hotel not found");
    }

    try {
      hotel.status = "disabled";
      await hotel.save();
    } catch (error) {
      this.throwError("302", "Failed to remove hotel");
    }

    this.ctx.body = {
      success: true,
      message: "Hotel removed successfully",
    };
  }

  // User can search hotels
  async searchHotel() {
    let query = this.ctx.query;

    // If no search term is provided, return an empty result
    if (!query.search) {
      this.ctx.body = {
        success: true,
        data: [],
      };
      return;
    }

    // Split the search string into separate words
    let searchTerms = query.search
      .split(" ")
      .map((term) => term.trim())
      .filter(Boolean);

    // Build the search conditions to match each word against both the hotel name and city
    let searchConditions = searchTerms.map((term) => ({
      $or: [
        { name: { $regex: term, $options: "i" } }, // Case-insensitive match on hotel name
        { "address_list.city": { $regex: term, $options: "i" } }, // Case-insensitive match on city
      ],
    }));

    // Construct the query using `$and` to match all search terms
    let filter = { $and: searchConditions };

    // Fetch hotels based on the constructed filter
    let hotels = await this.models.Hotel.find(filter);

    // Send response
    this.ctx.body = {
      success: true,
      data: hotels,
    };
  }

  // User can get hotel details
  async hotelDetails() {
    let hotel = await this.models.Hotel.findById(
      this.ctx.request.params.hotelId
    );
    if (!hotel) {
      this.throwError("404", "Hotel not found");
    }

    this.ctx.body = {
      success: true,
      data: { hotel },
    };
  }

  async addReview() {
    const { hotelId, rating, comment } = this.ctx.request.body;
    const userId = this.ctx.user._id;

    try {
      // Fetch the hotel by ID
      const hotel = await this.models.Hotel.findById(hotelId);

      if (!hotel) {
        this.throwError("404", "Hotel not found");
        return;
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        this.throwError(
          "400",
          "Invalid rating. Rating must be between 1 and 5."
        );
        return;
      }

      hotel.reviews.push({
        user: userId,
        rating: rating,
        comment: comment,
        createdAt: new Date(),
      });

      // Update the overall_rating based on the new review
      const totalReviews = hotel.reviews.length;
      const totalRating = hotel.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const newOverallRating = totalRating / totalReviews;

      hotel.overall_rating = newOverallRating;

      await hotel.save();

      this.ctx.body = {
        success: true,
        message: "Review added successfully",
        data: { hotel },
      };
    } catch (error) {
      console.error("Error adding review:", error);
      this.throwError("500", "Failed to update hotel");
    }
  }
}

module.exports = Hotel;
