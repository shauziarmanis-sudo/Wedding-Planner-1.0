'use server'

import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getAppStatus(): Promise<{ status: string; createdAt: string }> {
  const metadata = await getMetadata();
  return { 
    status: metadata?.app_status || "WEDDING", 
    createdAt: metadata?.created_at || new Date().toISOString() 
  };
}

export async function getMetadata(): Promise<any> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    const { data, error } = await supabase
      .from('wedding_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return {};

    return data;
  } catch (error: any) {
    console.error("Error fetching metadata:", error);
    return {};
  }
}

export async function getMetadataPublic(userId: string): Promise<any> {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('wedding_profiles')
      .select('bride_name, groom_name, wedding_date, venue_name, venue_address, akad_time, resepsi_time')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) return {};
    
    return data;
  } catch (error: any) {
    console.error("Error fetching public metadata:", error);
    return {};
  }
}
