DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly_swimswam') THEN
    DROP ROLE readonly_swimswam;
  END IF;
END
$$;

CREATE ROLE admin WITH LOGIN PASSWORD '_________';
GRANT CONNECT ON DATABASE "swimSwamPickem" TO admin;
GRANT USAGE ON SCHEMA public TO admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO admin;