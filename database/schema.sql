CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    boundary GEOMETRY(Polygon, 4326),
    metadata JSONB
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id),
    name VARCHAR(150),
    contractor VARCHAR(150),
    budget NUMERIC,
    utilization NUMERIC,
    status VARCHAR(50)
);

CREATE TABLE progress_reports (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),
    report_date DATE,
    milestone VARCHAR(200),
    completion_rate NUMERIC,
    notes TEXT
);
