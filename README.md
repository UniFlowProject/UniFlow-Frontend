# 🎓 UniFlow - Dashboard Académico Inteligente

> **Proyecto Programado Fase I - Diseño de Software**  
> Tecnológico de Costa Rica - IC-6821  
> Profesor: Marcos Rodríguez  
> Entrega: 26 Septiembre 2025

UniFlow es una aplicación web diseñada para centralizar y optimizar la gestión académica (Tareas Sencillas) de estudiantes universitarios. La plataforma unifica tareas en forma de lista, tabla y kanban board, además de recursos como links a servicios institucionales, todo en un dashboard simple, moderno y accesible.

Características Principales

## ✨ Interfaz de usuario moderna y responsiva
🔐 Autenticación con Amazon Cognito
📱 Compatibilidad con dispositivos móviles
🎨 Diseño intuitivo y accesible

## Tecnologías Utilizadas
Frontend: React 19+
Styling: Tailwind CSS
Estado: Zustand
Routing: Tanstack Router
Build Tool: Vite
Package Manager: pnpm
Componentes UI/Design System: ShadCN
Iconos: Lucide Icons
API Calls: Axios + Tanstack Query

## 📸 Capturas de Pantalla

## 🛠️ Instalación y Setup Local

### Prerrequisitos

Node.js v18 o superior
pnpm v10 o superior
git

```bash
# Instalar pnpm globalmente si no lo tienes
npm install -g pnpm
```

1. Clonar el repositorio

```bash
git clone https://github.com/UniFlowProject/uniflow-frontend
cd uniflow-frontend
```

2. Instalar dependencias
```bash
pnpm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones. Cada servicio recibe **una URL base completa**; el código solo añade rutas de recurso (`/periods`, `/courses`, `/tasks`, `/notifications`...), nunca prefijo ni versión:

| Variable | Descripción |
|---|---|
| `VITE_ACADEMIC_SERVICE_URL` | Base de academic (periodos, cursos y tareas). Ej.: `http://localhost:3001` directo, o `https://<gateway>/api/academic/v2` vía API Gateway |
| `VITE_NOTIFICATIONS_SERVICE_URL` | Base de notifications. Ej.: `http://localhost:3003` o `https://<gateway>/api/notifications/v2` |
| `VITE_NOTIFICATIONS_WEB_APP_URL` | URL del WebSocket/app de notificaciones |
| `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID` | Hosted UI de Cognito |

### Prerrequisitos de producción

- `VITE_ACADEMIC_SERVICE_URL` y `VITE_NOTIFICATIONS_SERVICE_URL` deben contener la URL base completa **incluyendo la versión `/v2`** (p. ej. `https://<gateway>/api/academic/v2`); si falta, las peticiones darán 404.
- La infraestructura (bucket S3, CloudFront, rol de CI) vive en `infra/` del repositorio central: https://github.com/UniFlowProject/uniflow.
- El workflow `.github/workflows/aws-s3-deploy.yml` se autentica por OIDC (sin llaves estáticas) y corre en el environment de GitHub `production`; el rol de AWS solo confía en ese environment, así que restríngelo a la rama `main` (Settings > Environments > production > Deployment branches).
- Variables de repositorio (o del environment) requeridas: `AWS_ROLE_ARN` (salida `github_actions_role_arns`, clave `frontend`, del stack central), `AWS_REGION`, `S3_BUCKET_NAME` (salida `spa_bucket_name`), `CLOUDFRONT_DISTRIBUTION_ID` (salida `cloudfront_distribution_id`; opcional, si falta se omite la invalidación) y las `VITE_*` (`VITE_ACADEMIC_SERVICE_URL`, `VITE_NOTIFICATIONS_SERVICE_URL`, `VITE_NOTIFICATIONS_WEB_APP_URL`, `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`).

4. Ejecutar en modo desarrollo
```bash
pnpm run dev
```

5. Acceder a la aplicación

Abre tu navegador y ve a: [http://localhost:3000](http://localhost:3000)

## Estructura del Repositorio

```
📦 Uniflow-Frontend/
├── 📁 public/
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── 📁 src/
│   ├── 📁 api/
│   │   ├── 📁 auth/
│   │   ├── 📁 notifications/
│   │   ├── 📁 periods/
│   │   ├── 📁 shared/
│   │   ├── 📁 students/
│   │   └── 📁 tasks/
│   ├── 📁 components/
│   │   ├── 📁 auth/
│   │   ├── 📁 courses/
│   │   ├── 📁 notifications/
│   │   ├── 📁 periods/
│   │   ├── 📁 students/
│   │   ├── 📁 tasks/
│   │   ├── 📁 ui/
│   │   ├── ... Otros componentes compartidos
│   ├── 📁 domain/
│   │   ├── 📁 auth/
│   │   ├── 📁 courses/
│   │   ├── 📁 notifications/
│   │   ├── 📁 periods/
│   │   ├── 📁 shared/
│   │   └── 📁 tasks/
│   ├── 📁 hooks/
│   │   ├── 📁 auth/
│   │   ├── 📁 courses/
│   │   ├── 📁 notifications/
│   │   ├── 📁 periods/
│   │   ├── 📁 students/
│   │   ├── 📁 tasks/
│   │   └── ... Otros hooks genéricos
│   ├── 📁 integrations/
│   │   └── 📁 tanstack-query/
│   ├── 📁 lib/
│   │   ├── 📁 api/
│   │   ├── theme-provider.tsx
│   │   └── utils.ts
│   ├── 📁 routes/
│   │   ├── 📁 auth/
│   │   ├── 📁 dashboard/
│   │   ├── 404.tsx
│   │   ├── index.tsx
│   │   ├── _layout.tsx
│   │   └── __root.tsx
│   ├── 📁 stores/
│   │   ├── 📁 auth/
│   │   ├── 📁 periods/
│   │   ├── 📁 students/
│   │   ├── 📁 tasks/
│   │   └── auth.ts
│   ├── env.ts
│   ├── logo.svg
│   ├── main.tsx
│   ├── routeTree.gen.ts
│   └── styles.css
├── 📄 components.json
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 package.json
├── 📄 pnpm-lock.yaml
├── 📄 prettier.config.js
├── 📄 staticwebapp.config.json
├── 📄 tsconfig.json
└── 📄 vite.config.ts
```

## 📚 Recursos Adicionales

- [Documentación React](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
