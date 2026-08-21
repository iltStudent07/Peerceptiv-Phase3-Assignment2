import Console from "../models/Console.js";

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// owner OR admin for routes with :id
export async function authorizeConsoleOwnerOrAdmin(req, res, next) {
  try {
    const consoleDoc = await Console.findById(req.params.id);
    if (!consoleDoc) {
      return res.status(404).json({ error: "Console not found" });
    }

    const isOwner = consoleDoc.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.consoleDoc = consoleDoc;
    next();
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid console ID format" });
    }
    return res.status(500).json({ error: err.message });
  }
}