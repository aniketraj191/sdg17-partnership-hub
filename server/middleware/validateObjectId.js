import mongoose from 'mongoose';

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid identifier format: '${id}' is not a valid MongoDB ObjectId`,
      });
    }
    next();
  };
};
