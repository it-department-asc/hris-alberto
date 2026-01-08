import { Department } from '@/types';
import toast from 'react-hot-toast';

interface ProfileSeedData {
  firstName?: string;
  lastName?: string;
  middleName: string;
  personalEmail: string;
  mobileNumber: string;
  telephoneNumber: string;
  presentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
  bio: string;
  employeeId: string;
  departmentId: string;
}

interface ProfileSeederProps {
  departments: Department[];
  onSeed: (data: ProfileSeedData) => void;
}

const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Christopher', 'Olivia',
  'Daniel', 'Sophia', 'Matthew', 'Isabella', 'Anthony', 'Mia', 'Mark', 'Charlotte',
  'Joseph', 'Amelia', 'Andrew', 'Harper', 'Joshua', 'Evelyn', 'Samuel', 'Abigail'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const middleNames = [
  'James', 'Marie', 'Alexander', 'Rose', 'William', 'Grace', 'Elizabeth', 'Thomas',
  'Catherine', 'Robert', 'Margaret', 'Edward', 'Patricia', 'Charles', 'Barbara',
  'George', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Susan', 'Daniel', 'Margaret'
];

const cities = [
  'Springfield', 'Riverside', 'Fairview', 'Madison', 'Georgetown', 'Franklin',
  'Clinton', 'Birmingham', 'Ashland', 'Dover', 'Manchester', 'Lexington',
  'Montgomery', 'Richmond', 'Concord', 'Harrisburg', 'Trenton', 'Albany'
];

const streets = [
  'Main Street', 'Oak Avenue', 'Maple Drive', 'Cedar Lane', 'Pine Road',
  'Elm Street', 'Washington Avenue', 'Lincoln Boulevard', 'Jefferson Street',
  'Adams Drive', 'Madison Lane', 'Monroe Road', 'Jackson Street', 'Grant Avenue'
];

const relationships = [
  'Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Colleague', 'Neighbor'
];

const bios = [
  'Experienced professional with a passion for technology and innovation. Committed to delivering high-quality solutions and fostering team collaboration.',
  'Dedicated team player with strong analytical skills and a proven track record in project management. Always eager to learn and grow professionally.',
  'Creative problem-solver with excellent communication skills. Passionate about creating positive impact and driving organizational success.',
  'Detail-oriented professional with extensive experience in operations and customer service. Focused on continuous improvement and excellence.',
  'Dynamic leader with strong interpersonal skills and a commitment to employee development. Excels in fast-paced environments.',
  'Innovative thinker with a background in data analysis and strategic planning. Dedicated to achieving organizational goals through collaboration.'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1-${areaCode}-${exchange.toString().padStart(3, '0')}${number}`;
}

function generateAddress(): string {
  const number = Math.floor(Math.random() * 9999) + 1;
  const street = getRandomElement(streets);
  const city = getRandomElement(cities);
  const state = ['IL', 'CA', 'NY', 'TX', 'FL', 'PA', 'OH', 'GA'][Math.floor(Math.random() * 8)];
  const zip = Math.floor(Math.random() * 90000) + 10000;
  return `${number} ${street}, ${city}, ${state} ${zip}`;
}

function generateEmployeeId(): string {
  const prefix = 'AG_';
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${prefix}${number.toString().padStart(4, '0')}`;
}

export function ProfileSeeder({ departments, onSeed }: ProfileSeederProps) {
  const handleSeedProfile = () => {
    const middleName = getRandomElement(middleNames);

    // Get a random department if available
    const randomDepartment = departments.length > 0
      ? departments[Math.floor(Math.random() * departments.length)]
      : null;

    // Generate random email
    const randomFirst = getRandomElement(firstNames);
    const randomLast = getRandomElement(lastNames);

    const seedData: ProfileSeedData = {
      middleName,
      personalEmail: `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}@example.com`,
      mobileNumber: generatePhoneNumber(),
      telephoneNumber: generatePhoneNumber(),
      presentAddress: generateAddress(),
      permanentAddress: generateAddress(),
      emergencyContactName: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      emergencyContactRelationship: getRandomElement(relationships),
      emergencyContactNumber: generatePhoneNumber(),
      bio: getRandomElement(bios),
      employeeId: generateEmployeeId(),
      departmentId: randomDepartment?.id || '',
    };

    onSeed(seedData);
    toast.success('Profile filled with random sample data!');
  };

  return (
    <button
      onClick={handleSeedProfile}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-all"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      Fill Sample Data
    </button>
  );
}