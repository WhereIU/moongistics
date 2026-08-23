SHELL := /bin/sh

COMPOSE := docker compose
COMPOSE_PROD := docker compose -f docker-compose.prod.yml

.PHONY: dev build up down logs shell migrate makemigrations test prod-up prod-down

dev:
	$(COMPOSE) up --build

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

shell:
	$(COMPOSE) exec backend sh

migrate:
	$(COMPOSE) run --rm backend python manage.py migrate

makemigrations:
	$(COMPOSE) run --rm backend python manage.py makemigrations

test:
	$(COMPOSE) run --rm backend python manage.py test

prod-up:
	$(COMPOSE_PROD) up --build -d

prod-down:
	$(COMPOSE_PROD) down
