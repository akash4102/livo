const _ = require("lodash");
const BaseClass = require("./base");

class Booking extends BaseClass {
  constructor(ctx, next) {
    super(ctx, next);

    this._beforeMethods = {
      bookHotel: ["authenticate"],
      getAllBookings: ["authenticate"],
      getbookingDetails: ["authenticate"],
      cancleBooking: ["authenticate"],
      getAllBookingsAdmin: ["authenticate"],
    };
  }

  async bookHotel() {
    const { value, error } = this.validations.Booking.bookHotelSchema.validate(
      this.ctx.request.body
    );
    if (error) {
      const errorMessage =
        _.size(error.details) > 0 ? error.details[0].message : null;
      this.throwError("201", errorMessage);
    }

    const hotel = await this.models.Hotel.findById(value.rooms[0].hotelId);
    if (!hotel) {
      this.throwError("404", "Hotel not found");
    }

    // Check room availability using the new helper function
    const availability = await this.checkRoomsAvailability(
      value.rooms,
      value.checkInDate,
      value.checkOutDate
    );
    if (!availability.success) {
      this.throwError("400", availability.message);
    }

    // Update room bookings
    const roomIds = value.rooms.map((room) => room.room);
    const roomsInHotel = await this.models.Room.find({
      _id: { $in: roomIds },
      hotel: value.rooms[0].hotelId,
    });

    for (const roomToBook of value.rooms) {
      const room = roomsInHotel.find((r) => r._id.equals(roomToBook.room));

      // Add the booking for the given date range
      room.bookings.push({
        checkInDate: value.checkInDate,
        checkOutDate: value.checkOutDate,
        quantity: roomToBook.quantity,
      });

      await room.save(); // Save the updated room data
    }

    // Create the booking
    console.log(value,"vaue is");
    const booking = new this.models.Booking({
      user: this.ctx.user._id,
      hotel: value.rooms[0].hotelId,
      rooms: value.rooms.map((room) => ({
        room: room.room,
        quantity: room.quantity,
      })),
      checkInDate: value.checkInDate,
      checkOutDate: value.checkOutDate,
      status: "booked",
    });

    try {
      await booking.save();
    } catch (err) {
      this.throwError("301", "Failed to create booking");
    }

    this.ctx.body = {
      success: true,
      message: "Hotel booked successfully",
      data: { booking },
    };
  }

  // Get all bookings of the logged-in user
  async getAllBookings() {
    const bookings = await this.models.Booking.find({
      user: this.ctx.user._id,
    }).populate("hotel");

    if (!bookings || bookings.length === 0) {
      this.throwError("404", "No bookings found");
    }

    this.ctx.body = {
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    };
  }
  async getAllBookingsAdmin() {
    const bookings = await this.models.Booking.find().populate("hotel");

    if (!bookings || bookings.length === 0) {
      this.throwError("404", "No bookings found");
    }

    this.ctx.body = {
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    };
  }

  // Get booking details by ID
  async getbookingDetails() {
    const { bookingId } = this.ctx.params;

    const booking = await this.models.Booking.findOne({
      _id: bookingId,
      user: this.ctx.user._id,
    }).populate("hotel");

    if (!booking) {
      this.throwError("404", "Booking not found");
    }

    this.ctx.body = {
      success: true,
      message: "Booking details fetched successfully",
      data: { booking },
    };
  }

  // Cancel a booking
  async cancleBooking() {
    const { bookingId } = this.ctx.params;

    const booking = await this.models.Booking.findOne({
      _id: bookingId,
      user: this.ctx.user._id,
    });

    if (!booking) {
      this.throwError("404", "Booking not found");
    }

    if (booking.status === "cancelled") {
      this.throwError("403", "Booking is already cancelled");
    }

    booking.status = "cancelled";
    try {
      await booking.save();
    } catch (error) {
      this.throwError("301", "Failed to cancel booking");
    }

    this.ctx.body = {
      success: true,
      message: "Booking cancelled successfully",
      data: { booking },
    };
  }
  async updateBookingStatus() {
    const { bookingId } = this.ctx.params;
    const { status } = this.ctx.request.body;

    const booking = await this.models.Booking.findById(bookingId);

    if (!booking) {
      this.throwError("404", "Booking not found");
    }

    booking.status = status;
    try {
      await booking.save();
    } catch (error) {
      this.throwError("301", "Failed to cancel booking");
    }

    this.ctx.body = {
      success: true,
      message: "Booking updated successfully",
      data: { booking },
    };
  }

