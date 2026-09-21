const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validateStudentBody, validateIdParam } = require('../middlewares/validate');

// 1. Create a new student
router.post('/', validateStudentBody, studentController.createStudent);

// 2. Get all students
router.get('/', studentController.getAllStudents);

// 3. Get student by ID
router.get('/:id', validateIdParam, studentController.getStudentById);

// 4. Update student by ID
router.put('/:id', validateIdParam, validateStudentBody, studentController.updateStudent);

// 5. Delete student by ID
router.delete('/:id', validateIdParam, studentController.deleteStudent);

module.exports = router;
