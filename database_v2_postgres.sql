-- =================================================================================
-- SISTEMA INTEGRAL DE EVALUACIÓN DOCENTE (SIED) - UNAC
-- Versión: 2.1 (Corregido)
-- Basado en: Resolución N° 222-2022-CU (Reglamento de Desempeño Docente)
-- =================================================================================

-- Limpieza inicial
DROP TABLE IF EXISTS "EncuestaResultado" CASCADE;
DROP TABLE IF EXISTS "Matricula" CASCADE;
DROP TABLE IF EXISTS "CargaLectiva" CASCADE;
DROP TABLE IF EXISTS "Curso" CASCADE;
DROP TABLE IF EXISTS "DetalleEvaluacion" CASCADE;
DROP TABLE IF EXISTS "EvaluacionDocente" CASCADE;
DROP TABLE IF EXISTS "RubricaItem" CASCADE;
DROP TABLE IF EXISTS "Dimension" CASCADE;
DROP TABLE IF EXISTS "Periodo" CASCADE;
DROP TABLE IF EXISTS "Docente" CASCADE;
DROP TABLE IF EXISTS "Usuario" CASCADE;

-- Eliminación de Tipos ENUM
DROP TYPE IF EXISTS "RolUsuario";
DROP TYPE IF EXISTS "EstadoPeriodo";
DROP TYPE IF EXISTS "RolEvaluador";
DROP TYPE IF EXISTS "EstadoEvaluacion";

-- ---------------------------------------------------------------------------------
-- 1. DEFINICIÓN DE TIPOS DE DATOS (ENUMS)
-- ---------------------------------------------------------------------------------
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'DOCENTE', 'ESTUDIANTE', 'COMISION', 'DIRECTOR');
CREATE TYPE "EstadoPeriodo" AS ENUM ('PLANIFICACION', 'ACTIVO', 'CERRADO');

-- CORRECCIÓN AQUÍ: Se agregó 'DIRECTOR' a la lista permitida
CREATE TYPE "RolEvaluador" AS ENUM ('ESTUDIANTE', 'COMISION', 'DOCENTE', 'SISTEMA', 'DIRECTOR');

CREATE TYPE "EstadoEvaluacion" AS ENUM ('EN_PROCESO', 'FINALIZADO');

-- ---------------------------------------------------------------------------------
-- 2. SEGURIDAD Y USUARIOS
-- ---------------------------------------------------------------------------------

