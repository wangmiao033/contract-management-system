import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  const response: ErrorResponse = {
    message: err.message || '服务器内部错误',
  };

  // 开发环境下返回错误堆栈
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: '请求的资源不存在' });
}; 