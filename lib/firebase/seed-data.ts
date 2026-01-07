import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// DEPARTMENTS DATA
// ============================================
export const departments = [
  { code: 'ADMIN', name: 'Admin Department', description: 'Administrative and executive operations' },
  { code: 'ACCTG', name: 'Accounting Department', description: 'Financial accounting and reporting' },
  { code: 'AUDIT', name: 'Audit Department', description: 'Internal audit and compliance' },
  { code: 'BUY', name: 'Buying Department', description: 'Procurement and purchasing' },
  { code: 'CRTV', name: 'Creative Department', description: 'Design and creative services' },
  { code: 'CS', name: 'Customer Service Department', description: 'Customer support and relations' },
  { code: 'ECOM', name: 'Ecommerce Department', description: 'Online sales and digital commerce' },
  { code: 'HR', name: 'HR Department', description: 'Human resources and people operations' },
  { code: 'IT', name: 'IT Department', description: 'Information technology and systems' },
  { code: 'INV', name: 'Inventory Department', description: 'Stock and inventory management' },
  { code: 'LOG', name: 'Logistic Department', description: 'Logistics and supply chain' },
  { code: 'MKT', name: 'Marketing Department', description: 'Marketing and brand management' },
  { code: 'MERCH', name: 'Merchandising Department', description: 'Product merchandising' },
  { code: 'SALES', name: 'Sales & Operations Department', description: 'Sales and store operations' },
  { code: 'VM', name: 'Visual Merchandising Department', description: 'Visual displays and store aesthetics' },
  { code: 'WH', name: 'Warehouse Department', description: 'Warehouse and distribution' },
];

// ============================================
// LEAVE TYPES DATA
// ============================================
export const leaveTypes = [
  { 
    code: 'VL', 
    name: 'Vacation Leave', 
    defaultDays: 15, 
    isPaid: true, 
    requiresDocument: false,
    allowHalfDay: true,
    allowCarryOver: true,
    maxCarryOverDays: 5,
    description: 'Annual vacation leave for rest and recreation'
  },
  { 
    code: 'SL', 
    name: 'Sick Leave', 
    defaultDays: 10, 
    isPaid: true, 
    requiresDocument: true,
    allowHalfDay: true,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave for illness or medical appointments'
  },
  { 
    code: 'EL', 
    name: 'Emergency Leave', 
    defaultDays: 3, 
    isPaid: true, 
    requiresDocument: false,
    allowHalfDay: false,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave for urgent personal emergencies'
  },
  { 
    code: 'BL', 
    name: 'Bereavement Leave', 
    defaultDays: 5, 
    isPaid: true, 
    requiresDocument: true,
    allowHalfDay: false,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave due to death of immediate family member'
  },
  { 
    code: 'ML', 
    name: 'Maternity Leave', 
    defaultDays: 105, 
    isPaid: true, 
    requiresDocument: true,
    allowHalfDay: false,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave for childbirth and recovery (RA 11210)'
  },
  { 
    code: 'PL', 
    name: 'Paternity Leave', 
    defaultDays: 7, 
    isPaid: true, 
    requiresDocument: true,
    allowHalfDay: false,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave for fathers after childbirth (RA 8187)'
  },
  { 
    code: 'SPL', 
    name: 'Solo Parent Leave', 
    defaultDays: 7, 
    isPaid: true, 
    requiresDocument: true,
    allowHalfDay: true,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave for solo parents (RA 8972)'
  },
  { 
    code: 'VAWC', 
    name: 'VAWC Leave', 
    defaultDays: 10, 
    isPaid: true, 
    requiresDocument: true,
    allowHalfDay: false,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave for victims of violence against women and children (RA 9262)'
  },
  { 
    code: 'UL', 
    name: 'Unpaid Leave', 
    defaultDays: 0, 
    isPaid: false, 
    requiresDocument: false,
    allowHalfDay: true,
    allowCarryOver: false,
    maxCarryOverDays: 0,
    description: 'Leave without pay'
  },
];

