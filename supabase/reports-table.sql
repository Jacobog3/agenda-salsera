-- Create reports table for error/issue reporting
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  reason text NOT NULL,
  details text,
  contact_email text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow anonymous inserts (public can report issues)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reports"
  ON reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can do anything with reports"
  ON reports FOR ALL
  USING (true)
  WITH CHECK (true);
