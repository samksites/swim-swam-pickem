#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/../../pickemDB/tableManagment/competitionTables.sql"

if [[ ! -f "${SQL_FILE}" ]]; then
  echo "SQL file not found at: ${SQL_FILE}" >&2
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-swimswam}"
DB_USER="${DB_USER:-samks}"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "DB_PASSWORD is not set. Export it before running this script." >&2
  exit 1
fi

echo "Running schema script: ${SQL_FILE}"
echo "Target DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

PGPASSWORD="${DB_PASSWORD}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -v ON_ERROR_STOP=1 \
  -f "${SQL_FILE}"

echo "competitionTables.sql executed successfully."
