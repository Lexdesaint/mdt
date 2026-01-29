import express, { Request, Response, NextFunction } from "express";

export const bodySizeLimit = express.json({ 
  limit: '500mb',
  verify: (req: Request, res: Response, buf: Buffer) => {
    if (buf.length > 500 * 1024 * 1024) { // 500MB in bytes
      const error = new Error('Request body too large') as any;
      error.status = 413;
      error.type = 'entity.too.large';
      throw error;
    }
  }
});

export const urlencodedParser = express.urlencoded({ 
  extended: true, 
  limit: '500mb' 
});


export const bodyParsingErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body too large. Maximum size is 500MB.'
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body'
    });
  } 

  if (err.status === 400 && err.body) {
    return res.status(400).json({
      success: false,
      message: 'Malformed request body'
    });
  }

  next(err);
};


