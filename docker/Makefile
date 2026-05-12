MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
PROJECT_DIR := $(abspath $(MAKEFILE_DIR)/..)
ENV_FILE := $(MAKEFILE_DIR)/.env
IMAGE_NAME ?= ippbx
VERSION ?= $(shell node -p "require('$(MAKEFILE_DIR)/../package.json').version")
IMAGE_TAG ?= $(VERSION)

export IMAGE_NAME
export IMAGE_TAG
export APP_VERSION := $(VERSION)

COMPOSE := IMAGE_NAME=$(IMAGE_NAME) IMAGE_TAG=$(IMAGE_TAG) docker compose -f $(MAKEFILE_DIR)/compose.yaml --env-file $(ENV_FILE)

define load_env
	set -a; \
	. $(ENV_FILE); \
	set +a;
endef

.PHONY: print-image
print-image: ## Print the docker image name and tag.
	@echo $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: network
network: ## Create the external Docker network used by compose.
	@docker network inspect webapp >/dev/null 2>&1 || docker network create webapp

.PHONY: build-production
build-production: ## Build the production docker image.
	@test -f $(ENV_FILE) || (echo "Missing $(ENV_FILE). Run 'make -f docker/Makefile env' first."; exit 1)
	@$(load_env) \
	docker build \
		-f $(MAKEFILE_DIR)/Dockerfile \
		--target runner \
		--build-arg APP_VERSION=$(APP_VERSION) \
		--build-arg NEXT_PUBLIC_BACKEND_URL="$$NEXT_PUBLIC_BACKEND_URL" \
		--build-arg NEXT_PUBLIC_BACKEND_URL_TARGET="$$NEXT_PUBLIC_BACKEND_URL_TARGET" \
		-t $(IMAGE_NAME):$(IMAGE_TAG) \
		-t xswitch.tencentcloudcr.com/free/ippbx:latest \
		$(PROJECT_DIR)

.PHONY: push-production
push-production: ## Push the production docker image.
	docker push xswitch.tencentcloudcr.com/free/ippbx:latest

.PHONY: start-production
start-production: ## Start trigger first, then web container.
	@test -f $(ENV_FILE) || (echo "Missing $(ENV_FILE). Run 'make -f docker/Makefile env' first."; exit 1)
	$(COMPOSE) up -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	$(COMPOSE) down
.PHONY: env
env:
	cp $(MAKEFILE_DIR)/.env.example $(MAKEFILE_DIR)/.env
