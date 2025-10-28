// scripts/create-tables.ts
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTables() {
  console.log('Creating tables...');

  // 1. users
  await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'super_admin',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  // 2. rooms
  await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_number TEXT UNIQUE NOT NULL,
        room_type TEXT NOT NULL CHECK (room_type IN ('single', 'double', 'suite')),
        status TEXT NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Needs Cleaning')),
        rate DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  // 3. reservations
  await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' 
          CHECK (status IN ('pending', 'paid', 'checked_in', 'checked_out', 'cancelled')),
        amount DECIMAL(10,2),
        payment_reference TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
      );
    `
  });

  console.log('Tables created!');
}

createTables().catch(console.error);