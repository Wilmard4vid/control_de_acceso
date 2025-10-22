-- Script para insertar datos de ejemplo
-- Universidad Cooperativa de Colombia - Sede Santa Marta

-- Updated for PostgreSQL/Supabase syntax with only 2 tables

-- Insertar profesores de ejemplo
INSERT INTO profesores (rfid, nombre, apellido) VALUES
('RFID-001-CR', 'Carlos', 'Ruiz'),
('RFID-002-PL', 'Patricia', 'López'),
('RFID-003-MT', 'Miguel Ángel', 'Torres'),
('RFID-004-AG', 'Ana María', 'González'),
('RFID-005-RM', 'Roberto', 'Martínez');

-- Insertar algunos accesos de ejemplo
INSERT INTO accesos (rfid, nombre_profesor, salon, hora_apertura, hora_cierre, estado) VALUES
('RFID-001-CR', 'Dr. Carlos Ruiz', 'A-102', NOW() - INTERVAL '1 hour', NULL, 'ABIERTO'),
('RFID-002-PL', 'Dra. Patricia López', 'B-101', NOW() - INTERVAL '2 hours', NULL, 'ABIERTO'),
('RFID-003-MT', 'Dr. Miguel Ángel Torres', 'A-201', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours', 'CERRADO');
