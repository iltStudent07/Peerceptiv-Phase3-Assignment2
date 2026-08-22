import Console from "../models/Console.js";
import AppError from '../utils/AppError.js'

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403))
    }
    next();
  };
}

// owner OR admin for routes with :id
export async function authorizeConsoleOwnerOrAdmin(req, res, next) {
  try {
    const consoleDoc = await Console.findById(req.params.id);
    if (!consoleDoc) {
      return next(new AppError('Console not found', 404))
    }

    const isOwner = consoleDoc.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return next(new AppError('Forbidden', 403))
    }

    req.consoleDoc = consoleDoc;
    next();
  } catch (err) {
    return next(err)
  }
}