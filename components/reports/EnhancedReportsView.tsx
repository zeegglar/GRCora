import React, { useState, useEffect } from 'react';
import type { Project, AssessmentItem, Risk, Control, Vendor, User, Organization } from '../../types';
import RealReportGenerator from './RealReportGenerator';
import { supabaseApi } from '../../services/supabaseApi';

interface EnhancedReportsViewProps {
  project: Project;
  user: User;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  controls: Map<string, Control>;
  vendors: Vendor[];
}

const EnhancedReportsView: React.FC<EnhancedReportsViewProps> = ({
  project,
  user,
  assessmentItems,
  risks,
  controls,
  vendors
}) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        if (supabaseApi.isConfigured()) {
          const orgs = await supabaseApi.getOrganizations();
          const org = orgs.find(o => o.id === project.organizationId);
          setOrganization(org || { id: project.organizationId, name: 'Unknown Organization' });
        } else {
          // Fallback for demo mode
          setOrganization({ id: project.organizationId, name: 'Demo Organization' });
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        setOrganization({ id: project.organizationId, name: 'Unknown Organization' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [project.organizationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center text-slate-400 h-64 flex items-center justify-center">
        Failed to load organization data
      </div>
    );
  }

  // Convert controls Map to array
  const controlsArray = Array.from(controls.values());

  return (
    <RealReportGenerator
      project={project}
      organization={organization}
      assessmentItems={assessmentItems}
      risks={risks}
      controls={controlsArray}
    />
  );
};

export default EnhancedReportsView;