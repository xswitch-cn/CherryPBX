MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
COMPOSE := docker compose -f $(MAKEFILE_DIR)/compose.yaml --env-file $(MAKEFILE_DIR)/.env

IMAGE_NAME ?= ippbx
VERSION ?= $(shell node -p "require('$(MAKEFILE_DIR)/../package.json').version")

export IMAGE_NAME
export APP_VERSION := $(VERSION)

.PHONY: print-image
print-image: ## Print the docker image name and tag.
	@echo $(IMAGE_NAME):$(APP_VERSION)

.PHONY: build-production
build-production: ## Build the production docker image.
	$(COMPOSE) build

.PHONY: start-production
start-production: ## Start trigger first, then web container.
	$(COMPOSE) up -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	$(COMPOSE) down
.PHONY: env
env:
	cp $(MAKEFILE_DIR)/.env.example $(MAKEFILE_DIR)/.env
