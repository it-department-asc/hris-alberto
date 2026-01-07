import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// ============================================
// USER MIGRATION FUNCTIONS
// ============================================

export async function migrateUserDocuments() {
  try {
    console.log('🔄 Starting user document migration...');

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    let migratedCount = 0;

    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const updates: any = {};

      // Check for missing fields and add defaults
      if (!userData.hasOwnProperty('firstName')) {
        // Try to extract from displayName if it exists
        const displayName = userData.displayName || '';
        const nameParts = displayName.split(' ');
        updates.firstName = nameParts[0] || '';
        updates.lastName = nameParts.slice(1).join(' ') || '';
      }

      // Add missing optional fields with null (Firestore doesn't accept undefined)
      const optionalFields = [
        'middleName',
        'dateOfBirth',
        'gender',
        'civilStatus',
        'nationality',
        'personalEmail',
        'mobileNumber',
        'telephoneNumber',
        'presentAddress',
        'permanentAddress',
        'positionId',
        'hireDate',
        'employmentStatus',
        'emergencyContactName',
        'emergencyContactRelationship',
        'emergencyContactNumber',
        'profilePhotoUrl',
        'bio',
        'createdBy',
        'updatedBy'
      ];

      optionalFields.forEach(field => {
        if (!userData.hasOwnProperty(field)) {
          updates[field] = null;
        }
      });

      // Ensure required fields exist
      if (!userData.hasOwnProperty('employeeId')) {
        updates.employeeId = null;
      }
      if (!userData.hasOwnProperty('departmentId')) {
        updates.departmentId = null;
      }
      if (!userData.hasOwnProperty('isActive')) {
        updates.isActive = true;
      }

      // Update timestamps
      updates.updatedAt = serverTimestamp();

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', userDoc.id), updates);
        migratedCount++;
        console.log(`✅ Migrated user: ${userDoc.id}`);
      }
    }

    console.log(`🎉 Migration completed! Updated ${migratedCount} user documents.`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error('❌ Error during user migration:', error);
    return { success: false, error };
  }
}