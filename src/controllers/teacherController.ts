import { Request, Response, NextFunction } from "express";
import { Teacher } from "../models/Teacher";

export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, specialization, experience } = req.body;

    if (!fullName || !email || !specialization || experience === undefined) {
      res.status(400).json({
        error: "fullName, email, specialization and experience are required",
      });
      return;
    }

    const teacher = await Teacher.create({
      fullName,
      email,
      specialization,
      experience,
    });

    res.status(201).json(teacher);
  } catch (error) {
    next(error);
  }
};

export const getTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    next(error);
  }
};