// ============================================
// WORK SCHEDULES DATA
// ============================================
export const workSchedules = [
  {
    name: 'Regular Day Shift',
    startTime: '08:00',
    endTime: '17:00',
    breakDuration: 60,
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    graceMinutes: 15,
    isDefault: true,
  },
  {
    name: 'Regular with Saturday',
    startTime: '08:00',
    endTime: '17:00',
    breakDuration: 60,
    workDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    graceMinutes: 15,
    isDefault: false,
  },
  {
    name: 'Mid Shift',
    startTime: '10:00',
    endTime: '19:00',
    breakDuration: 60,
    workDays: [1, 2, 3, 4, 5],
    graceMinutes: 15,
    isDefault: false,
  },
  {
    name: 'Night Shift',
    startTime: '22:00',
    endTime: '07:00',
    breakDuration: 60,
    workDays: [1, 2, 3, 4, 5],
    graceMinutes: 15,
    isDefault: false,
  },
  {
    name: 'Retail Shift',
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    workDays: [0, 1, 2, 3, 4, 5, 6], // Sunday to Saturday (shifting schedule)
    graceMinutes: 10,
    isDefault: false,
  },
];

// ============================================
// HOLIDAYS 2026 DATA (Philippines)
// ============================================
export const holidays2026 = [
  // Regular Holidays
  { name: "New Year's Day", date: '2026-01-01', type: 'regular', isRecurring: true },
  { name: 'Araw ng Kagitingan', date: '2026-04-09', type: 'regular', isRecurring: true },
  { name: 'Maundy Thursday', date: '2026-04-02', type: 'regular', isRecurring: false },
  { name: 'Good Friday', date: '2026-04-03', type: 'regular', isRecurring: false },
  { name: 'Labor Day', date: '2026-05-01', type: 'regular', isRecurring: true },
  { name: 'Independence Day', date: '2026-06-12', type: 'regular', isRecurring: true },
  { name: 'National Heroes Day', date: '2026-08-31', type: 'regular', isRecurring: false },
  { name: 'Bonifacio Day', date: '2026-11-30', type: 'regular', isRecurring: true },
  { name: 'Christmas Day', date: '2026-12-25', type: 'regular', isRecurring: true },
  { name: 'Rizal Day', date: '2026-12-30', type: 'regular', isRecurring: true },
  
  // Special Non-Working Holidays
  { name: 'Chinese New Year', date: '2026-02-17', type: 'special-non-working', isRecurring: false },
  { name: 'EDSA Revolution Anniversary', date: '2026-02-25', type: 'special-non-working', isRecurring: true },
  { name: 'Black Saturday', date: '2026-04-04', type: 'special-non-working', isRecurring: false },
  { name: 'Ninoy Aquino Day', date: '2026-08-21', type: 'special-non-working', isRecurring: true },
  { name: "All Saints' Day", date: '2026-11-01', type: 'special-non-working', isRecurring: true },
  { name: "All Souls' Day", date: '2026-11-02', type: 'special-non-working', isRecurring: true },
  { name: 'Feast of Immaculate Conception', date: '2026-12-08', type: 'special-non-working', isRecurring: true },
  { name: 'Christmas Eve', date: '2026-12-24', type: 'special-non-working', isRecurring: true },
  { name: "New Year's Eve", date: '2026-12-31', type: 'special-non-working', isRecurring: true },
];

// ============================================
// SEED FUNCTIONS
// ============================================

