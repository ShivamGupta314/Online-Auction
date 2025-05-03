// src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      res.status(400).json({
        error: err.errors.map(e => e.message)
      })
    }
  }
  