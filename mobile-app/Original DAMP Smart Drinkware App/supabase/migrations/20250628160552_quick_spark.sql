/*
  # Create device_data table for DAMP smart drinkware

  1. New Tables
    - `device_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, device display name)
      - `type` (text, device type: cup, sleeve, bottle, bottom, damp-cup)
      - `battery_level` (integer, 0-100)
      - `status` (text, connection status)
      - `bluetooth_id` (text, bluetooth device identifier)
      - `firmware` (text, firmware version)
      - `signal_strength` (integer, 1-5)
      - `zone_id` (text, associated zone)
      - `last_seen` (timestamptz, last activity)
      - `is_active` (boolean, device active status)
      - `metadata` (jsonb, additional device data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `device_data` table
    - Add policies for authenticated users to manage their own devices

  3. Indexes
    - Index on user_id for efficient queries
    - Index on status for filtering
    - Index on type for device type queries
*/

-- Create device_data table
CREATE TABLE IF NOT EXISTS device_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cup', 'sleeve', 'bottle', 'bottom', 'damp-cup')),
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

-- Enable RLS
ALTER TABLE device_data ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_device_data_user_id ON device_data(user_id);
CREATE INDEX IF NOT EXISTS idx_device_data_status ON device_data(status);
CREATE INDEX IF NOT EXISTS idx_device_data_type ON device_data(type);
CREATE INDEX IF NOT EXISTS idx_device_data_created_at ON device_data(created_at);

-- Create policies for RLS
CREATE POLICY "Users can view their own devices"
  ON device_data
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own devices"
  ON device_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own devices"
  ON device_data
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own devices"
  ON device_data
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_device_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_device_data_updated_at
  BEFORE UPDATE ON device_data
  FOR EACH ROW
  EXECUTE FUNCTION handle_device_data_updated_at();