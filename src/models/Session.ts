import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED", "COMPLETED"],
      default: "AVAILABLE",
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
