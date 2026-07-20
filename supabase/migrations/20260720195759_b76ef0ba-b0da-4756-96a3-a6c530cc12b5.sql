
DO $$
DECLARE
  uid uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', uid,
    'authenticated', 'authenticated',
    'inativo@prodem.local',
    crypt('PRODEM@2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Usuario Inativo"}'::jsonb,
    now(), now(), '', '', '', ''
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), uid,
    jsonb_build_object('sub', uid::text, 'email', 'inativo@prodem.local', 'email_verified', true),
    'email', uid::text, now(), now(), now());

  UPDATE public.profiles SET status = 'inactive', full_name = 'Usuario Inativo' WHERE id = uid;
END $$;
