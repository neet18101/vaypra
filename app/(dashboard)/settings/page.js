import { createClient } from "@/utils/supabase/server";
import SettingsContent from "./SettingsContent";

export default async function SettingsPage() {
  let profile = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data && data.business_name) profile = data;
    }
  } catch (e) {}

  return <SettingsContent profile={profile} />;
}
