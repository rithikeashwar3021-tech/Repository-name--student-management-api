// UUID v4 format regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Middleware to validate student request body for creation and update.
 * Required fields:
 * - name: non-empty string
 * - rollNumber: non-empty string
 * - department: non-empty string
 * - year: integer between 1 and 4
 */
const validateStudentBody = (req, res, next) => {
  const { name, rollNumber, department, year } = req.body;
  const errors = [];

  // Validate name
  if (name === undefined || name === null || typeof name !== 'string' || name.trim() === '') {
    errors.push('The "name" field is required and must be a non-empty string.');
  }

  // Validate rollNumber
  if (rollNumber === undefined || rollNumber === null || typeof rollNumber !== 'string' || rollNumber.trim() === '') {
    errors.push('The "rollNumber" field is required and must be a non-empty string.');
  }

  // Validate department
  if (department === undefined || department === null || typeof department !== 'string' || department.trim() === '') {
    errors.push('The "department" field is required and must be a non-empty string.');
  }

  // Validate year: strictly an integer between 1 and 4
  if (
    year === undefined ||
    year === null ||
    typeof year !== 'number' ||
    !Number.isInteger(year) ||
    year < 1 ||
    year > 4
  ) {
    errors.push('The "year" field is required and must be an integer between 1 and 4.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize trimmed strings in req.body
  req.body.name = name.trim();
  req.body.rollNumber = rollNumber.trim();
  req.body.department = department.trim();
  req.body.year = year;

  next();
};

/**
 * Middleware to validate that the :id route parameter is a valid UUID.
 */
const validateIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id || !UUID_REGEX.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student ID format. Must be a valid UUID.'
    });
  }

  next();
};

module.exports = {
  validateStudentBody,
  validateIdParam
};
