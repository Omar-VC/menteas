🧠 Gestor de Consultorio y Registro Clínico para Psicólogos (SaaS B2B)

Este documento reúne el relevamiento de campo (discovery) realizado a partir de la experiencia directa de una profesional de la psicología en ejercicio, junto con la especificación funcional y técnica para el desarrollo de un Producto Mínimo Viable (MVP).

📌 1. Resumen del Relevamiento (Discovery)

El objetivo de las entrevistas fue identificar la operativa diaria, los dolores recurrentes (friction points) y las necesidades de gestión administrativa y clínica de profesionales de la salud mental con consultorio propio.

📜 Hallazgos Clave por Área:

Gestión de Agenda y Modos de Trabajo:

Dinámica: La asignación de turnos es fija (mismo día y horario acordados en la primera sesión).

Cobros y Cancelaciones: Existen demoras recurrentes en el pago por sesión ("andar pidiendo el pago"). Las cancelaciones a última hora generan fricción sobre si cobrar o no la sesión acordada. Algunos profesionales trabajan con pagos por adelantado o abonos mensuales.

Registro de Historias Clínicas y Notas:

Inexistencia de un sistema unificado: Las notas de sesión suelen llevarse "en la cabeza" o en anotaciones breves informalizadas.

Herramientas actuales: Uso de Microsoft Word organizado en carpetas individuales por paciente para guardar resúmenes, fichas de actividades o tareas pendientes (ej: "preparar X test para tal paciente").

Privacidad y Seguridad:

Percepción de riesgo: El profesional suele percibir que no maneja una "base de datos compleja", sino anotaciones puntuales de uso personal.

Oportunidad: A pesar de esa baja percepción de riesgo, la centralización en un entorno seguro y con autenticación garantiza el cumplimiento legal y resguarda la privacidad del paciente frente a archivos de Word en computadoras locales.

Prioridades del Usuario (Feedback Directo):

El orden explícito de prioridades expresado por el profesional para una herramienta ideal fue:

Agenda visual y funcional

Control de Pagos y Deudas

Notas rápidas de sesión

Ficha / Historia Clínica unificada

🎯 2. Visión del Producto y Propuesta de Valor

Desarrollar un SaaS B2B web y responsive (PWA) enfocado en la agilidad extrema. Diseñado para usarse durante los 10 minutos entre paciente y paciente, priorizando la claridad visual y la fricción nula en la carga de datos.

Público Objetivo: Psicólogos, psicopedagogos y terapeutas independientes.

Estrategia UI/UX: Interfaz minimalista, limpia (clean), con navegación en pocos clics y paneles de estado visual (ej: etiquetas de pago pendiente/al día).

🏗️ 3. Estructura Modular del MVP

En base a la prioridad requerida por los usuarios, el sistema se dividirá en 4 módulos principales:

🗓️ Módulo 1: Agenda Semanal y Control de Ausencias

Vista de calendario semanal/diario con bloques fijos recurrentes.

Estado del turno: Confirmado, Asistió, Ausente (con cobro), Cancelado.

Recordatorios rápidos directos vía enlace a WhatsApp Web.

💳 Módulo 2: Gestión de Cobros y Honorarios

Registro de estado financiero por paciente: Al día, Pago pendiente, Abonado por adelantado.

Historial rápido de cobros registrados con medio de pago (Efectivo, Transferencia).

Alertas visuales simples en el dashboard para identificar pacientes con saldo adeudado.

📝 Módulo 3: Ficha de Paciente e Historia Clínica Ligera

Perfil del paciente (datos de contacto, contacto de emergencia, día/horario habitual).

Timeline de sesiones pasadas con notas rápidas asociadas.

Carga rápida de notas post-sesión (editor de texto simple sin distracciones).

📌 Módulo 4: Bloc de Tareas y Material Inter-sesión

Sección de "Pendientes de Preparación" vinculada al paciente (ej: "Enviar ejercicios de respiración", "Preparar test").

Espacio para adjuntar archivos ligeros (PDFs de guías, imágenes de actividades).

🛠️ 4. Stack Tecnológico Sugerido

Frontend: React (Vite) + TypeScript + Tailwind CSS v3.

Componentes de UI: Lucide React icons (lucide-react) para simplicidad y limpieza visual.

Backend y Autenticación: Supabase o Firebase (Auth JWT, PostgreSQL/Firestore, Row Level Security para garantizar la privacidad total entre psicólogos).

Despliegue: Vercel o Netlify.

🔒 5. Consideraciones de Seguridad y Privacidad

Aislamiento de Datos (Multi-tenancy): Cada psicólogo accede únicamente a sus pacientes mediante políticas de seguridad a nivel de fila (RLS).

Cifrado: Todos los datos personales e impresiones clínicas están cifrados en tránsito (HTTPS/TLS) y en reposo.

Resguardo de Copias: Respaldos automáticos en la nube para prevenir pérdida de datos por rotura de equipo local (problema común de guardar en Word).

📋 6. Proxima Fase de Desarrollo (Roadmap)

Fase 1 (Prototipado): Diseño de Wireframes en Figma de la vista de Agenda, Lista de Pacientes y Ficha de Sesión.

Fase 2 (MVP Frontend): Implementación de la interfaz funcional en React + Tailwind con datos simulados (Mock Data).

Fase 3 (Backend & Auth): Conexión con Supabase/Firebase para gestión real de usuarios, pacientes y notas.

Fase 4 (Pruebas de Campo): Presentación del prototipo funcional a los psicólogos entrevistados para su validación en vivo.