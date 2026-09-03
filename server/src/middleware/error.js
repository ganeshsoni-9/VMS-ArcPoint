export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found", errors: [] });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate entry", errors: [] });
  }
  if (err.name === "ValidationError" || err.zodIssues) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.zodIssues || Object.values(err.errors || {}).map((e) => e.message),
    });
  }

  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;
  res.status(status).json({ success: false, message, errors: [] });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = new Error("Validation failed");
      error.status = 422;
      error.zodIssues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return next(error);
    }
    req.body = result.data;
    next();
  };
}