export async function seedDepartments() {
  const collectionRef = collection(db, 'departments');
  const now = Timestamp.now();
  
  for (const dept of departments) {
    const docRef = doc(collectionRef);
    await setDoc(docRef, {
      id: docRef.id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      managerId: null,
      parentDepartmentId: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  console.log(`✅ Seeded ${departments.length} departments`);
}

export async function seedLeaveTypes() {
  const collectionRef = collection(db, 'leaveTypes');
  const now = Timestamp.now();
  
  for (const leaveType of leaveTypes) {
    const docRef = doc(collectionRef);
    await setDoc(docRef, {
      id: docRef.id,
      name: leaveType.name,
      code: leaveType.code,
      description: leaveType.description,
      defaultDays: leaveType.defaultDays,
      isPaid: leaveType.isPaid,
      requiresDocument: leaveType.requiresDocument,
      allowHalfDay: leaveType.allowHalfDay,
      allowCarryOver: leaveType.allowCarryOver,
      maxCarryOverDays: leaveType.maxCarryOverDays,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  console.log(`✅ Seeded ${leaveTypes.length} leave types`);
}

export async function seedWorkSchedules() {
  const collectionRef = collection(db, 'workSchedules');
  const now = Timestamp.now();
  
  for (const schedule of workSchedules) {
    const docRef = doc(collectionRef);
    await setDoc(docRef, {
      id: docRef.id,
      name: schedule.name,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakDuration: schedule.breakDuration,
      workDays: schedule.workDays,
      graceMinutes: schedule.graceMinutes,
      isDefault: schedule.isDefault,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  console.log(`✅ Seeded ${workSchedules.length} work schedules`);
}

export async function seedHolidays() {
  const collectionRef = collection(db, 'holidays');
  const now = Timestamp.now();
  
  for (const holiday of holidays2026) {
    const docRef = doc(collectionRef);
    await setDoc(docRef, {
      id: docRef.id,
      name: holiday.name,
      date: Timestamp.fromDate(new Date(holiday.date)),
      type: holiday.type,
      isRecurring: holiday.isRecurring,
      year: 2026,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  console.log(`✅ Seeded ${holidays2026.length} holidays for 2026`);
}

export async function seedSystemSettings() {
  const docRef = doc(db, 'settings', 'system');
  const now = Timestamp.now();
  
  await setDoc(docRef, {
    id: 'system',
    companyName: 'Company Name',
    companyLogo: null,
    companyAddress: 'Company Address, City, Philippines',
    companyPhone: '+63 2 1234 5678',
    companyEmail: 'hr@company.com',
    
    // Philippine government contribution rates (2026)
    sssEmployerShare: 9.5, // percentage
    philHealthEmployerShare: 2.25, // percentage
    pagIbigEmployerShare: 2, // percentage (fixed for most)
    
    defaultWorkScheduleId: null, // Will be set after seeding work schedules
    
    updatedAt: now,
    updatedBy: 'system',
  });
  
  console.log('✅ Seeded system settings');
}

// Check if collection is empty
async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(query(collectionRef));
  return snapshot.empty;
}

// Main seed function
export async function seedAllData(force: boolean = false) {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Seed departments
    if (force || await isCollectionEmpty('departments')) {
      await seedDepartments();
    } else {
      console.log('⏭️  Departments already exist, skipping...');
    }
    
    // Seed leave types
    if (force || await isCollectionEmpty('leaveTypes')) {
      await seedLeaveTypes();
    } else {
      console.log('⏭️  Leave types already exist, skipping...');
    }
    
    // Seed work schedules
    if (force || await isCollectionEmpty('workSchedules')) {
      await seedWorkSchedules();
    } else {
      console.log('⏭️  Work schedules already exist, skipping...');
    }
    
    // Seed holidays
    if (force || await isCollectionEmpty('holidays')) {
      await seedHolidays();
    } else {
      console.log('⏭️  Holidays already exist, skipping...');
    }
    
    // Seed system settings
    if (force || await isCollectionEmpty('settings')) {
      await seedSystemSettings();
    } else {
      console.log('⏭️  System settings already exist, skipping...');
    }
    
    console.log('\n✅ Database seeding completed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error };
  }
}
