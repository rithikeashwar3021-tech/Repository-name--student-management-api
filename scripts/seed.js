require('dotenv').config();
const supabase = require('../src/config/supabase');

const sampleStudents = [
  {
    name: 'Aarav Sharma',
    roll_number: 'CS-2024-001',
    department: 'Computer Science',
    year: 2
  },
  {
    name: 'Diya Patel',
    roll_number: 'EC-2023-014',
    department: 'Electronics and Communication',
    year: 3
  },
  {
    name: 'Rohan Verma',
    roll_number: 'ME-2025-022',
    department: 'Mechanical Engineering',
    year: 1
  },
  {
    name: 'Priya Nair',
    roll_number: 'IT-2022-008',
    department: 'Information Technology',
    year: 4
  },
  {
    name: 'Sneha Rao',
    roll_number: 'CS-2024-045',
    department: 'Computer Science',
    year: 2
  },
  {
    name: 'Kabir Mehta',
    roll_number: 'EE-2023-019',
    department: 'Electrical Engineering',
    year: 3
  },
  {
    name: 'Ananya Gupta',
    roll_number: 'CE-2025-005',
    department: 'Civil Engineering',
    year: 1
  }
];

async function seed() {
  console.log('🌱 Seeding sample student records into Supabase...');

  for (const student of sampleStudents) {
    const { data, error } = await supabase
      .from('students')
      .upsert(student, { onConflict: 'roll_number' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to seed ${student.name} (${student.roll_number}):`, error.message);
    } else {
      console.log(`✅ Seeded: ${data.name} | Roll: ${data.roll_number} | Dept: ${data.department} | Year: ${data.year} (ID: ${data.id})`);
    }
  }

  console.log('✨ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
