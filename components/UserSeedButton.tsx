'use client';

import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createEmployee, generateNextEmployeeId } from '@/lib/firebase/employees';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';

// Sample data for generating random users
const firstNames = [
  'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena',
  'Miguel', 'Sofia', 'Antonio', 'Isabella', 'Francisco', 'Camila', 'Rafael',
  'Valentina', 'Gabriel', 'Lucia', 'Diego', 'Mariana', 'Andres', 'Paula',
  'Fernando', 'Daniela', 'Ricardo', 'Natalia', 'Jorge', 'Andrea', 'Luis', 'Carmen'
];

const lastNames = [
  'Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Flores',
  'Gonzales', 'Ramos', 'Cruz', 'Lopez', 'Martinez', 'Rodriguez', 'Hernandez',
  'Perez', 'Sanchez', 'Rivera', 'Morales', 'Gutierrez', 'Castro', 'Romero',
  'Diaz', 'Vargas', 'Jimenez', 'Ruiz', 'Alvarez', 'Fernandez', 'Silva', 'Rojas', 'Ortiz'
];

const middleNames = [
  'Aguinaldo', 'Bautista', 'Concepcion', 'Dimaculangan', 'Espiritu',
  'Francisco', 'Galang', 'Hipolito', 'Ignacio', 'Javier', 'Kapunan',
  'Lacsamana', 'Magsaysay', 'Navarro', 'Ocampo', 'Panganiban', 'Quizon',
  'Rizal', 'Salazar', 'Tolentino', 'Uy', 'Villanueva', 'Yap', 'Zamora'
];

const roles: UserRole[] = ['admin', 'hr', 'payroll', 'manager', 'employee'];
const employmentStatuses = ['regular', 'probationary', 'contractual', 'part-time'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhoneNumber(): string {
  const prefix = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0927', '0928', '0929'];
  const randomPrefix = getRandomElement(prefix);
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
  return `${randomPrefix}${randomNumber}`;
}

function generateRandomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

interface UserSeedButtonProps {
  createdBy: string;
  departments: { id: string; name: string }[];
  onComplete: () => void;
}

export function UserSeedButton({ createdBy, departments, onComplete }: UserSeedButtonProps) {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedUsers = async () => {
    if (departments.length === 0) {
      toast.error('Please seed departments first before creating users');
      return;
    }

    setIsSeeding(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Create 5 users with different roles
      for (let i = 0; i < 5; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const middleName = getRandomElement(middleNames);
        const role = roles[i % roles.length]; // Cycle through roles
        const department = getRandomElement(departments);
        const employeeId = await generateNextEmployeeId();
        
        // Generate unique email
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}${randomNum}@company.com`;
        
        // Random hire date between 2020 and 2025
        const hireDate = generateRandomDate(2020, 2025);
        const employmentStatus = getRandomElement(employmentStatuses);

        try {
          await createEmployee({
            email,
            password: 'Password123!', // Default password
            firstName,
            lastName,
            middleName,
            role,
            departmentId: department.id,
            employeeId,
            mobileNumber: generatePhoneNumber(),
            personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            hireDate,
            employmentStatus,
          }, createdBy);

          successCount++;
          toast.success(`Created ${firstName} ${lastName} (${role})`, { duration: 2000 });
        } catch (error: any) {
          console.error(`Error creating user ${firstName} ${lastName}:`, error);
          errorCount++;
          // Continue with other users even if one fails
        }

        // Small delay between creations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} users!`);
        onComplete();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} users`);
      }
    } catch (error) {
      console.error('Error seeding users:', error);
      toast.error('Failed to seed users');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSeedUsers}
      disabled={isSeeding}
      className="gap-2"
    >
      {isSeeding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Users...
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          Seed 5 Users
        </>
      )}
    </Button>
  );
}
