# Auth NestJS

**Paso 1: Levantar Base de Datos**
```bash
docker run --name auth-postgres-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=auth_db -p 5432:5432 -d postgres:15-alpine
```

**Paso 2: Instalar dependencias**
```bash
npm install
```

**Paso 3: Cargar datos iniciales (Seed)**
```bash
npm run seed
```

**Paso 4: Iniciar la aplicación**
```bash
npm run start:dev
```
