import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);

