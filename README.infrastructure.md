
This is the runtime/configuration foundation for the project. It is
deliberately established before the backend game core.

## Local development

Create the repository-level `.env` from `.env.example`, then:

```bash
docker compose up --build
```

Development endpoints:

- frontend: http://localhost:5173
- Django: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

Django uses `config.settings.development`.

## Production-shaped stack

```bash
docker compose -f docker-compose.prod.yml up --build
```

The production-shaped stack contains Gunicorn, PostgreSQL, Redis, the
built frontend and an nginx entry point.

Django uses `config.settings.production`.

## Configuration layout

```text
app/backend/config/settings/
    __init__.py
    base.py
    development.py
    production.py
```

`config/settings.py` is retained only as a compatibility entry point for
tools that expect the traditional Django settings module.

`.env` and `.gitignore` belong at the repository root because frontend,
backend and infrastructure are all part of the same repository.
