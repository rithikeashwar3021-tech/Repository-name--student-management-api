const supabase = require('../config/supabase');

/**
 * Helper function to format database record (snake_case)
 * to API response format (camelCase).
 */
const formatStudent = (student) => {
  if (!student) return null;
  return {
    id: student.id,
    name: student.name,
    rollNumber: student.roll_number,
    department: student.department,
    year: student.year
  };
};

/**
 * 1. Create a new student
 * POST /api/students
 */
const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, department, year } = req.body;

    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name,
          roll_number: rollNumber,
          department,
          year
        }
      ])
      .select()
      .single();

    if (error) {
      return next(error);
    }

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: formatStudent(data)
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * 2. Get all students
 * GET /api/students
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return next(error);
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data.map(formatStudent)
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * 3. Get student by ID
 * GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: formatStudent(data)
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * 4. Update student by ID
 * PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, rollNumber, department, year } = req.body;

    const { data, error } = await supabase
      .from('students')
      .update({
        name,
        roll_number: rollNumber,
        department,
        year,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: formatStudent(data)
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * 5. Delete student by ID
 * DELETE /api/students/:id
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
