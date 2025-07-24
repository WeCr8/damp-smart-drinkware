/*
  # Create device_data table

  1. New Tables
    - `device_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, device display name)
      - `type` (text, device type)
      - `battery_level` (integer, battery percentage 0-100)
      - `status` (text, connection status)
      - `bluetooth_id` (text, bluetooth device identifier)
      - `firmware` (text, firmware version)
      - `signal_strength` (integer, signal strength 1-5)
      - `zone_id` (text, associated zone identifier)
      - `last_seen` (timestamptz, last activity timestamp)
      - `is_active` (boolean, whether device is active)
      - `metadata` (jsonb, additional device metadata)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `device_data` table
    - Add policies for authenticated users to manage their own devices

  3. Indexes
    - Add index on user_id for efficient queries
    - Add index on status for filtering by connection status
    - Add index on type for filtering by device type
*/

-- Create device_data table
CREATE TABLE IF NOT EXISTS device_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  battery_level integer DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  status text DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
  bluetooth_id text DEFAULT '',
  firmware text DEFAULT '1.0.0',
  signal_strength integer DEFAULT 3 CHECK (signal_strength >= 1 AND signal_strength <= 5),
  zone_id text DEFAULT '',
  last_seen timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE device_data ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_device_data_user_id ON device_data(user_id);
CREATE INDEX IF NOT EXISTS idx_device_data_status ON device_data(status);
CREATE INDEX IF NOT EXISTS idx_device_data_type ON device_data(type);
CREATE INDEX IF NOT EXISTS idx_device_data_created_at ON device_data(created_at);

-- Create unique constraint on user_id + name to prevent duplicate device names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_data_user_name_unique ON device_data(user_id, name) WHERE is_active = true;

-- RLS Policies

-- Users can view their own devices
CREATE POLICY "Users can view own devices"
  ON device_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own devices
CREATE POLICY "Users can insert own devices"
  ON device_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own devices
CREATE POLICY "Users can update own devices"
  ON device_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own devices
CREATE POLICY "Users can delete own devices"
  ON device_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_device_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_device_data_updated_at
  BEFORE UPDATE ON device_data
  FOR EACH ROW
  EXECUTE FUNCTION handle_device_data_updated_at();