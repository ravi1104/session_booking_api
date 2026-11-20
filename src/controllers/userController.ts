import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Session } from "../models/Session";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      res.status(400).json({ error: "fullName, email and phone are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const user = await User.create({ fullName, email, phone });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(id);

    const result = await Session.aggregate([
      {
        $match: {
          userId: userObjectId,
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          upcomingSessions: [
            { $match: { status: "BOOKED" } },
            { $sort: { startTime: 1 } },
          ],
          completedSessions: [
            { $match: { status: "COMPLETED" } },
            { $sort: { completedAt: -1 } },
          ],
        },
      },
    ]);

    const sessions = result[0] || {
      upcomingSessions: [],
      completedSessions: [],
    };

    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};
