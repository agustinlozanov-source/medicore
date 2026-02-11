# MediCore - Guía de Configuración Firestore

## Paso 1: Copiar Security Rules

1. Ve a **Firebase Console** → Tu proyecto **medicore-879e2**
2. Selecciona **Firestore Database** → **Rules**
3. Reemplaza todo el contenido con las reglas de `firestore-rules.txt`
4. Click en **Publish**

---

## Paso 2: Crear Usuarios de Prueba

Ve a **Authentication** → **Users** y crea estos usuarios:

### Médico
- Email: `doctor@hospital.mx`
- Contraseña: `TestMedico123!`
- Rol: `medico`

### Paciente
- Email: `patient@hospital.mx`
- Contraseña: `TestPaciente123!`
- Rol: `paciente`

### Admin
- Email: `admin@hospital.mx`
- Contraseña: `TestAdmin123!`
- Rol: `admin`

---

## Paso 3: Crear Colecciones Base (Opcional - se crean al guardar datos)

Si prefieres crearlas manualmente en Firestore:

### 1. Colección: `patients`
Estructura de documento:
```json
{
  "id": "uid-del-usuario",
  "nombre": "Juan García",
  "apellido": "López",
  "email": "juan@gmail.com",
  "cedula": "1234567890",
  "fechaNacimiento": "1980-05-15",
  "sexo": "M",
  "direccion": "Calle Principal 123",
  "telefono": "+521234567890",
  "alergias": "Penicilina",
  "enfermedadesCronicas": ["Diabetes tipo 2", "Hipertensión"],
  "assignedDoctor": "uid-del-medico",
  "createdAt": "timestamp",
  "createdBy": "uid-del-admin",
  "status": "active"
}
```

### 2. Subcolección: `patients/{patientId}/consultations`
```json
{
  "id": "consulta-001",
  "doctorId": "uid-del-medico",
  "fecha": "2026-02-11",
  "diagnostico": "J06.9",
  "sintomas": "Tos y dolor de garganta",
  "tratamiento": "Reposo y analgésicos",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 3. Subcolección: `patients/{patientId}/prescriptions`
```json
{
  "id": "rx-001",
  "doctorId": "uid-del-medico",
  "medicamento": "Paracetamol",
  "dosis": "500mg",
  "frecuencia": "Cada 6 horas",
  "duracion": "7 días",
  "createdAt": "timestamp",
  "status": "active"
}
```

### 4. Subcolección: `patients/{patientId}/labResults`
```json
{
  "id": "lab-001",
  "tipo": "Hemograma Completo",
  "fecha": "2026-02-10",
  "resultados": {
    "hemoglobina": "14.5 g/dL",
    "globulosBlancos": "7.2 mil/μL",
    "plaquetas": "245 mil/μL"
  },
  "reviewedBy": "uid-del-medico",
  "createdAt": "timestamp"
}
```

### 5. Colección: `appointments`
```json
{
  "id": "cita-001",
  "patientId": "uid-del-paciente",
  "doctorId": "uid-del-medico",
  "fecha": "2026-02-15",
  "hora": "10:30",
  "motivo": "Consulta de seguimiento",
  "estado": "confirmada",
  "createdAt": "timestamp"
}
```

### 6. Colección: `doctors`
```json
{
  "id": "uid-del-medico",
  "nombre": "Dr. Carlos",
  "apellido": "Martínez",
  "email": "doctor@hospital.mx",
  "cedula": "9876543210",
  "especialidad": "Medicina General",
  "nroLicencia": "MX-12345",
  "telefono": "+521234567891",
  "createdAt": "timestamp",
  "status": "active"
}
```

---

## Paso 4: Configurar Custom Claims (Recomendado)

Para implementar completamente el control de roles, necesitas Cloud Functions. Por ahora, el rol se maneja localmente.

Opción futura: Crear Cloud Function que asigne roles cuando se crea un usuario.

---

## Paso 5: Probar la Aplicación

1. Abre **index.html** en el navegador (o en Netlify)
2. Intenta login con:
   - **doctor@hospital.mx** / `TestMedico123!` → Verás menú de médico
   - **patient@hospital.mx** / `TestPaciente123!` → Verás menú de paciente
   - **admin@hospital.mx** / `TestAdmin123!` → Verás menú de admin

3. Abre **Firestore Console** y observa cómo se crean documentos al usar la app

---

## Seguridad: Notas Importantes

✅ **HIPAA-Compliant (Parcial):**
- Encriptación en tránsito (HTTPS)
- Encriptación en reposo (Firebase)
- Control de acceso por roles
- Auditoría de cambios (lista para implementar)

⚠️ **Pending para producción:**
- Cloud Functions para validación adicional
- Backup automático diario
- Alertas de acceso anómalo
- Cumplimiento de consentimiento informado (CURP + Firma Digital)
- Residencia de datos en México (verificar con Firebase)

---

## Cloud Firestore Índices (Si es necesario)

Si ves errores de "missing index", Firestore te ofrecerá crear automáticamente los índices necesarios. Acepta para queries complejas.

---

## Próximos Pasos

1. ✅ Configurar rules
2. ✅ Crear usuarios de prueba
3. ⏳ Agregar formularios funcionales para guardar consultas
4. ⏳ Implementar carga de registros médicos históricos
5. ⏳ Integrar FHIR standardization
6. ⏳ Agregar firma digital para prescripciones
7. ⏳ Implementar auditoría y logs

---

**¿Preguntas? Revisa:**
- Documentación Firebase: https://firebase.google.com/docs
- Reglamentación HIPAA: https://www.hhs.gov/hipaa
- Normas de Salud México: https://www.gob.mx/salud
