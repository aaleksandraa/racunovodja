import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProfiles = (filters?: {
  search?: string;
  serviceId?: string;
  entityId?: string;
  cityId?: string;
}) => {
  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      let query = supabase
        .from("public_profiles")
        .select(`
          id,
          first_name,
          last_name,
          company_name,
          short_description,
          profile_image_url,
          slug,
          latitude,
          longitude,
          business_city_id,
          email,
          phone,
          website,
          license_type,
          is_license_verified,
          accepting_new_clients,
          business_type,
          years_experience,
          works_online,
          has_physical_office
        `)
        .eq("is_active", true)
        .eq("registration_completed", true);

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
        );
      }

      if (filters?.cityId && filters.cityId !== "all") {
        query = query.eq("business_city_id", filters.cityId);
      }

      if (filters?.serviceId) {
        const { data: profileServices } = await supabase
          .from("profile_services")
          .select("profile_id")
          .eq("service_id", filters.serviceId);

        if (profileServices) {
          const profileIds = profileServices.map((ps) => ps.profile_id);
          if (profileIds.length > 0) {
            query = query.in("id", profileIds);
          } else {
            return [];
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

export const useProfile = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["profile", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          company_name,
          business_type,
          business_city_id,
          short_description,
          long_description,
          profile_image_url,
          slug,
          email,
          phone,
          website,
          years_experience,
          works_online,
          works_locally_only,
          has_physical_office,
          latitude,
          longitude,
          professional_organizations,
          linkedin_url,
          facebook_url,
          instagram_url,
          google_maps_url,
          business_street,
          is_active,
          registration_completed,
          created_at,
          updated_at,
          license_type,
          is_license_verified,
          accepting_new_clients,
          business_city:cities!profiles_business_city_id_fkey(name, postal_code)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .eq("registration_completed", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      return data;
    },
    enabled: !!slug,
  });
};

export const useProfileGallery = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["gallery", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("profile_id", profileId)
        .order("display_order", { ascending: true });

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useProfileServices = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["profile-services", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("profile_services")
        .select(`
          service_id,
          service_categories (
            id,
            name,
            parent_id
          )
        `)
        .eq("profile_id", profileId);

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useProfileReferences = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["references", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("client_references")
        .select("*")
        .eq("profile_id", profileId);

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useProfileCertificates = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["certificates", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("profile_id", profileId);

      return data || [];
    },
    enabled: !!profileId,
  });
};

export const useWorkingHours = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["working-hours", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data } = await supabase
        .from("working_hours")
        .select("*")
        .eq("profile_id", profileId)
        .order("day_of_week", { ascending: true });

      return data || [];
    },
    enabled: !!profileId,
  });
};
