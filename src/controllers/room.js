const _ = require("lodash");
const BaseClass = require("./base");
const { default: mongoose } = require("mongoose");

class Room extends BaseClass {
  constructor(ctx, next) {
    super(ctx, next);

    this._beforeMethods = {
      addRoom: ["authenticate"],
      updateRoomDetails: ["authenticate"],
      deleteRoom: ["authenticate"],
      // roomDetails: ["authenticate"],
    };
  }

  async roomDetails() {
    try {
      const { roomId } = this.ctx.params;
      const roomDetails = await this.models.Room.findById(roomId);
      this.ctx.body = {
        success: true,
        message: "Room added successfully",
        data: { room: roomDetails },
      };
    } catch (error) {
      this.throwError("301", "Failed to add room");
    }
  }

  // Admin adds a room to a hotel
  async addRoom() {
    // Ensure the admin is performing this action
    if (!this.admin) {
      this.throwError("403", "Not authorized to add a room");
    }

    // let { value, error } = this.validations.Room.addRoomSchema.validate(
    //   this.ctx.request.body
    // );
    // if (error) {
    //   let errorMessage =
    //     _.size(error.details) > 0 ? error.details[0].message : null;
    //   this.throwError("201", errorMessage);
    // }

    const { hotelId } = this.ctx.params;

    // Find the hotel
    const hotel = await this.models.Hotel.findById(hotelId);
    if (!hotel) {
      this.throwError("404", "Hotel not found");
    }

    // Create new room
    const { features, description, pricePerNight, status, type,totalRooms} = this.ctx.request.body;

    const value = {
      description,
      features: JSON.parse(features),
      pricePerNight,
      status,
      type,
      images: this.ctx.request.body.images, // Already extracted above
      hotel: hotelId,
      totalRooms,
    };
    const room = new this.models.Room({
      ...value,
    });

    try {
      if (
        !mongoose.Types.ObjectId.isValid(hotelId) ||
        !mongoose.Types.ObjectId.isValid(room._id)
      ) {
        throw new Error("Invalid ObjectId format");
      }
      await this.models.Hotel.findOneAndUpdate(
        { _id: hotelId },
        { $addToSet: { rooms: room._id } }, // Corrected line
        { new: true }
      );
      await room.save();
    } catch (err) {
      this.throwError("301", "Failed to add room");
    }

    this.ctx.body = {
      success: true,
      message: "Room added successfully",
      data: { room },
    };
  }

  // Admin updates room details
  async updateRoomDetails() {
    if (!this.admin) {
      this.throwError("403", "Not authorized to update room details");
    }


    // let { value, error } = this.validations.Room.updateRoomSchema.validate(
    //   this.ctx.request.body
    // );
    // if (error) {
    //   let errorMessage =
    //     _.size(error.details) > 0 ? error.details[0].message : null;
    //   this.throwError("201", errorMessage);
    // }

    const { roomId } = this.ctx.params;

    const room = await this.models.Room.findById(roomId);
    if (!room) {
      console.log("Room not found");
      this.throwError("404", "Room not found");
      return; 
    }

    const { features, description, pricePerNight, status, type,totalRooms} = this.ctx.request.body;

    const value = {
      description,
      features: JSON.parse(features),
      pricePerNight,
      status,
      type,
      images: this.ctx.request.body.images, 
      hotel: room.hotel,
      totalRooms,
    };
_.assign(room, value);
    try {
      await room.save();
    } catch (err) {
      this.throwError("301", "Failed to update room details");
    }

    this.ctx.body = {
      success: true,
      message: "Room details updated successfully",
      data: { room },
    };
  }

  // Admin deletes a room
  async deleteRoom() {
    // Ensure the admin is performing this action
    if (!this.admin) {
      this.throwError("403", "Not authorized to delete room");
    }

    let { value, error } = this.validations.Room.deleteRoomSchema.validate({
      roomId: this.ctx.params.roomId,
    });
    if (error) {
      this.throwError("201", "Invalid room ID");
    }

    const { roomId } = this.ctx.params;

    // Find the room
    const room = await this.models.Room.findById(roomId);
    if (!room) {
      this.throwError("404", "Room not found");
    }

    room.status = "deleted";

    try {
      await room.save();
    } catch (err) {
      this.throwError("302", "Failed to delete room");
    }

    this.ctx.body = {
      success: true,
      message: "Room deleted successfully",
    };
  }
}

module.exports = Room;
