-- Insert sample flocks
INSERT INTO flocks (name, breed, quantity, hatch_date, status, notes) VALUES
  ('Flock A - Layers', 'Rhode Island Red', 150, '2024-01-15', 'active', 'Primary egg production flock'),
  ('Flock B - Broilers', 'Cornish Cross', 200, '2024-11-01', 'active', 'Meat production batch'),
  ('Flock C - Layers', 'Leghorn', 100, '2023-12-10', 'active', 'High egg production breed');

-- Insert sample feed inventory
INSERT INTO feed_inventory (feed_type, quantity_kg, unit_cost, supplier, purchase_date, expiry_date) VALUES
  ('Layer Starter', 500.00, 0.45, 'Farm Supply Co', '2025-01-15', '2025-07-15'),
  ('Broiler Grower', 750.00, 0.42, 'Farm Supply Co', '2025-01-20', '2025-07-20'),
  ('Layer Finisher', 300.00, 0.48, 'Poultry Feed Ltd', '2025-01-10', '2025-07-10'),
  ('Organic Layer Feed', 200.00, 0.65, 'Organic Farms', '2025-01-25', '2025-07-25');

-- Insert sample production records
INSERT INTO production_records (flock_id, record_date, eggs_collected, mortality_count, average_weight_kg, feed_consumed_kg, notes)
SELECT 
  f.id,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  CASE 
    WHEN f.breed LIKE '%Layer%' THEN 120 + (RANDOM() * 30)::INTEGER
    ELSE 0
  END,
  (RANDOM() * 2)::INTEGER,
  1.5 + (RANDOM() * 0.5),
  50 + (RANDOM() * 20),
  'Daily production record'
FROM flocks f
CROSS JOIN generate_series(0, 6) AS n
WHERE f.status = 'active';

-- Insert sample health records
INSERT INTO health_records (flock_id, record_type, description, treatment, vet_name, record_date)
SELECT 
  id,
  'Vaccination',
  'Newcastle Disease vaccination',
  'ND vaccine administered',
  'Dr. Smith',
  CURRENT_DATE - 30
FROM flocks
WHERE status = 'active';