CREATE TABLE "Usuario" (
  "idUsuario" SERIAL PRIMARY KEY,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "nombres" VARCHAR(100) NOT NULL,
  "apellidos" VARCHAR(100) NOT NULL,
  "rol" "RolUsuario" NOT NULL DEFAULT 'ESTUDIANTE',
  "estado" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Docente" (
  "idDocente" SERIAL PRIMARY KEY,
  "idUsuario" INT NOT NULL,
  "codigoDocente" VARCHAR(20) NOT NULL UNIQUE,
  "categoria" VARCHAR(50), 
  "departamentoAcademico" VARCHAR(100),
  CONSTRAINT "fk_docente_usuario" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------------
-- 3. CONFIGURACIÓN DE LA EVALUACIÓN (Rúbrica Dinámica)
-- ---------------------------------------------------------------------------------

CREATE TABLE "Periodo" (
  "idPeriodo" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(20) NOT NULL, 
  "fechaInicio" DATE NOT NULL,
  "fechaFin" DATE NOT NULL,
  "estado" "EstadoPeriodo" DEFAULT 'PLANIFICACION'
);

CREATE TABLE "Dimension" (
  "idDimension" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "descripcion" TEXT
);

CREATE TABLE "RubricaItem" (
  "idItem" SERIAL PRIMARY KEY,
  "idDimension" INT NOT NULL,
  "numeroItem" INT NOT NULL, 
  "concepto" VARCHAR(255) NOT NULL,
  "puntajeMaximo" DECIMAL(5,2) NOT NULL, 
  "rolEvaluador" "RolEvaluador" NOT NULL, 
  CONSTRAINT "fk_item_dimension" FOREIGN KEY ("idDimension") REFERENCES "Dimension"("idDimension")
);

-- ---------------------------------------------------------------------------------
-- 4. EL PROCESO DE EVALUACIÓN (Transaccional)
-- ---------------------------------------------------------------------------------

CREATE TABLE "EvaluacionDocente" (
  "idEvaluacion" SERIAL PRIMARY KEY,
  "idDocente" INT NOT NULL,
  "idPeriodo" INT NOT NULL,
  "puntajeFinal" DECIMAL(5,2) DEFAULT 0.00,
  "categoria" VARCHAR(50) DEFAULT 'PENDIENTE',
  "estado" "EstadoEvaluacion" DEFAULT 'EN_PROCESO',
  "fechaCierre" TIMESTAMP,
  CONSTRAINT "unique_eval_docente_periodo" UNIQUE ("idDocente", "idPeriodo"),
  CONSTRAINT "fk_eval_docente" FOREIGN KEY ("idDocente") REFERENCES "Docente"("idDocente"),
  CONSTRAINT "fk_eval_periodo" FOREIGN KEY ("idPeriodo") REFERENCES "Periodo"("idPeriodo")
);

CREATE TABLE "DetalleEvaluacion" (
  "idDetalle" SERIAL PRIMARY KEY,
  "idEvaluacion" INT NOT NULL,
  "idItem" INT NOT NULL,
  "puntajeObtenido" DECIMAL(5,2) DEFAULT 0.00,
  "observacion" TEXT,
  "evaluadoPor" INT, 
  "fechaEvaluacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_detalle_eval" FOREIGN KEY ("idEvaluacion") REFERENCES "EvaluacionDocente"("idEvaluacion") ON DELETE CASCADE,
  CONSTRAINT "fk_detalle_item" FOREIGN KEY ("idItem") REFERENCES "RubricaItem"("idItem"),
  CONSTRAINT "fk_detalle_evaluador" FOREIGN KEY ("evaluadoPor") REFERENCES "Usuario"("idUsuario")
);

-- ---------------------------------------------------------------------------------
-- 5. SOPORTE PARA LA ENCUESTA ESTUDIANTIL (El 5%)
-- ---------------------------------------------------------------------------------

CREATE TABLE "Curso" (
  "idCurso" SERIAL PRIMARY KEY,
  "codigo" VARCHAR(20) NOT NULL,
  "nombre" VARCHAR(100) NOT NULL
);

CREATE TABLE "CargaLectiva" (
  "idCarga" SERIAL PRIMARY KEY,
  "idDocente" INT NOT NULL,
  "idCurso" INT NOT NULL,
  "idPeriodo" INT NOT NULL,
  "seccion" VARCHAR(5),
  CONSTRAINT "fk_carga_docente" FOREIGN KEY ("idDocente") REFERENCES "Docente"("idDocente"),
  CONSTRAINT "fk_carga_curso" FOREIGN KEY ("idCurso") REFERENCES "Curso"("idCurso"),
  CONSTRAINT "fk_carga_periodo" FOREIGN KEY ("idPeriodo") REFERENCES "Periodo"("idPeriodo")
);

CREATE TABLE "Matricula" (
  "idMatricula" SERIAL PRIMARY KEY,
  "idUsuarioEstudiante" INT NOT NULL,
  "idCarga" INT NOT NULL,
  "encuestaRealizada" BOOLEAN DEFAULT FALSE,
  CONSTRAINT "fk_mat_estudiante" FOREIGN KEY ("idUsuarioEstudiante") REFERENCES "Usuario"("idUsuario"),
  CONSTRAINT "fk_mat_carga" FOREIGN KEY ("idCarga") REFERENCES "CargaLectiva"("idCarga")
);

CREATE TABLE "EncuestaResultado" (
  "idResultado" SERIAL PRIMARY KEY,
  "idCarga" INT NOT NULL,
  "puntajePromedio" DECIMAL(5,2),
  "comentarios" TEXT,
  CONSTRAINT "fk_encuesta_carga" FOREIGN KEY ("idCarga") REFERENCES "CargaLectiva"("idCarga")
);

-- ---------------------------------------------------------------------------------
-- 6. INSERTAR DATOS BÁSICOS
-- ---------------------------------------------------------------------------------

INSERT INTO "Dimension" ("nombre", "descripcion") VALUES 
('Proceso Enseñanza Aprendizaje', 'Evaluación por estudiantes, sílabo, plataforma, tutoría'),
('Investigación', 'Proyectos, asesoría de tesis, jurado, publicaciones'),
('Extensión y Responsabilidad Social', 'Eventos académicos, RSU, organizaciones sociales'),
('Gestión Académico-Administrativa', 'Cargos directivos, comisiones'),
('Formación Profesional', 'Grados, especializaciones, capacitación, movilidad');

-- Dimensión 1: Enseñanza
INSERT INTO "RubricaItem" ("idDimension", "numeroItem", "concepto", "puntajeMaximo", "rolEvaluador") VALUES
(1, 1, 'Evaluación electrónica de estudiantes a docente', 5.00, 'SISTEMA'),
(1, 2, 'Sílabo (Subido, estructura, articulado)', 7.00, 'COMISION'),
(1, 3, 'Uso de Plataforma Educativa SGA', 6.00, 'COMISION'),
(1, 4, 'Tutoría', 4.00, 'COMISION');

-- Dimensión 2: Investigación
INSERT INTO "RubricaItem" ("idDimension", "numeroItem", "concepto", "puntajeMaximo", "rolEvaluador") VALUES
(2, 5, 'Proyecto y trabajos de Investigación científica', 5.00, 'COMISION'),
(2, 6, 'Asesoría de proyecto de investigación (Tesis)', 6.00, 'COMISION'),
(2, 7, 'Jurado de trabajo de investigación', 3.00, 'COMISION'),
(2, 8, 'Publicaciones científicas (últimos 2 años)', 9.00, 'COMISION'),
(2, 9, 'Participación en eventos científicos (presente año)', 7.00, 'COMISION');

-- Dimensión 3: RSU
INSERT INTO "RubricaItem" ("idDimension", "numeroItem", "concepto", "puntajeMaximo", "rolEvaluador") VALUES
(3, 10, 'Participación en evento académico (presente año)', 3.00, 'COMISION'),
(3, 11, 'Participación en proyectos de RSU (DUERS/CERES)', 5.00, 'COMISION'),
(3, 12, 'Participación activa en organización social', 2.00, 'COMISION');

-- Dimensión 4: Gestión
INSERT INTO "RubricaItem" ("idDimension", "numeroItem", "concepto", "puntajeMaximo", "rolEvaluador") VALUES
(4, 13, 'Desempeño en el cargo de dirección', 5.00, 'DIRECTOR'),
(4, 14, 'Participación en comisiones y coordinaciones', 3.00, 'COMISION');

-- Dimensión 5: Formación
INSERT INTO "RubricaItem" ("idDimension", "numeroItem", "concepto", "puntajeMaximo", "rolEvaluador") VALUES
(5, 15, 'Autoevaluación del docente', 10.00, 'DOCENTE'),
(5, 16, 'Formación (Grados académicos)', 6.00, 'COMISION'),
(5, 17, 'Certificaciones, diplomados, segunda especialidad', 7.00, 'COMISION'),
(5, 18, 'Capacitación y actualización', 3.00, 'COMISION'),
(5, 19, 'Movilidad docente', 4.00, 'COMISION');