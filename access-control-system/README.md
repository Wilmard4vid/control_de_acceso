# Sistema de Control de Acceso a Salones
## Universidad Cooperativa de Colombia - Sede Santa Marta

Sistema completo de control de acceso a salones con registro de entradas y salidas de profesores.

## Características

### Control de Acceso a Salones
- Control de acceso a salones en tiempo real
- Gestión de profesores (agregar, editar, eliminar)
- Historial completo de accesos (apertura y cierre)
- Interfaz intuitiva con colores institucionales de la UCC
- Base de datos MySQL para persistencia de datos
- Acceso remoto desde múltiples computadoras

## Requisitos Previos

- Node.js 18+ instalado
- MySQL Server 8.0+ o MySQL Workbench
- Navegador web moderno

## Configuración de la Base de Datos

### 1. Crear la Base de Datos en MySQL Workbench

1. Abre MySQL Workbench
2. Conéctate a tu servidor MySQL
3. Abre el archivo `scripts/01-create-tables.sql`
4. Ejecuta el script completo (esto creará la base de datos y las tablas)
5. Abre el archivo `scripts/02-insert-sample-data.sql`
6. Ejecuta el script para insertar datos de ejemplo

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=misionTic2022
DB_NAME=control_acceso_salones
DB_PORT=3306
\`\`\`

**Importante:** Ajusta estos valores según tu configuración de MySQL:
- `DB_HOST`: Dirección del servidor MySQL (normalmente `localhost`)
- `DB_USER`: Usuario de MySQL (normalmente `root`)
- `DB_PASSWORD`: Tu contraseña de MySQL
- `DB_NAME`: Nombre de la base de datos (debe ser `control_acceso_salones`)
- `DB_PORT`: Puerto de MySQL (normalmente `3306`)

### 3. Configurar Acceso Remoto (Opcional)

Para permitir que otras personas accedan a la base de datos desde otras computadoras:

#### Opción A: Acceso en Red Local

1. **Configurar MySQL para aceptar conexiones remotas:**
   - Edita el archivo `my.cnf` (Linux/Mac) o `my.ini` (Windows) de MySQL
   - Busca la línea `bind-address = 127.0.0.1`
   - Cámbiala a `bind-address = 0.0.0.0`
   - Reinicia el servicio MySQL

2. **Crear usuario con permisos remotos:**
   \`\`\`sql
   CREATE USER 'root'@'%' IDENTIFIED BY 'misionTic2022';
   GRANT ALL PRIVILEGES ON control_acceso_salones.* TO 'root'@'%';
   FLUSH PRIVILEGES;
   \`\`\`

3. **Configurar firewall:**
   - Windows: Permite el puerto 3306 en el Firewall de Windows
   - Linux: `sudo ufw allow 3306`

4. **Actualizar DB_HOST:**
   - En cada computadora que acceda, cambia `DB_HOST` a la IP de la computadora que tiene MySQL
   - Ejemplo: `DB_HOST=192.168.1.100`

#### Opción B: Base de Datos en la Nube

Puedes usar servicios gratuitos como:
- **PlanetScale** (MySQL en la nube)
- **Railway** (MySQL hosting)
- **Clever Cloud** (MySQL gratuito)

Estos servicios te dan una URL de conexión que puedes usar en `DB_HOST`.

## Instalación

1. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

2. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

3. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Estructura de la Base de Datos

### Tabla: `profesores`
Gestión de profesores registrados en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único del profesor (auto-incremental) |
| rfid | VARCHAR(50) | Código RFID único (generado automáticamente) |
| nombre | VARCHAR(255) | Nombre completo del profesor |

### Tabla: `accesos`
Tabla principal que registra todos los accesos a los salones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único del registro (auto-incremental) |
| rfid | VARCHAR(50) | Código RFID del profesor |
| nombre_profesor | VARCHAR(255) | Nombre completo del profesor |
| salon | VARCHAR(50) | Número del salón (ej: A-101) |
| hora_apertura | DATETIME | Fecha y hora de apertura del salón |
| hora_cierre | DATETIME | Fecha y hora de cierre del salón (NULL si está abierto) |
| estado | ENUM | Estado actual: 'ABIERTO' o 'CERRADO' |

## Uso del Sistema

### Gestión de Profesores

1. En la sección "Gestión de Carnets de Profesores"
2. Haz clic en "Agregar Profesor"
3. Ingresa el nombre completo del profesor
4. El sistema generará automáticamente un código RFID único
5. Para editar o eliminar, usa los botones de acción en la tabla

### Control de Acceso

1. Los profesores agregados aparecerán automáticamente disponibles
2. Selecciona un salón disponible
3. Haz clic en "ABRIR SALÓN" para registrar el acceso
4. El sistema registrará automáticamente la hora de apertura
5. Cuando termines, haz clic en "CERRAR SALÓN"
6. El sistema registrará la hora de cierre

### Registro de Accesos

- Visualiza todos los accesos registrados en la tabla inferior
- La tabla muestra: ID, Nombre del Profesor, Salón, Hora de Apertura, Hora de Cierre y Estado
- Usa el botón "Actualizar" para recargar los datos en tiempo real

## API Endpoints

### Gestión de Profesores

#### GET `/api/profesores`
Obtiene todos los profesores registrados.

**Respuesta:**
\`\`\`json
[
  {
    "id": 1,
    "rfid": "RFID-001-XX",
    "nombre": "Dr. Carlos Ruiz"
  }
]
\`\`\`

#### POST `/api/profesores`
Registra un nuevo profesor.

**Body:**
\`\`\`json
{
  "nombre": "Dr. Carlos Ruiz"
}
\`\`\`

#### PUT `/api/profesores?id=1`
Actualiza un profesor existente.

**Body:**
\`\`\`json
{
  "nombre": "Dr. Carlos Ruiz Martínez"
}
\`\`\`

#### DELETE `/api/profesores?id=1`
Elimina un profesor.

### Control de Acceso

#### GET `/api/accesos`
Obtiene todos los registros de acceso (últimos 100).

**Respuesta:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rfid": "RFID-001-CR",
      "nombre_profesor": "Dr. Carlos Ruiz",
      "salon": "A-102",
      "hora_apertura": "2025-01-15T10:30:00",
      "hora_cierre": null,
      "estado": "ABIERTO"
    }
  ]
}
\`\`\`

#### POST `/api/accesos`
Registra un nuevo acceso (abre un salón).

**Body:**
\`\`\`json
{
  "rfid": "RFID-001-CR",
  "nombre_profesor": "Dr. Carlos Ruiz",
  "salon": "A-102"
}
\`\`\`

#### PUT `/api/accesos/cerrar`
Cierra un salón (actualiza el registro de acceso).

**Body:**
\`\`\`json
{
  "salon": "A-102"
}
\`\`\`

## Integración con ESP32/ESP8266 para Control de Puertas

El sistema está diseñado para integrarse con microcontroladores ESP32 o ESP8266 que controlan servomotores para abrir/cerrar puertas físicamente.

### Opción 1: ESP consulta la Base de Datos

El ESP32 puede consultar la base de datos cada 2 segundos para detectar comandos de apertura/cierre:

\`\`\`cpp
// Código de ejemplo para ESP32
#include <WiFi.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <Servo.h>

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";

// Configuración MySQL
IPAddress server_addr(192, 168, 1, 100); // IP de tu servidor MySQL
char user[] = "root";
char db_password[] = "misionTic2022";

Servo servoMotor;
WiFiClient client;
MySQL_Connection conn(&client);

void setup() {
  Serial.begin(115200);
  servoMotor.attach(18); // GPIO 18
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  conn.connect(server_addr, 3306, user, db_password);
}

void loop() {
  // Consultar base de datos cada 2 segundos
  checkForCommands();
  delay(2000);
}

void checkForCommands() {
  MySQL_Cursor *cur = new MySQL_Cursor(&conn);
  
  // Consultar comandos pendientes para el salón A-101
  char query[] = "SELECT id, estado FROM accesos WHERE salon='A-101' AND procesado=0 ORDER BY id DESC LIMIT 1";
  cur->execute(query);
  
  column_names *cols = cur->get_columns();
  row_values *row = cur->get_next_row();
  
  if (row != NULL) {
    String estado = row->values[1];
    
    if (estado == "ABIERTO") {
      abrirPuerta();
    } else if (estado == "CERRADO") {
      cerrarPuerta();
    }
    
    // Marcar como procesado
    char update[] = "UPDATE accesos SET procesado=1 WHERE id=" + String(row->values[0]);
    cur->execute(update);
  }
  
  delete cur;
}

void abrirPuerta() {
  servoMotor.write(90); // Abrir
  Serial.println("Puerta abierta");
}

void cerrarPuerta() {
  servoMotor.write(0); // Cerrar
  Serial.println("Puerta cerrada");
}
\`\`\`

### Modificación necesaria en la Base de Datos

Agrega una columna `procesado` a la tabla `accesos`:

\`\`\`sql
ALTER TABLE accesos ADD COLUMN procesado TINYINT(1) DEFAULT 0;
\`\`\`

## Solución de Problemas

### Error de conexión a la base de datos

1. Verifica que MySQL esté ejecutándose
2. Confirma que las credenciales en `.env.local` sean correctas
3. Asegúrate de que la base de datos `control_acceso_salones` exista
4. Verifica que el usuario tenga permisos sobre la base de datos

### Los datos no se guardan

1. Revisa la consola del navegador para errores
2. Verifica que los scripts SQL se hayan ejecutado correctamente
3. Confirma que las tablas existan en la base de datos

### No puedo acceder desde otra computadora

1. Verifica que MySQL esté configurado para aceptar conexiones remotas
2. Confirma que el firewall permita el puerto 3306
3. Asegúrate de usar la IP correcta en `DB_HOST`
4. Verifica que el usuario tenga permisos remotos (`'root'@'%'`)

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **MySQL** - Base de datos relacional
- **mysql2** - Driver de MySQL para Node.js
- **Tailwind CSS v4** - Estilos
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Iconos

## Licencia

Sistema desarrollado para la Universidad Cooperativa de Colombia - Sede Santa Marta.
