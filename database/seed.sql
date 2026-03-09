INSERT INTO regions (name, boundary, metadata)
VALUES ('Metro Manila', ST_GeomFromText('POLYGON((...))', 4326), '{"budget":1000000,"utilization":500000,"active_projects":5,"contractor":"ABC Corp"}');
