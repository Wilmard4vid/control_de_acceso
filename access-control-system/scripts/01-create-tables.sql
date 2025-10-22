-- Base de datos para el Sistema de Control de Acceso
-- Universidad Cooperativa de Colombia - Sede Santa Marta

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS control_acceso_ucc;
USE control_acceso_ucc;

-- Tabla de Profesores
CREATE TABLE IF NOT EXISTS profesores (
  id BIGSERIAL PRIMARY KEY,
  rfid VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Accesos a Salones
CREATE TABLE IF NOT EXISTS accesos (
  id BIGSERIAL PRIMARY KEY,
  rfid VARCHAR(50) NOT NULL,
  nombre_profesor VARCHAR(200) NOT NULL,
  salon VARCHAR(50) NOT NULL,
  hora_apertura TIMESTAMPTZ DEFAULT NOW(),
  hora_cierre TIMESTAMPTZ,
  estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_accesos_salon ON accesos(salon);
CREATE INDEX IF NOT EXISTS idx_accesos_estado ON accesos(estado);
CREATE INDEX IF NOT EXISTS idx_accesos_fecha ON accesos(hora_apertura);
CREATE INDEX IF NOT EXISTS idx_profesores_rfid ON profesores(rfid);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE accesos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir acceso público para lectura y escritura (sin autenticación)
-- Nota: En producción, deberías implementar autenticación y políticas más restrictivas
CREATE POLICY "Allow public read access on profesores" ON profesores FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on profesores" ON profesores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on profesores" ON profesores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on profesores" ON profesores FOR DELETE USING (true);

CREATE POLICY "Allow public read access on accesos" ON accesos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on accesos" ON accesos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on accesos" ON accesos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on accesos" ON accesos FOR DELETE USING (true);
