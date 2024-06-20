CREATE
OR REPLACE FUNCTION notify_new_personal_project () RETURNS trigger AS $$
BEGIN
  IF NEW.is_personal THEN
    PERFORM pg_notify('new_personal_project', row_to_json(NEW)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_personal_project_trigger
AFTER INSERT ON public.projects FOR EACH ROW
EXECUTE FUNCTION notify_new_personal_project ();