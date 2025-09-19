import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, Vendor, Evidence } from '../types';
import { RiskLevel, PolicyStatus, UserRole } from '../types';

// Real Supabase API service
export const supabaseApi = {
  // Check if Supabase is available
  isConfigured: () => isSupabaseConfigured,

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('organizations')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async createOrganization(name: string, industry?: string): Promise<Organization> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, industry })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Projects
  async getProjectsForConsultant(clientOrgIds: string[]): Promise<Project[]> {
    if (!isSupabaseConfigured || clientOrgIds.length === 0) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('organization_id', clientOrgIds);

    if (error) throw error;
    return data || [];
  },

  async getProjectForClient(orgId: string): Promise<Project | undefined> {
    if (!isSupabaseConfigured) return undefined;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', orgId)
      .single();

    if (error) return undefined;
    return data;
  },

  async getProjectById(projectId: string): Promise<Project | undefined> {
    if (!isSupabaseConfigured) return undefined;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) return undefined;
    return data;
  },

  async createProject(name: string, organizationId: string, frameworks: string[]): Promise<Project> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        organization_id: organizationId,
        frameworks,
        status: 'planning'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Controls
  async getControls(frameworks: string[]): Promise<Control[]> {
    if (!isSupabaseConfigured || frameworks.length === 0) return [];

    const { data, error } = await supabase
      .from('controls')
      .select('*')
      .in('framework', frameworks);

    if (error) throw error;
    return data || [];
  },

  // Assessment Items
  async getAssessmentItems(projectId: string): Promise<AssessmentItem[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('assessment_items')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  },

  async updateAssessmentItem(id: string, updates: Partial<AssessmentItem>): Promise<AssessmentItem> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('assessment_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createAssessmentItem(assessmentItem: Omit<AssessmentItem, 'id'>): Promise<AssessmentItem> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('assessment_items')
      .insert(assessmentItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Risks
  async getRisks(projectId: string): Promise<Risk[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  },

  async getAllRisksForProjects(projectIds: string[]): Promise<Risk[]> {
    if (!isSupabaseConfigured || projectIds.length === 0) return [];

    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .in('project_id', projectIds);

    if (error) throw error;
    return data || [];
  },

  async createRisk(risk: Omit<Risk, 'id'>): Promise<Risk> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('risks')
      .insert(risk)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRisk(id: string, updates: Partial<Risk>): Promise<Risk> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('risks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Policies
  async getPolicies(projectId: string): Promise<Policy[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  },

  async createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('policies')
      .insert(policy)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Vendors
  async getVendors(projectId: string): Promise<Vendor[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  },

  async createVendor(vendor: Omit<Vendor, 'id'>): Promise<Vendor> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Evidence
  async getEvidence(projectId: string): Promise<Evidence[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  },

  async uploadEvidence(file: File, projectId: string, controlId?: string, assessmentItemId?: string): Promise<Evidence> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create evidence record
    const { data, error } = await supabase
      .from('evidence')
      .insert({
        title: file.name,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        project_id: projectId,
        control_id: controlId,
        assessment_item_id: assessmentItemId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // File download URL
  async getEvidenceUrl(filePath: string): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data } = await supabase.storage
      .from('evidence')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl || '';
  },

  // Reports
  async createReport(title: string, type: string, projectId: string, pdfBlob: Blob): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    // Upload PDF to Supabase Storage
    const fileName = `${type}-${Date.now()}.pdf`;
    const filePath = `${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf'
      });

    if (uploadError) throw uploadError;

    // Create report record
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        type,
        project_id: projectId,
        file_path: filePath,
        file_name: fileName
      })
      .select()
      .single();

    if (error) throw error;

    // Return download URL
    const { data: urlData } = await supabase.storage
      .from('reports')
      .createSignedUrl(filePath, 3600);

    return urlData?.signedUrl || '';
  },

  // User management
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url,
      organizationId: profile.organization_id
    };
  }
};

// Consultant-Client relationships
export const consultantApi = {
  async getLinkedClients(consultantOrgId: string): Promise<string[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('consultant_client_links')
      .select('client_org_id')
      .eq('consultant_org_id', consultantOrgId);

    if (error) return [];
    return data.map(link => link.client_org_id);
  },

  async linkClient(consultantOrgId: string, clientOrgId: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('consultant_client_links')
      .insert({
        consultant_org_id: consultantOrgId,
        client_org_id: clientOrgId
      });

    if (error) throw error;
  }
};