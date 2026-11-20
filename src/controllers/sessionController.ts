import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Session } from "../models/Session";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { teacherId, startTime, endTime } = req.body;

    if (!teacherId || !startTime || !endTime) {
      res
        .status(400)
        .json({ error: "teacherId, startTime and endTime are required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      res.status(400).json({ error: "Invalid teacher ID" });
      return;
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    if (endDate <= startDate) {
      res.status(400).json({ error: "endTime must be greater than startTime" });
      return;
    }

    const session = await Session.create({
      teacherId,
      startTime: startDate,
      endTime: endDate,
      status: "AVAILABLE",
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getAvailableSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dateTimestamp } = req.query;

    if (!dateTimestamp) {
      res
        .status(400)
        .json({ error: "dateTimestamp query parameter is required" });
      return;
    }

    let timestampNumber = Number(dateTimestamp);
    if (isNaN(timestampNumber)) {
      res.status(400).json({ error: "Invalid dateTimestamp" });
      return;
    }

    if (timestampNumber < 10000000000) {
      timestampNumber = timestampNumber * 1000;
    }

    const targetDate = new Date(timestampNumber);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: "Invalid timestamp date" });
      return;
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await Session.aggregate([
      {
        $match: {
          status: "AVAILABLE",
          startTime: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
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
        $sort: { startTime: 1 },
      },
    ]);

    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

export const bookSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      res.status(400).json({ error: "Invalid session ID or user ID" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.status !== "AVAILABLE") {
      res
        .status(400)
        .json({ error: "Only AVAILABLE sessions can be booked" });
      return;
    }

    session.status = "BOOKED";
    session.userId = user._id;
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

export const completeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid session ID" });
      return;
    }

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.status !== "BOOKED") {
      res
        .status(400)
        .json({ error: "Only BOOKED sessions can be marked as completed" });
      return;
    }

    session.status = "COMPLETED";
    session.completedAt = new Date();
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};
