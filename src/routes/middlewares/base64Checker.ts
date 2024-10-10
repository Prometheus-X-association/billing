import { Request, Response, NextFunction } from 'express';
import { decodeFromBase64 } from '../../libs/base64';

// Add this function to check if a string is valid base64
function isValidBase64(str: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str) && str.length % 4 === 0;
}

export const base64Checker = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const base64Param = req.params[paramName];

    if (base64Param && isValidBase64(base64Param)) {
      try {
        const decodedParam = decodeFromBase64(base64Param);
        req.params[paramName] = decodedParam;
        next();
      } catch (error) {
        return res.status(400).json({ error: `Failed to decode base64 string for ${paramName}` });
      }
    } else {
      next();
    }
  };
};