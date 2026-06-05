# Guía de Compilación de Aplicación Móvil (Capacitor & Android)

Este documento detalla los pasos para compilar la aplicación móvil **Clara** en formato APK (`app-debug.apk`), tanto en tu entorno Windows local (requiere instalar el SDK de Android) como utilizando tu Máquina Virtual (VM) de Linux.

---

## Entorno 1: Compilación en tu Máquina Virtual de Linux (Recomendado)

Dado que cuentas con el SDK de Android ya configurado en tu VM de Linux, este es el método más rápido y directo.

### Paso 1: Copiar o Clonar el Proyecto en la VM
Envía el proyecto actual a tu VM. Puedes hacerlo clonándolo desde tu repositorio de Git o copiando la carpeta del proyecto a través de la carpeta compartida de tu VM.

### Paso 2: Preparar y Sincronizar el Frontend Web
Abre la terminal de Linux dentro del directorio raíz del proyecto y ejecuta:
```bash
# 1. Instalar las dependencias de Node.js
npm install

# 2. Generar el compilado de producción web
npm run build

# 3. Sincronizar los archivos compilados con la carpeta nativa de Android
npx cap sync
```

### Paso 3: Configurar la ruta del SDK de Android en la VM
Crea o edita el archivo `local.properties` dentro de la carpeta `android/` en la VM y especifica la ruta de tu SDK de Linux:
```properties
# android/local.properties
sdk.dir=/home/TU_USUARIO_LINUX/Android/Sdk
```
*(Reemplaza `TU_USUARIO_LINUX` con tu nombre de usuario en la máquina virtual).*

### Paso 4: Compilar la APK
Dentro de la carpeta `android/` en la terminal de la VM:
```bash
# Conceder permisos de ejecución al script Gradle
chmod +x gradlew

# Compilar en modo depuración (Debug)
./gradlew assembleDebug
```
Una vez terminado el proceso, tu APK estará lista en la siguiente ruta:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## Entorno 2: Compilación Local en Windows

Para compilar directamente en tu máquina de Windows, necesitas descargar las herramientas de compilación de Android.

### Paso 1: Instalar el SDK de Android y Android Studio
1. Descarga el instalador desde la página oficial de [Android Studio](https://developer.android.com/studio).
2. Sigue el asistente de instalación.
3. Abre Android Studio por primera vez y completa el **Setup Wizard**. Esto descargará automáticamente el SDK de Android y lo guardará en:
   `C:\Users\jose.larrada_bluetab\AppData\Local\Android\Sdk`

### Paso 2: Compilar desde la terminal
Con el SDK instalado, el archivo `android/local.properties` que ya creamos en el proyecto será válido.
1. Abre tu PowerShell de Windows en la carpeta del proyecto.
2. Ejecuta la compilación de la web y Capacitor:
   ```powershell
   npm run build
   npx cap sync
   ```
3. Entra a la carpeta `android/` y compila la APK:
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```
El archivo APK resultante se generará en:
`android\app\build\outputs\apk\debug\app-debug.apk`

---

## ¿Cómo instalar la APK en tu teléfono móvil?

Una vez tengas el archivo `app-debug.apk` (generado en Windows o Linux):

1. **Habilitar orígenes desconocidos:** En tu teléfono móvil Android, ve a Ajustes y busca "Instalar aplicaciones desconocidas". Concede el permiso a tu navegador web o al gestor de archivos con el que vayas a abrir la APK.
2. **Transferir e Instalar:** Envíate el archivo APK por WhatsApp Web, correo electrónico, Google Drive o conectando el móvil mediante cable USB al ordenador. Abre el archivo en tu teléfono y presiona **Instalar**.
