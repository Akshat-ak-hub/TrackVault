# Production deployment

TrackVault can be deployed as two containers: the Express API and the static React client. Put both behind a platform that provides HTTPS. Use MongoDB Atlas or another managed MongoDB deployment for application data and GridFS file storage.

## Build the containers

Build and deploy the backend from the `server` directory. Its runtime listens on `PORT` (default `5000`):

```sh
docker build -t trackvault-api ./server
```

Build the frontend from the project root. Set `VITE_API_URL` to the public API base URL, including `/api`:

```sh
docker build --build-arg VITE_API_URL=https://api.example.com/api -t trackvault-web .
```

The frontend container serves the Vite build on port `80` and falls back to `index.html` for hash routes.

## Configure the API

Set these runtime environment variables in the API hosting platform. Do not bake credentials into the container image.

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Port assigned by the hosting platform, or `5000` |
| `CLIENT_URL` | Exact HTTPS origin of the frontend, such as `https://app.example.com` |
| `MONGO_URI` | MongoDB connection string for the production database |
| `JWT_SECRET` | Unique random secret with at least 32 characters |
| `JWT_EXPIRES_IN` | JWT lifetime, such as `1h` |

Generate a secret locally with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` and add it directly to the hosting platform's secret store. Production startup rejects a missing database URI, a weak JWT secret, or a non-HTTPS `CLIENT_URL`.

Configure MongoDB network access to admit the API host, use a database user with access only to the TrackVault database, and enable automated backups. The API health check is `GET /api/health`; require a `200` response before routing traffic. A `503` means the API process is up but the database is disconnected.

## Security and operations

- Terminate TLS at the hosting platform and use HTTPS for both public origins. Set `CLIENT_URL` to the frontend origin only; CORS does not accept arbitrary origins.
- Store secrets as runtime secrets. Never commit `.env` files or build secrets into container layers.
- Do not run `npm run seed:test-users` in production. The seed script refuses `NODE_ENV=production`.
- Restrict MongoDB access to the API network and keep GridFS in the same backed-up database.
- Use platform logs and health checks to detect failed database connections. Restart policy should be enabled for both containers.
- Keep Node and Nginx base images updated and rebuild regularly for security fixes.

`server/.env.production.example` lists the API variables. Copy values into the platform's configuration rather than using that example file as a source of real secrets.
