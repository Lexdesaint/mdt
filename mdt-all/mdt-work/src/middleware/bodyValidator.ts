import { Request, Response, NextFunction } from "express";

export const bodyValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip body validation for multipart/form-data requests (file uploads)
  const contentType = req.get('Content-Type');
  if (contentType && contentType.includes('multipart/form-data')) {
    return next();
  }

  // Check if request has a body
  if (!req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
    return res.status(400).json({
      success: false,
      message: 'Request body is required for this operation'
    });
  }

  // Validate body structure
  if (req.body && typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object'
    });
  }

  // Check for empty body when body is expected
  if (req.body && Object.keys(req.body).length === 0 && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH')) {
    return res.status(400).json({
      success: false,
      message: 'Request body cannot be empty'
    });
  }

  next();
};