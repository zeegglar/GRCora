import { supabase } from '../lib/supabase';
import type { ControlTest, ControlGap, MaturityAssessment } from '../types/comprehensive';

interface TestProcedure {
  id: string;
  control_id: string;
  test_type: 'inquiry' | 'observation' | 'inspection' | 'reperformance' | 'analytical';
  procedure_description: string;
  expected_outcome: string;
  frequency: 'continuous' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  sample_size?: number;
  automation_level: 'manual' | 'semi_automated' | 'fully_automated';
}

interface TestResult {
  test_id: string;
  status: 'passed' | 'failed' | 'exception' | 'not_tested';
  evidence_collected: boolean;
  deficiency_noted: boolean;
  management_response?: string;
  remediation_timeline?: string;
  risk_rating: 'low' | 'medium' | 'high' | 'critical';
}

interface MaturityLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: 'Initial' | 'Managed' | 'Defined' | 'Quantitatively Managed' | 'Optimizing';
  description: string;
  characteristics: string[];
}

export class ControlTestingService {
  private static instance: ControlTestingService;

  private readonly MATURITY_LEVELS: MaturityLevel[] = [
    {
      level: 1,
      name: 'Initial',
      description: 'Ad hoc, reactive processes with minimal documentation',
      characteristics: [
        'Informal processes',
        'Limited documentation',
        'Reactive approach',
        'Inconsistent execution'
      ]
    },
    {
      level: 2,
      name: 'Managed',
      description: 'Basic processes established with some documentation',
      characteristics: [
        'Basic policies exist',
        'Some documentation',
        'Repeatable processes',
        'Management awareness'
      ]
    },
    {
      level: 3,
      name: 'Defined',
      description: 'Documented, standardized processes across organization',
      characteristics: [
        'Comprehensive policies',
        'Standardized procedures',
        'Training programs',
        'Regular monitoring'
      ]
    },
    {
      level: 4,
      name: 'Quantitatively Managed',
      description: 'Metrics-driven processes with quantitative analysis',
      characteristics: [
        'Performance metrics',
        'Quantitative analysis',
        'Statistical control',
        'Data-driven decisions'
      ]
    },
    {
      level: 5,
      name: 'Optimizing',
      description: 'Continuous improvement with innovation and optimization',
      characteristics: [
        'Continuous improvement',
        'Innovation focus',
        'Predictive analytics',
        'Optimization culture'
      ]
    }
  ];

  private readonly TESTING_FRAMEWORKS = {
    'ISO 27001': {
      test_categories: ['policy', 'implementation', 'monitoring', 'improvement'],
      evidence_types: ['documents', 'interviews', 'observations', 'system_logs'],
      frequency_map: {
        'A.5': 'annual',    // Organizational controls
        'A.6': 'quarterly', // People controls
        'A.7': 'monthly',   // Physical controls
        'A.8': 'continuous' // Technological controls
      }
    },
    'NIST CSF': {
      test_categories: ['identify', 'protect', 'detect', 'respond', 'recover'],
      evidence_types: ['technical_tests', 'process_reviews', 'documentation', 'metrics'],
      frequency_map: {
        'ID': 'annual',
        'PR': 'quarterly',
        'DE': 'monthly',
        'RS': 'quarterly',
        'RC': 'annual'
      }
    },
    'SOC 2': {
      test_categories: ['design', 'implementation', 'operating_effectiveness'],
      evidence_types: ['system_reports', 'configurations', 'access_logs', 'procedures'],
      frequency_map: {
        'CC': 'continuous', // Common Criteria
        'A1': 'monthly',    // Additional Criteria
        'P1': 'quarterly'   // Processing Integrity
      }
    }
  };

  public static getInstance(): ControlTestingService {
    if (!ControlTestingService.instance) {
      ControlTestingService.instance = new ControlTestingService();
    }
    return ControlTestingService.instance;
  }

