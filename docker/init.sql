ALTER SYSTEM SET listen_addresses = '*';
ALTER SYSTEM SET max_connections = 100;
SELECT pg_reload_conf();