  async updateBookingDetails() {
    const { bookingId } = this.ctx.params; // Get booking ID from request params
    const { checkInDate, checkOutDate } = this.ctx.request.body; // Extract the new dates from request body

    // Fetch the booking by its ID
    const booking = await this.models.Booking.findById(bookingId);

    console.log("bookind details", booking);

    if (!booking) {
      this.throwError("404", "Booking not found");
    }

    // Check room availability for the new dates, excluding the current booking
    const availabilityResponse = await this.checkAvailabilityForUpdateDetails(
      booking.rooms,
      checkInDate,
      checkOutDate,
      bookingId // Pass the current booking ID to exclude it from availability check
    );

    console.log(availabilityResponse);

    if (!availabilityResponse.success) {
      return this.throwError("400", availabilityResponse.message); // If rooms aren't available, return error
    }

    // Update the booking with new check-in and check-out dates
    booking.checkInDate = checkInDate;
    booking.checkOutDate = checkOutDate;

    await booking.save(); // Save the updated booking

    this.ctx.body = {
      success: true,
      message: "Booking updated successfully",
      booking,
    };
  }

  async checkRoomsAvailability(roomsToCheck, checkInDate, checkOutDate) {
    const roomIds = roomsToCheck.map((room) => room.room);
    const hotelId = roomsToCheck[0].hotelId;

    const roomsInHotel = await this.models.Room.find({
      _id: { $in: roomIds },
      hotel: hotelId,
    });

    if (roomsInHotel.length !== roomIds.length) {
      return {
        success: false,
        message: "One or more rooms not found or don't belong to this hotel",
      };
    }

    for (const roomToCheck of roomsToCheck) {
      const room = roomsInHotel.find((r) => r._id.equals(roomToCheck.room));

      if (!room) {
        return {
          success: false,
          message: `Room with ID ${roomToCheck.room} not found`,
        };
      }

      // Calculate total booked rooms in the requested date range
      let totalBookedRooms = 0;
      for (const booking of room.bookings) {
        const bookingOverlap =
          checkInDate < booking.checkOutDate &&
          checkOutDate > booking.checkInDate;
        if (bookingOverlap) {
          totalBookedRooms += booking.quantity;
        }
      }

      const availableRooms = room.totalRooms - totalBookedRooms;
      if (availableRooms < roomToCheck.quantity) {
        return {
          success: false,
          message: `Not enough available rooms for room ID ${roomToCheck.room}. Only ${availableRooms} available during the requested dates.`,
        };
      }
    }

    return { success: true };
  }
  async checkAvailabilityForUpdateDetails(
    roomsToCheck,
    checkInDate,
    checkOutDate,
    excludeBookingId
  ) {
    const roomIds = roomsToCheck.map((room) => room.room); // Extract room IDs
    const hotelId = roomsToCheck[0].hotelId;

    // Fetch all rooms in the hotel matching the requested room IDs
    const roomsInHotel = await this.models.Room.find({
      _id: { $in: roomIds },
    });

    if (roomsInHotel.length !== roomIds.length) {
      return {
        success: false,
        message: "One or more rooms not found or don't belong to this hotel",
      };
    }

    // Check each room for booking conflicts
    for (const roomToCheck of roomsToCheck) {
      const room = roomsInHotel.find((r) => r._id.equals(roomToCheck.room));

      if (!room) {
        return {
          success: false,
          message: `Room with ID ${roomToCheck.room} not found`,
        };
      }

      // Fetch bookings for this room, excluding the current booking (if editing)
      const overlappingBookings = await this.models.Booking.find({
        "rooms.room": room._id,
        hotel: hotelId,
        _id: { $ne: excludeBookingId }, 
        $or: [
          {
            checkInDate: { $lt: checkOutDate },
            checkOutDate: { $gt: checkInDate },
          },
        ],
      });

      const totalBookedRooms = overlappingBookings.reduce((acc, booking) => {
        const bookedRoom = booking.rooms.find((r) => r.room.equals(room._id));
        return acc + (bookedRoom ? bookedRoom.quantity : 0);
      }, 0);

      const availableRooms = room.totalRooms - totalBookedRooms;

      if (availableRooms < roomToCheck.quantity) {
        return {
          success: false,
          message: `Not enough available rooms for room ID ${roomToCheck.room}. Only ${availableRooms} available during the requested dates.`,
        };
      }
    }

    return { success: true };
  }
}

module.exports = Booking;
