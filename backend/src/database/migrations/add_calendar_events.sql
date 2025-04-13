-- Migration to add calendar_events table

-- First create the event_type enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('meeting', 'task', 'reminder');
  END IF;
END
$$;

-- Create priority_level enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
  END IF;
END
$$;

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type event_type NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  user_id INT,
  customer_id INT,
  order_id INT,
  priority priority_level DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calendar_events_timestamp') THEN
    CREATE TRIGGER update_calendar_events_timestamp
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END
$$;

-- Create a separate migration for sample data
-- We'll just create the table structure for now
