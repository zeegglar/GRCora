import { supabase } from '../lib/supabase';
import type { Policy, ApprovalWorkflow, PolicyVersion, PolicyReview } from '../types/comprehensive';

interface WorkflowStage {
  stage_name: string;
  approver_role: string;
  approver_id?: string;
  required: boolean;
  sequence_order: number;
  approval_criteria?: string;
  auto_approve_conditions?: string[];
}

interface ApprovalRequest {
  id: string;
  policy_id: string;
  policy_version: string;
  requestor_id: string;
  current_stage: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  workflow_id: string;
  created_at: Date;
  due_date: Date;
  approval_history: Array<{
    stage: string;
    approver_id: string;
    action: 'approved' | 'rejected' | 'requested_changes';
    timestamp: Date;
    comments?: string;
  }>;
}

interface PolicyMetrics {
  total_policies: number;
  pending_reviews: number;
  overdue_reviews: number;
  approval_rate: number;
  average_approval_time: number;
  policies_by_status: { [key: string]: number };
  policies_by_category: { [key: string]: number };
  review_metrics: {
    on_time: number;
    late: number;
    cancelled: number;
  };
}

export class PolicyManagementService {
  private static instance: PolicyManagementService;

  private readonly DEFAULT_WORKFLOWS = {
    'standard': {
      name: 'Standard Policy Approval',
      stages: [
        { stage_name: 'department_review', approver_role: 'department_head', required: true, sequence_order: 1 },
        { stage_name: 'legal_review', approver_role: 'legal_counsel', required: true, sequence_order: 2 },
        { stage_name: 'executive_approval', approver_role: 'executive', required: true, sequence_order: 3 },
        { stage_name: 'final_publication', approver_role: 'policy_admin', required: true, sequence_order: 4 }
      ]
    },
    'security': {
      name: 'Security Policy Approval',
      stages: [
        { stage_name: 'security_review', approver_role: 'security_officer', required: true, sequence_order: 1 },
        { stage_name: 'ciso_review', approver_role: 'ciso', required: true, sequence_order: 2 },
        { stage_name: 'legal_review', approver_role: 'legal_counsel', required: true, sequence_order: 3 },
        { stage_name: 'executive_approval', approver_role: 'ceo', required: true, sequence_order: 4 }
      ]
    },
    'hr': {
      name: 'HR Policy Approval',
      stages: [
        { stage_name: 'hr_review', approver_role: 'hr_manager', required: true, sequence_order: 1 },
        { stage_name: 'legal_review', approver_role: 'legal_counsel', required: true, sequence_order: 2 },
        { stage_name: 'executive_approval', approver_role: 'executive', required: true, sequence_order: 3 }
      ]
    },
    'financial': {
      name: 'Financial Policy Approval',
      stages: [
        { stage_name: 'finance_review', approver_role: 'finance_manager', required: true, sequence_order: 1 },
        { stage_name: 'cfo_review', approver_role: 'cfo', required: true, sequence_order: 2 },
        { stage_name: 'audit_review', approver_role: 'internal_audit', required: false, sequence_order: 3 },
        { stage_name: 'board_approval', approver_role: 'board_member', required: true, sequence_order: 4 }
      ]
    }
  };

  public static getInstance(): PolicyManagementService {
    if (!PolicyManagementService.instance) {
      PolicyManagementService.instance = new PolicyManagementService();
    }
    return PolicyManagementService.instance;
  }

