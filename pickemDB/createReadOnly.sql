DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly_swimswam') THEN
    DROP ROLE readonly_swimswam;
  END IF;
END
$$;
CREATE ROLE readonly_swimswam WITH LOGIN PASSWORD '_________';
GRANT CONNECT ON DATABASE "swimSwamPickem" TO readonly_swimswam;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;