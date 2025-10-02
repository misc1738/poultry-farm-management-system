-- Create flocks table
CREATE TABLE IF NOT EXISTS flocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  hatch_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create birds table (for individual bird tracking)
CREATE TABLE IF NOT EXISTS birds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
  tag_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'healthy',
  weight_kg DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feed_inventory table
CREATE TABLE IF NOT EXISTS feed_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_type VARCHAR(255) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10, 2),
  supplier VARCHAR(255),
  purchase_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_records table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
  bird_id UUID REFERENCES birds(id) ON DELETE CASCADE,
  record_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  treatment TEXT,
  vet_name VARCHAR(255),
  medication VARCHAR(255),
  cost DECIMAL(10, 2),
  record_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_records table
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  eggs_collected INTEGER DEFAULT 0,
  mortality_count INTEGER DEFAULT 0,
  average_weight_kg DECIMAL(10, 2),
  feed_consumed_kg DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feed_consumption table
CREATE TABLE IF NOT EXISTS feed_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
  feed_inventory_id UUID REFERENCES feed_inventory(id) ON DELETE SET NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  consumption_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flocks_status ON flocks(status);
CREATE INDEX IF NOT EXISTS idx_birds_flock_id ON birds(flock_id);
CREATE INDEX IF NOT EXISTS idx_birds_status ON birds(status);
CREATE INDEX IF NOT EXISTS idx_health_records_flock_id ON health_records(flock_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date);
CREATE INDEX IF NOT EXISTS idx_production_records_flock_id ON production_records(flock_id);
CREATE INDEX IF NOT EXISTS idx_production_records_date ON production_records(record_date);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_flock_id ON feed_consumption(flock_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_date ON feed_consumption(consumption_date);