  async createPolicy(
    organizationId: string,
    policyData: {
      title: string;
      description: string;
      category: string;
      content: string;
      scope: string;
      effective_date?: Date;
      review_frequency: 'quarterly' | 'semi_annual' | 'annual' | 'biennial';
      owner_id: string;
      tags?: string[];
    },
    workflowType: keyof typeof this.DEFAULT_WORKFLOWS = 'standard'
  ): Promise<string> {
    try {
      // Create policy record
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert({
          organization_id: organizationId,
          title: policyData.title,
          description: policyData.description,
          category: policyData.category,
          scope: policyData.scope,
          owner_id: policyData.owner_id,
          review_frequency: policyData.review_frequency,
          status: 'draft',
          tags: policyData.tags || [],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (policyError) throw policyError;

      // Create initial version
      const { data: version, error: versionError } = await supabase
        .from('policy_versions')
        .insert({
          policy_id: policy.id,
          version_number: '1.0',
          content: policyData.content,
          author_id: policyData.owner_id,
          status: 'draft',
          effective_date: policyData.effective_date?.toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Initialize approval workflow
      await this.initializeApprovalWorkflow(policy.id, version.id, workflowType, organizationId);

      return policy.id;

    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  private async initializeApprovalWorkflow(
    policyId: string,
    versionId: string,
    workflowType: keyof typeof this.DEFAULT_WORKFLOWS,
    organizationId: string
  ): Promise<void> {
    try {
      const workflow = this.DEFAULT_WORKFLOWS[workflowType];

      // Create workflow definition
      const { data: workflowRecord, error: workflowError } = await supabase
        .from('approval_workflows')
        .insert({
          entity_type: 'policy',
          entity_id: policyId,
          workflow_name: workflow.name,
          stages: workflow.stages,
          organization_id: organizationId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Create approval request
      const { error: requestError } = await supabase
        .from('approval_requests')
        .insert({
          policy_id: policyId,
          policy_version: versionId,
          workflow_id: workflowRecord.id,
          current_stage: workflow.stages[0].stage_name,
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_at: new Date().toISOString()
        });

      if (requestError) throw requestError;

    } catch (error) {
      console.error('Error initializing approval workflow:', error);
      throw error;
    }
  }

  async submitForApproval(
    policyId: string,
    versionId: string,
    submitterId: string
  ): Promise<void> {
    try {
      // Update policy version status
      const { error: versionError } = await supabase
        .from('policy_versions')
        .update({
          status: 'pending_approval',
          submitted_at: new Date().toISOString(),
          submitted_by: submitterId
        })
        .eq('id', versionId);

      if (versionError) throw versionError;

      // Update policy status
      const { error: policyError } = await supabase
        .from('policies')
        .update({
          status: 'pending_approval',
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (policyError) throw policyError;

      // Trigger notification to first approver
      await this.notifyNextApprover(policyId, versionId);

    } catch (error) {
      console.error('Error submitting policy for approval:', error);
      throw error;
    }
  }

  async processApproval(
    requestId: string,
    approverId: string,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string
  ): Promise<void> {
    try {
      // Get current approval request
      const { data: request, error: requestError } = await supabase
        .from('approval_requests')
        .select(`
          *,
          approval_workflows (
            stages
          )
        `)
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      const workflow = request.approval_workflows;
      const currentStageIndex = workflow.stages.findIndex(
        (stage: WorkflowStage) => stage.stage_name === request.current_stage
      );

      if (currentStageIndex === -1) {
        throw new Error('Invalid workflow stage');
      }

      // Record approval action
      const approvalHistory = request.approval_history || [];
      approvalHistory.push({
        stage: request.current_stage,
        approver_id: approverId,
        action,
        timestamp: new Date(),
        comments
      });

      if (action === 'approve') {
        // Move to next stage or complete approval
        const nextStageIndex = currentStageIndex + 1;

        if (nextStageIndex >= workflow.stages.length) {
          // Final approval - publish policy
          await this.publishPolicy(request.policy_id, request.policy_version);

          await supabase
            .from('approval_requests')
            .update({
              status: 'approved',
              approval_history: approvalHistory,
              completed_at: new Date().toISOString()
            })
            .eq('id', requestId);

        } else {
          // Move to next stage
          const nextStage = workflow.stages[nextStageIndex];

          await supabase
            .from('approval_requests')
            .update({
              current_stage: nextStage.stage_name,
              approval_history: approvalHistory,
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId);

          // Notify next approver
          await this.notifyNextApprover(request.policy_id, request.policy_version);
        }

      } else {
        // Rejection or change request
        await supabase
          .from('approval_requests')
          .update({
            status: action === 'reject' ? 'rejected' : 'in_review',
            approval_history: approvalHistory,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        // Update policy status
        await supabase
          .from('policies')
          .update({
            status: action === 'reject' ? 'rejected' : 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', request.policy_id);

        // Update version status
        await supabase
          .from('policy_versions')
          .update({
            status: action === 'reject' ? 'rejected' : 'draft'
          })
          .eq('id', request.policy_version);
      }

    } catch (error) {
      console.error('Error processing approval:', error);
      throw error;
    }
  }

  private async publishPolicy(policyId: string, versionId: string): Promise<void> {
    try {
      // Update policy status to active
      const { error: policyError } = await supabase
        .from('policies')
        .update({
          status: 'active',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (policyError) throw policyError;

      // Update version status to published
      const { error: versionError } = await supabase
        .from('policy_versions')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', versionId);

      if (versionError) throw versionError;

      // Set previous versions to superseded
      await supabase
        .from('policy_versions')
        .update({ status: 'superseded' })
        .eq('policy_id', policyId)
        .neq('id', versionId);

      // Schedule next review
      await this.scheduleNextReview(policyId);

    } catch (error) {
      console.error('Error publishing policy:', error);
      throw error;
    }
  }

  private async scheduleNextReview(policyId: string): Promise<void> {
    try {
      const { data: policy, error } = await supabase
        .from('policies')
        .select('review_frequency, published_at')
        .eq('id', policyId)
        .single();

      if (error) throw error;

      let nextReviewDate = new Date(policy.published_at);

      switch (policy.review_frequency) {
        case 'quarterly':
          nextReviewDate.setMonth(nextReviewDate.getMonth() + 3);
          break;
        case 'semi_annual':
          nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);
          break;
        case 'annual':
          nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);
          break;
        case 'biennial':
          nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 2);
          break;
      }

      await supabase
        .from('policy_reviews')
        .insert({
          policy_id: policyId,
          review_type: 'scheduled',
          scheduled_date: nextReviewDate.toISOString(),
          status: 'scheduled',
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error scheduling next review:', error);
      throw error;
    }
  }

  private async notifyNextApprover(policyId: string, versionId: string): Promise<void> {
    // In a real implementation, this would send notifications via email, Slack, etc.
    console.log(`Notifying next approver for policy ${policyId}, version ${versionId}`);
  }

  async createPolicyVersion(
    policyId: string,
    content: string,
    authorId: string,
    changeReason: string
  ): Promise<string> {
    try {
      // Get current version number
      const { data: versions, error: versionsError } = await supabase
        .from('policy_versions')
        .select('version_number')
        .eq('policy_id', policyId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (versionsError) throw versionsError;

      // Calculate next version number
      const currentVersion = versions?.[0]?.version_number || '1.0';
      const versionParts = currentVersion.split('.');
      const nextMinorVersion = parseInt(versionParts[1]) + 1;
      const nextVersion = `${versionParts[0]}.${nextMinorVersion}`;

      // Create new version
      const { data: version, error: versionError } = await supabase
        .from('policy_versions')
        .insert({
          policy_id: policyId,
          version_number: nextVersion,
          content,
          author_id: authorId,
          change_reason: changeReason,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (versionError) throw versionError;

      return version.id;

    } catch (error) {
      console.error('Error creating policy version:', error);
      throw error;
    }
  }

  async getPolicyMetrics(organizationId: string): Promise<PolicyMetrics> {
    try {
      // Get total policies
      const { count: totalPolicies } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Get pending reviews
      const { count: pendingReviews } = await supabase
        .from('approval_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get overdue reviews
      const { count: overdueReviews } = await supabase
        .from('policy_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      // Get policies by status
      const { data: statusData } = await supabase
        .from('policies')
        .select('status')
        .eq('organization_id', organizationId);

      const policiesByStatus = statusData?.reduce((acc, policy) => {
        acc[policy.status] = (acc[policy.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Get policies by category
      const { data: categoryData } = await supabase
        .from('policies')
        .select('category')
        .eq('organization_id', organizationId);

      const policiesByCategory = categoryData?.reduce((acc, policy) => {
        acc[policy.category] = (acc[policy.category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Mock additional metrics (would calculate from actual data)
      const metrics: PolicyMetrics = {
        total_policies: totalPolicies || 0,
        pending_reviews: pendingReviews || 0,
        overdue_reviews: overdueReviews || 0,
        approval_rate: 87, // Would calculate from approval history
        average_approval_time: 5.2, // Days - would calculate from approval data
        policies_by_status: policiesByStatus,
        policies_by_category: policiesByCategory,
        review_metrics: {
          on_time: 78,
          late: 15,
          cancelled: 7
        }
      };

      return metrics;

    } catch (error) {
      console.error('Error getting policy metrics:', error);
      throw error;
    }
  }

  async getPendingApprovals(
    organizationId: string,
    approverId?: string
  ): Promise<ApprovalRequest[]> {
    try {
      let query = supabase
        .from('approval_requests')
        .select(`
          *,
          policies!inner (
            title,
            category,
            organization_id
          ),
          policy_versions (
            version_number,
            content
          ),
          approval_workflows (
            workflow_name,
            stages
          )
        `)
        .eq('policies.organization_id', organizationId)
        .eq('status', 'pending');

      if (approverId) {
        // Filter by approver role/ID logic would go here
        // This would require joining with user roles and workflow stages
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as any[] || [];

    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  }

  async searchPolicies(
    organizationId: string,
    searchParams: {
      query?: string;
      category?: string;
      status?: string;
      tags?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<Policy[]> {
    try {
      let query = supabase
        .from('policies')
        .select(`
          *,
          policy_versions!inner (
            version_number,
            status,
            published_at
          )
        `)
        .eq('organization_id', organizationId);

      if (searchParams.query) {
        query = query.or(`title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`);
      }

      if (searchParams.category) {
        query = query.eq('category', searchParams.category);
      }

      if (searchParams.status) {
        query = query.eq('status', searchParams.status);
      }

      if (searchParams.tags && searchParams.tags.length > 0) {
        query = query.overlaps('tags', searchParams.tags);
      }

      if (searchParams.dateFrom) {
        query = query.gte('created_at', searchParams.dateFrom.toISOString());
      }

      if (searchParams.dateTo) {
        query = query.lte('created_at', searchParams.dateTo.toISOString());
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      return data as any[] || [];

    } catch (error) {
      console.error('Error searching policies:', error);
      throw error;
    }
  }

  async archivePolicy(
    policyId: string,
    reason: string,
    archivedBy: string
  ): Promise<void> {
    try {
      await supabase
        .from('policies')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          archived_by: archivedBy,
          archive_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      // Archive all versions
      await supabase
        .from('policy_versions')
        .update({
          status: 'archived'
        })
        .eq('policy_id', policyId);

    } catch (error) {
      console.error('Error archiving policy:', error);
      throw error;
    }
  }

  async generateComplianceReport(
    organizationId: string,
    framework?: string
  ): Promise<{
    total_policies: number;
    compliant_policies: number;
    gaps: Array<{
      requirement: string;
      missing_policies: string[];
      recommendations: string[];
    }>;
    coverage_percentage: number;
  }> {
    try {
      // This would analyze policies against framework requirements
      // For now, returning mock data
      return {
        total_policies: 45,
        compliant_policies: 38,
        gaps: [
          {
            requirement: 'Data Classification Policy',
            missing_policies: ['Data Classification', 'Data Labeling'],
            recommendations: ['Create comprehensive data classification policy', 'Implement data labeling procedures']
          }
        ],
        coverage_percentage: 84.4
      };

    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }
}

export default PolicyManagementService;