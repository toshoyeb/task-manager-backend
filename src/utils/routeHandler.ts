import { Request, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>;

export const routeHandler = (fn: AsyncRouteHandler): AsyncRouteHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await fn(req, res);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.message || "Something went wrong",
      });
    }
  };
};
