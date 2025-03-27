-- Add priority column to calendar_events table

-- First create the priority_level enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
  END IF;
END
$$;

-- Check if the column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'priority'
  ) THEN
    -- Add the priority column with default value 'medium'
    ALTER TABLE calendar_events ADD COLUMN priority priority_level DEFAULT 'medium';
  END IF;
END
$$;
