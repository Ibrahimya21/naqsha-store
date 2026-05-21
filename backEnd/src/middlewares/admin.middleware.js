export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية الوصول",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
