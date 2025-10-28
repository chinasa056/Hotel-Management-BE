// scripts/seed-data.ts
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ROOM_TYPES = ['single', 'double', 'suite'] as const;
const RESERVATION_STATUSES = ['pending', 'paid', 'checked_in', 'checked_out'] as const;

async function seed() {
  console.log('Seeding data...');

  // 1. Seed 3 Users (all super_admin for now)
  const passwordHash = await bcrypt.hash('password123', 10);

  const { error: userError } = await supabase.from('users').upsert([
    {
      name: 'Admin User',
      email: 'admin@hotel.com',
      password_hash: passwordHash,
      role: 'super_admin',
    },
    {
      name: 'Manager User',
      email: 'manager@hotel.com',
      password_hash: passwordHash,
      role: 'super_admin',
    },
    {
      name: 'Front Desk',
      email: 'frontdesk@hotel.com',
      password_hash: passwordHash,
      role: 'super_admin',
    },
  ], { onConflict: 'email' });

  if (userError) throw userError;

  // 2. Seed 15 Rooms
  const rooms = Array.from({ length: 15 }, (_, i) => {
    const floor = String(Math.floor(i / 5) + 1).padStart(2, '0');
    const num = String((i % 5) + 1).padStart(2, '0');
    const room_number = `${floor}${num}`;

    let room_type: 'single' | 'double' | 'suite';
    let rate: number;

    if (i < 6) { room_type = 'single'; rate = 80 + (i % 3) * 10; }
    else if (i < 12) { room_type = 'double'; rate = 120 + (i % 3) * 15; }
    else { room_type = 'suite'; rate = 250 + (i % 3) * 50; }

    return { room_number, room_type, rate, status: 'Vacant' };
  });

  const { data: insertedRooms, error: roomError } = await supabase
    .from('rooms')
    .upsert(rooms, { onConflict: 'room_number' })
    .select();

  if (roomError) throw roomError;

  // 3. Seed 12 Reservations
  const reservations = Array.from({ length: 12 }, (_, i) => {
    const room = insertedRooms![i % insertedRooms!.length];
    const nights = faker.number.int({ min: 1, max: 5 });
    const check_in_date = faker.date.between({ from: '2025-11-01', to: '2025-12-20' });
    const check_out_date = new Date(check_in_date);
    check_out_date.setDate(check_in_date.getDate() + nights);

    const status = i < 3 ? 'pending' : i < 6 ? 'paid' : i < 8 ? 'checked_in' : 'checked_out';
    const amount = room.rate * nights;

    return {
      room_id: room.id,
      guest_name: faker.person.fullName(),
      guest_email: faker.internet.email(),
      check_in_date: check_in_date.toISOString().split('T')[0],
      check_out_date: check_out_date.toISOString().split('T')[0],
      status,
      amount,
      payment_reference: status === 'paid' || status === 'checked_in' || status === 'checked_out' 
        ? `pay_${faker.string.alphanumeric(10)}` 
        : null,
    };
  });

  const { error: resError } = await supabase
    .from('reservations')
    .insert(reservations);

  if (resError) throw resError;

  console.log('Seeding complete!');
  console.log('Login with:');
  console.log('   Email: admin@hotel.com');
  console.log('   Password: password123');
}

seed().catch(console.error);