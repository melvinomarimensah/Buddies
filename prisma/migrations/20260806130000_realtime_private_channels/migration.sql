-- Realtime Authorization for the chat's private broadcast channels.
--
-- The chat client (components/messages/messages-view.tsx) opens a channel named
-- 'conversation:<id>' with config.private = true and calls realtime.setAuth(),
-- so Supabase Realtime authorizes every subscribe/send against RLS policies on
-- realtime.messages using the signed-in user's JWT. Only a conversation's buyer
-- or seller may join; anyone else (including a holder of just the public anon
-- key) is denied.
--
-- The participation check reads public."Conversation", which itself has RLS
-- enabled with no policies for the authenticated role — so the check must run
-- through a SECURITY DEFINER function (owned by postgres, which has BYPASSRLS)
-- rather than inline in the policy, otherwise the subquery sees zero rows and
-- every participant is wrongly denied.
--
-- realtime.messages already has RLS enabled and is owned by
-- supabase_realtime_admin, but `postgres` may CREATE POLICY on it, so no
-- ALTER TABLE is needed. The whole thing is guarded + run via EXECUTE so this
-- migration is a harmless no-op on a plain-Postgres database (e.g. the local
-- test DB) that has no `realtime` schema or `auth.uid()`.

DO $do$
BEGIN
  IF to_regclass('realtime.messages') IS NOT NULL THEN
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.realtime_is_conversation_participant(topic text)
      RETURNS boolean
      LANGUAGE sql
      SECURITY DEFINER
      SET search_path = public
      AS $fn$
        SELECT EXISTS (
          SELECT 1 FROM public."Conversation" c
          WHERE c.id = split_part(topic, ':', 2)
            AND (c."buyerId" = (auth.uid())::text OR c."sellerId" = (auth.uid())::text)
        )
      $fn$;
    $sql$;

    EXECUTE 'DROP POLICY IF EXISTS "conversation participants access their channel" ON realtime.messages';

    EXECUTE $sql$
      CREATE POLICY "conversation participants access their channel"
      ON realtime.messages
      FOR ALL
      TO authenticated
      USING (public.realtime_is_conversation_participant(realtime.topic()))
      WITH CHECK (public.realtime_is_conversation_participant(realtime.topic()));
    $sql$;
  END IF;
END
$do$;
