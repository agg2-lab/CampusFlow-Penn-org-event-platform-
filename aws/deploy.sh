#!/bin/bash
set -euo pipefail

# ── CampusFlow AWS Deployment Script ──
# Prerequisites: AWS CLI configured, Docker installed, ECR repos created

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
CLUSTER_NAME="campusflow-cluster"
SERVICE_NAME="campusflow-service"

echo "=== CampusFlow Deployment ==="
echo "Region:  ${AWS_REGION}"
echo "Account: ${AWS_ACCOUNT_ID}"
echo ""

# 1. Authenticate Docker with ECR
echo "[1/5] Authenticating with ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | \
  docker login --username AWS --password-stdin "${ECR_BASE}"

# 2. Build & push backend
echo "[2/5] Building backend..."
docker build -t campusflow-backend ./backend
docker tag campusflow-backend:latest "${ECR_BASE}/campusflow-backend:latest"
docker push "${ECR_BASE}/campusflow-backend:latest"

# 3. Build & push frontend
echo "[3/5] Building frontend..."
docker build -t campusflow-frontend ./frontend
docker tag campusflow-frontend:latest "${ECR_BASE}/campusflow-frontend:latest"
docker push "${ECR_BASE}/campusflow-frontend:latest"

# 4. Update ECS task definition
echo "[4/5] Updating task definition..."
sed -e "s/<AWS_ACCOUNT_ID>/${AWS_ACCOUNT_ID}/g" \
    -e "s/<REGION>/${AWS_REGION}/g" \
    -e "s/<ACCOUNT>/${AWS_ACCOUNT_ID}/g" \
    aws/task-definition.json > /tmp/task-def.json

aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-def.json \
  --region "${AWS_REGION}"

# 5. Update ECS service
echo "[5/5] Updating ECS service..."
aws ecs update-service \
  --cluster "${CLUSTER_NAME}" \
  --service "${SERVICE_NAME}" \
  --task-definition campusflow \
  --force-new-deployment \
  --region "${AWS_REGION}"

echo ""
echo "=== Deployment initiated! ==="
echo "Monitor: aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}"
