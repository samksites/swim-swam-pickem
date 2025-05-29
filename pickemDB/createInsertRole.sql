DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'insert_swimswam') THEN
    DROP ROLE insert_swimswam;
  END IF;
END
$$;

CREATE ROLE insert_swimswam WITH LOGIN PASSWORD '_________';
GRANT CONNECT ON DATABASE "swimSwamPickem" TO insert_swimswam;
GRANT USAGE ON SCHEMA public TO insert_swimswam;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO insert_swimswam;