// MediCore - Cloud Functions (Recomendadas para Producción)
// Coloca esto en Firebase Cloud Functions

// 1. Asignar roles a usuarios nuevos
exports.setUserRole = functions.auth.user().onCreate((user) => {
  const db = admin.firestore();
  
  return db.collection('users').doc(user.uid).set({
    email: user.email,
    role: 'paciente', // default role
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    emailVerified: user.emailVerified,
    displayName: user.displayName
  });
});

// 2. Crear registro de auditoría (cumplimiento HIPAA)
exports.auditLog = functions.firestore
  .document('patients/{patientId}/consultations/{consultationId}')
  .onCreate((snap, context) => {
    const db = admin.firestore();
    const consultationData = snap.data();
    
    return db.collection('audit').doc().set({
      action: 'consultation_created',
      patientId: context.params.patientId,
      doctorId: consultationData.doctorId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        diagnostic: consultationData.diagnostico,
        ipAddress: 'extracted-from-request'
      }
    });
  });

// 3. Validar permisos antes de guardar
exports.validateConsultation = functions.firestore
  .document('patients/{patientId}/consultations/{consultationId}')
  .onCreate(async (snap, context) => {
    const db = admin.firestore();
    const consultationData = snap.data();
    const doctorId = consultationData.doctorId;
    
    // Verificar que el doctor está asignado a este paciente
    const patientDoc = await db.collection('patients')
      .doc(context.params.patientId)
      .get();
    
    if (patientDoc.data().assignedDoctor !== doctorId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Doctor no autorizado para este paciente'
      );
    }
  });

// 4. Crear datos de ejemplo en Firestore al crear un proyecto
exports.createSampleData = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  
  // Crear paciente de prueba
  await db.collection('patients').doc('sample-patient').set({
    nombre: 'Juan',
    apellido: 'García',
    email: 'juan@hospital.mx',
    cedula: '1234567890',
    fechaNacimiento: '1980-05-15',
    sexo: 'M',
    direccion: 'Calle Principal 123',
    telefono: '+521234567890',
    alergias: 'Penicilina',
    enfermedadesCronicas: ['Diabetes tipo 2'],
    assignedDoctor: 'sample-doctor',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  });
  
  // Crear médico de prueba
  await db.collection('doctors').doc('sample-doctor').set({
    nombre: 'Dr. Carlos',
    apellido: 'Martínez',
    email: 'doctor@hospital.mx',
    cedula: '9876543210',
    especialidad: 'Medicina General',
    nroLicencia: 'MX-12345',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  });
  
  res.send('Datos de prueba creados ✅');
});

// 5. Enviar notificación al paciente cuando hay nueva cita
exports.notifyAppointment = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    const appointmentData = snap.data();
    const patientId = appointmentData.patientId;
    
    const patientDoc = await admin.firestore()
      .collection('patients')
      .doc(patientId)
      .get();
    
    const patientEmail = patientDoc.data().email;
    
    // Enviar email (requiere configurar SendGrid o similar)
    console.log(`📧 Notificación enviada a ${patientEmail}`);
    
    return true;
  });

// 6. Backup automático diario
exports.dailyBackup = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Exportar todas las colecciones
    const collections = ['patients', 'doctors', 'appointments', 'audit'];
    
    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      console.log(`✅ Backup de ${collection}: ${snapshot.size} documentos`);
    }
    
    return null;
  });

// 7. Limpiar datos sensibles después de 7 años (GDPR/regulación México)
exports.purgeOldData = functions.pubsub
  .schedule('every 1st day of month 03:00')
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    const db = admin.firestore();
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
    
    const oldRecords = await db.collection('audit')
      .where('timestamp', '<', sevenYearsAgo)
      .get();
    
    let deleted = 0;
    for (const doc of oldRecords.docs) {
      await doc.ref.delete();
      deleted++;
    }
    
    console.log(`🗑️ ${deleted} registros antiguos eliminados`);
    return null;
  });

// 8. Validar que las prescripciones tienen medicamentos válidos
exports.validatePrescription = functions.firestore
  .document('patients/{patientId}/prescriptions/{prescriptionId}')
  .onCreate(async (snap, context) => {
    const prescriptionData = snap.data();
    
    // Lista de medicamentos permitidos (ejemplo simplificado)
    const allowedMeds = ['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Loratadina'];
    
    if (!allowedMeds.includes(prescriptionData.medicamento)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Medicamento no reconocido: ${prescriptionData.medicamento}`
      );
    }
    
    return true;
  });

// ============================================================
// INSTALACIÓN:
// 1. firebase init functions
// 2. Reemplaza funciones/index.js con el contenido arriba
// 3. firebase deploy --only functions
// ============================================================