  async generateTestPlan(
    projectId: string,
    framework: string,
    testingScope: 'full' | 'targeted' | 'sampling'
  ): Promise<TestProcedure[]> {
    try {
      // Get applicable controls for the project
      const { data: soaEntries, error } = await supabase
        .from('soa_entries')
        .select(`
          control_id,
          controls (
            id,
            name,
            description,
            family,
            framework
          )
        `)
        .eq('project_id', projectId)
        .eq('applicability', 'applicable')
        .eq('inclusion', 'included');

      if (error) throw error;

      const testProcedures: TestProcedure[] = [];
      const frameworkConfig = this.TESTING_FRAMEWORKS[framework];

      for (const entry of soaEntries || []) {
        const control = entry.controls;
        if (!control) continue;

        // Determine test frequency based on control family
        const frequency = this.determineTestFrequency(control, framework);

        // Generate test procedures based on control type
        const procedures = await this.generateControlTestProcedures(
          control,
          framework,
          frequency,
          testingScope
        );

        testProcedures.push(...procedures);
      }

      // Save test plan to database
      await this.saveTestPlan(projectId, testProcedures);

      return testProcedures;

    } catch (error) {
      console.error('Error generating test plan:', error);
      throw error;
    }
  }

  private determineTestFrequency(
    control: any,
    framework: string
  ): 'continuous' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' {
    const frameworkConfig = this.TESTING_FRAMEWORKS[framework];
    if (!frameworkConfig) return 'annual';

    // Extract control family prefix
    const familyPrefix = control.id.split('.')[0] || control.family?.substring(0, 2);

