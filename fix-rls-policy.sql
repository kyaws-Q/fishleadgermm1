-- Enable Row Level Security on the purchases table
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Delete existing policies if they are causing issues
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON purchases;

-- Create proper policies with correct syntax
CREATE POLICY "Users can view their own purchases" 
ON purchases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
ON purchases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
ON purchases FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases" 
ON purchases FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_is_deleted_idx ON purchases(is_deleted);

-- Add a trigger to always set user_id to the authenticated user on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS purchases_set_user_id ON purchases;
CREATE TRIGGER purchases_set_user_id
  BEFORE INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Create a stored procedure for soft_delete functionality
CREATE OR REPLACE FUNCTION soft_delete_purchase(purchase_id uuid, user_id uuid)
RETURNS json AS $$
DECLARE
  purchase_record record;
BEGIN
  UPDATE purchases
  SET is_deleted = true, deleted_at = now()
  WHERE id = purchase_id AND user_id = user_id
  RETURNING * INTO purchase_record;
  
  RETURN row_to_json(purchase_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a stored procedure for recovering (undeleting) purchases
CREATE OR REPLACE FUNCTION recover_purchase(purchase_id uuid, user_id uuid)
RETURNS json AS $$
DECLARE
  purchase_record record;
BEGIN
  UPDATE purchases
  SET is_deleted = false, deleted_at = null
  WHERE id = purchase_id AND user_id = user_id
  RETURNING * INTO purchase_record;
  
  RETURN row_to_json(purchase_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 