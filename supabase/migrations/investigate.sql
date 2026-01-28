
-- Investigate policies on vehicle_assignments
select * 
from pg_policies 
where tablename = 'vehicle_assignments';

-- Check table definition
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'vehicle_assignments';