    return frameworkConfig.frequency_map[familyPrefix] || 'annual';
  }

  private async generateControlTestProcedures(
    control: any,
    framework: string,
    frequency: string,
    scope: string
  ): Promise<TestProcedure[]> {
    const procedures: TestProcedure[] = [];

    // Base test types for different control categories
    const testTypes = this.getTestTypesForControl(control, framework);

    for (const testType of testTypes) {
      const procedure: TestProcedure = {
        id: `${control.id}_${testType}_${Date.now()}`,
        control_id: control.id,
        test_type: testType,
        procedure_description: this.generateProcedureDescription(control, testType),
        expected_outcome: this.generateExpectedOutcome(control, testType),
        frequency: frequency as any,
        sample_size: this.calculateSampleSize(control, testType, scope),
        automation_level: this.determineAutomationLevel(control, testType)
      };

      procedures.push(procedure);
    }

    return procedures;
  }

  private getTestTypesForControl(
    control: any,
    framework: string
  ): ('inquiry' | 'observation' | 'inspection' | 'reperformance' | 'analytical')[] {
    // Determine appropriate test types based on control nature
    const controlFamily = control.family?.toLowerCase() || '';
    const testTypes = [];

    if (controlFamily.includes('policy') || controlFamily.includes('organizational')) {
      testTypes.push('inquiry', 'inspection');
    }

    if (controlFamily.includes('access') || controlFamily.includes('technical')) {
      testTypes.push('inspection', 'reperformance', 'analytical');
    }

    if (controlFamily.includes('physical') || controlFamily.includes('environmental')) {
      testTypes.push('observation', 'inspection');
    }

    if (controlFamily.includes('monitoring') || controlFamily.includes('logging')) {
      testTypes.push('analytical', 'reperformance');
    }

    // Default to inquiry and inspection if no specific patterns found
    if (testTypes.length === 0) {
      testTypes.push('inquiry', 'inspection');
    }

    return testTypes as any;
  }

  private generateProcedureDescription(control: any, testType: string): string {
    const baseDescriptions = {
      inquiry: `Interview key personnel responsible for ${control.name} to understand implementation and operation`,
      observation: `Observe the execution of ${control.name} processes and procedures in real-time`,
      inspection: `Review documentation, policies, and evidence supporting ${control.name} implementation`,
      reperformance: `Re-execute ${control.name} procedures to verify proper functioning and outcomes`,
      analytical: `Analyze data, logs, and metrics related to ${control.name} effectiveness and performance`
    };

    return baseDescriptions[testType] || `Test the implementation and effectiveness of ${control.name}`;
  }

  private generateExpectedOutcome(control: any, testType: string): string {
    const baseOutcomes = {
      inquiry: 'Personnel demonstrate clear understanding of control requirements and procedures',
      observation: 'Control procedures are executed consistently and effectively as designed',
      inspection: 'Complete and accurate documentation evidences proper control implementation',
      reperformance: 'Control functions operate as intended without exceptions or deficiencies',
      analytical: 'Data analysis confirms control effectiveness within acceptable parameters'
    };

    return baseOutcomes[testType] || 'Control operates effectively and meets stated objectives';
  }

  private calculateSampleSize(control: any, testType: string, scope: string): number {
    const baseSizes = {
      full: { inquiry: 5, observation: 10, inspection: 20, reperformance: 25, analytical: 100 },
      targeted: { inquiry: 3, observation: 5, inspection: 10, reperformance: 15, analytical: 50 },
      sampling: { inquiry: 2, observation: 3, inspection: 5, reperformance: 10, analytical: 25 }
    };

    return baseSizes[scope]?.[testType] || 5;
  }

  private determineAutomationLevel(
    control: any,
    testType: string
  ): 'manual' | 'semi_automated' | 'fully_automated' {
    const controlFamily = control.family?.toLowerCase() || '';

    if (testType === 'analytical' && controlFamily.includes('technical')) {
      return 'fully_automated';
    }

    if (testType === 'inspection' && controlFamily.includes('access')) {
      return 'semi_automated';
    }

    return 'manual';
  }

  private async saveTestPlan(projectId: string, procedures: TestProcedure[]): Promise<void> {
    const testPlanData = procedures.map(proc => ({
      id: proc.id,
      project_id: projectId,
      control_id: proc.control_id,
      test_type: proc.test_type,
      procedure_description: proc.procedure_description,
      expected_outcome: proc.expected_outcome,
      frequency: proc.frequency,
      sample_size: proc.sample_size,
      automation_level: proc.automation_level,
      status: 'planned',
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('control_tests')
      .upsert(testPlanData);

    if (error) throw error;
  }

  async executeControlTest(
    testId: string,
    executedBy: string,
    results: {
      status: 'passed' | 'failed' | 'exception' | 'not_tested';
      findings: string;
      evidence_urls: string[];
      deficiencies: string[];
      recommendations: string[];
    }
  ): Promise<void> {
    try {
      // Update test results
      const { error: testError } = await supabase
        .from('control_tests')
        .update({
          status: results.status,
          executed_by: executedBy,
          executed_at: new Date().toISOString(),
          findings: results.findings,
          evidence_urls: results.evidence_urls,
          recommendations: results.recommendations
        })
        .eq('id', testId);

      if (testError) throw testError;

      // Create deficiency records if any
      if (results.deficiencies.length > 0) {
        const deficiencyData = results.deficiencies.map(deficiency => ({
          test_id: testId,
          description: deficiency,
          severity: this.assessDeficiencySeverity(deficiency),
          status: 'open',
          identified_date: new Date().toISOString()
        }));

        const { error: deficiencyError } = await supabase
          .from('control_deficiencies')
          .insert(deficiencyData);

        if (deficiencyError) throw deficiencyError;
      }

    } catch (error) {
      console.error('Error executing control test:', error);
      throw error;
    }
  }

  private assessDeficiencySeverity(deficiency: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['critical', 'severe', 'complete failure', 'no controls'];
    const highKeywords = ['significant', 'major', 'ineffective', 'missing'];
    const mediumKeywords = ['moderate', 'partial', 'limited', 'inconsistent'];

    const deficiencyLower = deficiency.toLowerCase();

    if (criticalKeywords.some(keyword => deficiencyLower.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some(keyword => deficiencyLower.includes(keyword))) {
      return 'high';
    }
    if (mediumKeywords.some(keyword => deficiencyLower.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  async assessControlMaturity(
    projectId: string,
    framework: string
  ): Promise<MaturityAssessment> {
    try {
      // Get control test results
      const { data: tests, error } = await supabase
        .from('control_tests')
        .select(`
          *,
          controls (
            id,
            name,
            family,
            framework
          )
        `)
        .eq('project_id', projectId)
        .in('status', ['passed', 'failed', 'exception']);

      if (error) throw error;

      // Calculate maturity by control family
      const familyMaturity = {};
      const controlFamilies = [...new Set(tests?.map(t => t.controls.family) || [])];

      for (const family of controlFamilies) {
        const familyTests = tests?.filter(t => t.controls.family === family) || [];
        familyMaturity[family] = this.calculateFamilyMaturity(familyTests);
      }

      // Calculate overall maturity
      const overallMaturity = this.calculateOverallMaturity(familyMaturity);

      // Identify gaps and recommendations
      const gaps = await this.identifyControlGaps(tests || [], framework);
      const recommendations = this.generateMaturityRecommendations(familyMaturity, gaps);

      const assessment: MaturityAssessment = {
        project_id: projectId,
        framework,
        overall_maturity_level: overallMaturity.level,
        overall_maturity_score: overallMaturity.score,
        family_maturity: familyMaturity,
        control_gaps: gaps,
        recommendations,
        assessment_date: new Date(),
        next_assessment_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      };

      // Save assessment
      await this.saveMaturityAssessment(assessment);

      return assessment;

    } catch (error) {
      console.error('Error assessing control maturity:', error);
      throw error;
    }
  }

  private calculateFamilyMaturity(tests: any[]): { level: number; score: number; indicators: string[] } {
    if (tests.length === 0) {
      return { level: 1, score: 20, indicators: ['No testing completed'] };
    }

    const passedTests = tests.filter(t => t.status === 'passed').length;
    const passRate = passedTests / tests.length;

    // Maturity scoring based on test pass rate and evidence quality
    let maturityLevel = 1;
    let maturityScore = 20;

    if (passRate >= 0.95) {
      maturityLevel = 5;
      maturityScore = 95;
    } else if (passRate >= 0.85) {
      maturityLevel = 4;
      maturityScore = 85;
    } else if (passRate >= 0.70) {
      maturityLevel = 3;
      maturityScore = 75;
    } else if (passRate >= 0.50) {
      maturityLevel = 2;
      maturityScore = 60;
    }

    const indicators = this.getMaturityIndicators(maturityLevel, tests);

    return { level: maturityLevel, score: maturityScore, indicators };
  }

  private getMaturityIndicators(level: number, tests: any[]): string[] {
    const maturityLevel = this.MATURITY_LEVELS.find(ml => ml.level === level);
    return maturityLevel?.characteristics || [];
  }

  private calculateOverallMaturity(familyMaturity: any): { level: number; score: number } {
    const families = Object.values(familyMaturity) as any[];
    if (families.length === 0) {
      return { level: 1, score: 20 };
    }

    const avgScore = families.reduce((sum, family) => sum + family.score, 0) / families.length;
    const level = Math.round(avgScore / 20); // Convert score to level (1-5)

    return { level: Math.max(1, Math.min(5, level)), score: Math.round(avgScore) };
  }

  private async identifyControlGaps(tests: any[], framework: string): Promise<ControlGap[]> {
    const gaps: ControlGap[] = [];

    // Identify failed tests as gaps
    const failedTests = tests.filter(t => t.status === 'failed' || t.status === 'exception');

    for (const test of failedTests) {
      gaps.push({
        control_id: test.control_id,
        gap_type: 'implementation',
        description: test.findings || 'Control test failed',
        severity: this.assessGapSeverity(test),
        remediation_effort: this.estimateRemediationEffort(test),
        priority: this.calculateGapPriority(test)
      });
    }

    // Identify missing controls (not tested)
    const { data: allControls } = await supabase
      .from('controls')
      .select('id, name')
      .eq('framework', framework);

    const testedControlIds = new Set(tests.map(t => t.control_id));
    const missingControls = allControls?.filter(c => !testedControlIds.has(c.id)) || [];

    for (const control of missingControls) {
      gaps.push({
        control_id: control.id,
        gap_type: 'coverage',
        description: `Control not included in testing scope`,
        severity: 'medium',
        remediation_effort: 'medium',
        priority: 'medium'
      });
    }

    return gaps;
  }

  private assessGapSeverity(test: any): 'low' | 'medium' | 'high' | 'critical' {
    const findings = test.findings?.toLowerCase() || '';

    if (findings.includes('critical') || findings.includes('complete failure')) return 'critical';
    if (findings.includes('significant') || findings.includes('major')) return 'high';
    if (findings.includes('moderate') || findings.includes('partial')) return 'medium';
    return 'low';
  }

  private estimateRemediationEffort(test: any): 'low' | 'medium' | 'high' {
    // Simple heuristic based on test type and findings
    if (test.test_type === 'reperformance' || test.test_type === 'analytical') return 'high';
    if (test.test_type === 'observation' || test.test_type === 'inspection') return 'medium';
    return 'low';
  }

  private calculateGapPriority(test: any): 'low' | 'medium' | 'high' | 'critical' {
    // Priority based on control family and severity
    const controlFamily = test.controls?.family?.toLowerCase() || '';

    if (controlFamily.includes('access') || controlFamily.includes('security')) return 'high';
    if (controlFamily.includes('monitoring') || controlFamily.includes('incident')) return 'medium';
    return 'low';
  }

  private generateMaturityRecommendations(
    familyMaturity: any,
    gaps: ControlGap[]
  ): string[] {
    const recommendations = [];

    // Family-specific recommendations
    Object.entries(familyMaturity).forEach(([family, maturity]: [string, any]) => {
      if (maturity.level < 3) {
        recommendations.push(`Enhance ${family} controls through standardized procedures and training`);
      }
      if (maturity.level < 4) {
        recommendations.push(`Implement metrics and monitoring for ${family} control effectiveness`);
      }
    });

    // Gap-specific recommendations
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
    const highGaps = gaps.filter(g => g.severity === 'high').length;

    if (criticalGaps > 0) {
      recommendations.push(`Address ${criticalGaps} critical control gaps immediately`);
    }
    if (highGaps > 5) {
      recommendations.push(`Develop comprehensive remediation plan for ${highGaps} high-severity gaps`);
    }

    // General maturity recommendations
    recommendations.push('Establish regular control testing schedule and automation where possible');
    recommendations.push('Implement continuous monitoring and real-time control effectiveness metrics');

    return recommendations;
  }

  private async saveMaturityAssessment(assessment: MaturityAssessment): Promise<void> {
    const { error } = await supabase
      .from('maturity_assessments')
      .upsert({
        project_id: assessment.project_id,
        framework: assessment.framework,
        overall_maturity_level: assessment.overall_maturity_level,
        overall_maturity_score: assessment.overall_maturity_score,
        family_maturity: assessment.family_maturity,
        control_gaps: assessment.control_gaps,
        recommendations: assessment.recommendations,
        assessment_date: assessment.assessment_date.toISOString(),
        next_assessment_due: assessment.next_assessment_due.toISOString()
      });

    if (error) throw error;
  }

  async generateGapAnalysisReport(projectId: string): Promise<{
    summary: {
      total_gaps: number;
      by_severity: { [key: string]: number };
      by_family: { [key: string]: number };
      remediation_timeline: string;
    };
    critical_gaps: ControlGap[];
    recommendations: string[];
  }> {
    try {
      const { data: assessment } = await supabase
        .from('maturity_assessments')
        .select('*')
        .eq('project_id', projectId)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();

      if (!assessment) {
        throw new Error('No maturity assessment found for project');
      }

      const gaps = assessment.control_gaps || [];

      const summary = {
        total_gaps: gaps.length,
        by_severity: {
          critical: gaps.filter(g => g.severity === 'critical').length,
          high: gaps.filter(g => g.severity === 'high').length,
          medium: gaps.filter(g => g.severity === 'medium').length,
          low: gaps.filter(g => g.severity === 'low').length
        },
        by_family: {},
        remediation_timeline: this.calculateRemediationTimeline(gaps)
      };

      // Group by control family
      const { data: controls } = await supabase
        .from('controls')
        .select('id, family')
        .in('id', gaps.map(g => g.control_id));

      const controlFamilyMap = new Map(controls?.map(c => [c.id, c.family]) || []);

      gaps.forEach(gap => {
        const family = controlFamilyMap.get(gap.control_id) || 'Unknown';
        summary.by_family[family] = (summary.by_family[family] || 0) + 1;
      });

      const criticalGaps = gaps.filter(g => g.severity === 'critical' || g.severity === 'high');

      return {
        summary,
        critical_gaps: criticalGaps,
        recommendations: assessment.recommendations || []
      };

    } catch (error) {
      console.error('Error generating gap analysis report:', error);
      throw error;
    }
  }

  private calculateRemediationTimeline(gaps: ControlGap[]): string {
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
    const highGaps = gaps.filter(g => g.severity === 'high').length;
    const mediumGaps = gaps.filter(g => g.severity === 'medium').length;

    let totalWeeks = 0;
    totalWeeks += criticalGaps * 2; // 2 weeks per critical gap
    totalWeeks += highGaps * 4;     // 4 weeks per high gap
    totalWeeks += mediumGaps * 2;   // 2 weeks per medium gap

    return `${Math.ceil(totalWeeks / 4)} months`;
  }
}

export default ControlTestingService;