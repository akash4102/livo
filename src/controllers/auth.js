const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseClass = require("./base");

class Auth extends BaseClass {
  constructor(ctx, next) {
    super(ctx, next);

    this._beforeMethods = {
      logout: ["authenticate"],
      authenticateUser: ["authenticate"],
      updateProfile: ["authenticate"],
      changePassword: ["authenticate"],
      blockAdmin: ["authenticate"],
      toggleUser: ["authenticate"],
      blockUser: ["authenticate"],
      getAllUsers: ["authenticate"],
      getDashboardDetails: ["authenticate"],
    };
  }

  async register() {
    let { value, error } = this.validations.Auth.userRegisterSchema.validate(
      this.ctx.request.body
    );
    if (error) {
      let errorMessage =
        _.size(error.details) > 0 ? error.details[0].message : null;
      this.throwError("201", errorMessage);
    }
    let user = await this.models.User.findOne({ email: value.email });
    if (user) {
      if (user.role !== "admin" && user.password) {
        this.throwError("103", "User already exist");
      }
      user.password = value.password;
      user.name = value.name;
      user.status = "active";
      user.role = "admin";
    } else {
      user = new this.models.User({
        name: value.name,
        email: value.email,
        password: value.password,
        phone: value.phone,
        status: this.schemas.User.constants.status.active,
        role: this.schemas.User.constants.role.user,
      });
    }
    try {
      await user.save();
    } catch (error) {
      this.throwError("301");
    }

    this.ctx.body = {
      success: true,
      message:
        user.role == "admin"
          ? "Admin registered successfully"
          : "User regsitered successfully",
      data: {
        user,
      },
    };
  }

