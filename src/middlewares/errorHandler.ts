import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err.code === 11000) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ error: message });
};
