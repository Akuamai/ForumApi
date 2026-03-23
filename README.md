# ForumApp

Application de gestion d'événements avec inscription, ressources matérielles et gestion des rôles.

## Stack

- **API** : ASP.NET Core 8, Entity Framework Core, SQL Server, JWT
- **Front** : React + Vite, Bootstrap, Axios

## Structure

```
ApiForum/        → API C# ASP.NET Core
forum-front/     → Front React
```

## Lancer le projet

### API
```bash
cd ApiForum
dotnet ef database update
dotnet run
```

### Front
```bash
cd forum-front
npm install
npm run dev
```

→ Front disponible sur `http://localhost:5173`  
→ API disponible sur `https://localhost:7000`

## Rôles

| Rôle    | Droits |
|---------|--------|
| Admin   | Tout (events, users, rôles) |
| Manager | Créer/supprimer événements, voir inscrits |
| User    | S'inscrire / se désinscrire aux événements |