  async login() {
    let { value, error } = this.validations.Auth.userLoginSchema.validate(
      this.ctx.request.body
    );
    if (error) {
      let errorMessage =
        _.size(error.details) > 0 ? error.details[0].message : null;
      this.throwError("201", errorMessage);
    }

    let user = await this.models.User.findOne({ email: value.email });
    if (!user) {
      this.throwError("104", "User not found");
    }
    if (
      user.status === "disabled" ||
      user.status === "deleted" ||
      user.status === "pending"
    ) {
      let message;
      if (user.status === "disabled") message = "account disabled";
      if (user.status === "deleted") message = "account deleted";
      if (user.status === "pending") message = "account created pending";
      this.throwError("400", message);
    }
    const isPasswordValid = await user.verifyPassword(value.password);
    if (!isPasswordValid) {
      this.throwError("202", "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      this.config.application.JWT_SECRET,
      { expiresIn: "30d" }
    );

    if (user.role === "admin") {
      this.admin = true;
    } else {
      this.user = true;
    }

    this.ctx.cookies.set("token", token, {
      httpOnly: true,
      secure: this.env === "production",
      maxAge: 3600000 * 24 * 30,
    });

    this.ctx.body = {
      success: true,
      message: "Login successful",
      token,
      data: {
        user,
      },
    };
  }

  async logout() {
    this.ctx.cookies.set("token", null, {
      httpOnly: true,
      secure: this.env === "production",
      maxAge: 0,
    });
    this.admin = false;
    this.ctx.body = {
      success: true,
      message: "Logged out successfully",
    };
  }

  async authenticateUser() {
    this.ctx.body = {
      success: true,
      user: this.ctx.user,
      message: "authenticate successfully",
    };
  }

  async updateProfile() {
    try {
      let { value, error } = this.validations.Auth.updateProfileSchema.validate(
        this.ctx.request.body
      );
      if (error) {
        let errorMessage =
          _.size(error.details) > 0 ? error.details[0].message : null;
        this.throwError("201", errorMessage);
      }

      let user = await this.models.User.findById(this.ctx.user._id); 
      if (!user) {
        this.throwError("404", "User not found");
      }

      _.assign(user, value);

      await user.save();

      this.ctx.body = {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.name === "ValidationError") {
        this.throwError("201", "Validation failed");
      } else {
        this.throwError("301", "An error occurred while updating the profile");
      }
    }
  }

  async changePassword() {
    try {
      let { value, error } =
        this.validations.Auth.changePasswordSchema.validate(
          this.ctx.request.body
        );
      if (error) {
        let errorMessage =
          _.size(error.details) > 0 ? error.details[0].message : null;
        this.throwError("201", errorMessage);
      }

      const { currentPassword, newPassword } = value;

      let user = await this.models.User.findById(this.ctx.user._id);
      if (!user) {
        this.throwError("404", "User not found");
      }

      const isPasswordValid = await user.verifyPassword(currentPassword);
      if (!isPasswordValid) {
        this.throwError("202", "Current password is incorrect");
      }
      if (await user.verifyPassword(newPassword)) {
        this.throwError(
          "202",
          "New password cannot be the same as the current password"
        );
      }
      user.password = newPassword;

      await user.save();

      this.ctx.body = {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Password change error:", error); 
      throw new Error(this.error.codeMsg);
    }
  }

  async blockUser() {
    try {
      let { value, error } = this.validations.Auth.blockUserSchema.validate(
        this.ctx.request.body
      );
      if (error) {
        let errorMessage =
          _.size(error.details) > 0 ? error.details[0].message : null;
        this.throwError("201", errorMessage);
      }

      if (!this.admin) {
        this.throwError("403", "Only admins can block users");
      }

      let userToBlock = await this.models.User.findById(value.userId);
      if (!userToBlock) {
        this.throwError("404", "User not found");
      }

      userToBlock.status = value.status;
      try {
        await userToBlock.save();
      } catch (error) {
        console.log("actual error", error);
        this.throwError("301", "uable to save data");
      }
      this.ctx.body = {
        success: true,
        message: "status updated successfully",
      };
    } catch (error) {
      console.error("Error blocking user:", error);
      this.throwError("301", "Error blocking user");
    }
  }

  async toggleUser() {
    try {
      let { value, error } = this.validations.Auth.createAdminSchema.validate(
        this.ctx.request.body
      );
      if (error) {
        let errorMessage =
          _.size(error.details) > 0 ? error.details[0].message : null;
        this.throwError("201", errorMessage);
      }
      if (this.ctx.user.role !== "admin") {
        this.throwError("403", "Only admins can create new admin users");
      }

      let user = await this.models.User.findById(value.userId);
      user.role = value.role;
      await user.save();
      this.ctx.body = {
        success: true,
        message: "Admin created successfully",
      };
    } catch (error) {
      console.error("Error creating admin:", error);
      this.throwError("301", "Error creating admin");
    }
  }

  async getAllUsers() {
    try {
      const { page = 1, limit = 10 } = this.ctx.query;
      const users = await this.models.User.find()
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await this.models.User.countDocuments();

      this.ctx.body = {
        success: true,
        message: "Users fetched successfully",
        data: { users, total },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      this.throwError("301", "Error fetching users");
    }
  }

  async getDashboardDetails() {
    try {
      // Check if the current user is an admin
      if (!this.admin) {
        this.throwError("403", "Only admins can access this resource");
      }

      // Use Promise.all to fetch all dashboard data concurrently
      const [
        // Hotel-related data
        totalHotels,
        activeHotels,
        disabledHotels,
        deletedHotels,

        // Booking-related data
        totalBookings,
        completedBookings,
        cancelledBookings,
        activeBookings,

        // User-related data
        totalUsers,
        totalAdmins,
        totalCustomers,
        activeAdmins,
        activeUsers,
        disabledAdmins,
        disabledUsers,
        deletedAdmins,
        deletedUsers,

        // Room-related data
        totalRooms,
        availableRooms,
        maintenanceRooms,
        bookedRooms,
      ] = await Promise.all([
        // Hotels
        this.models.Hotel.countDocuments(), // Total hotels
        this.models.Hotel.countDocuments({ status: "active" }), // Active hotels
        this.models.Hotel.countDocuments({ status: "disabled" }), // Disabled hotels
        this.models.Hotel.countDocuments({ status: "deleted" }), // Deleted hotels

        // Bookings
        this.models.Booking.countDocuments(), // Total bookings
        this.models.Booking.countDocuments({ status: "completed" }), // Completed bookings
        this.models.Booking.countDocuments({ status: "cancelled" }), // Cancelled bookings
        this.models.Booking.countDocuments({ status: "booked" }), // Active bookings

        // Users
        this.models.User.countDocuments(), // Total users
        this.models.User.countDocuments({ role: "admin" }), // Total admins
        this.models.User.countDocuments({ role: "user" }), // Total users/customers
        this.models.User.countDocuments({ role: "admin", status: "active" }), // Active admins
        this.models.User.countDocuments({ role: "user", status: "active" }), // Active users
        this.models.User.countDocuments({ role: "admin", status: "disabled" }), // Disabled admins
        this.models.User.countDocuments({ role: "user", status: "disabled" }), // Disabled users
        this.models.User.countDocuments({ role: "admin", status: "deleted" }), // Deleted admins
        this.models.User.countDocuments({ role: "user", status: "deleted" }), // Deleted users

        // Rooms
        this.models.Room.countDocuments(), // Total rooms
        this.models.Room.countDocuments({ status: "available" }), // Available rooms
        this.models.Room.countDocuments({ status: "maintenance" }), // Maintenance rooms
        this.models.Room.countDocuments({ status: "booked" }), // Booked rooms
      ]);

      // Return the aggregated data in the response
      this.ctx.body = {
        success: true,
        message: "Dashboard details fetched successfully",
        data: {
          totalHotels,
          activeHotels,
          disabledHotels,
          deletedHotels,
          totalBookings,
          completedBookings,
          cancelledBookings,
          activeBookings,
          totalUsers,
          totalAdmins,
          totalCustomers,
          activeAdmins,
          activeUsers,
          disabledAdmins,
          disabledUsers,
          deletedAdmins,
          deletedUsers,
          totalRooms,
          availableRooms,
          maintenanceRooms,
          bookedRooms,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard details:", error);
      this.throwError("500", "Error fetching dashboard details");
    }
  }
}

module.exports = Auth;
