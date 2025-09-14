import { supabase } from './supabaseClient';
import type { Control, Project, AssessmentItem, Risk } from '../types';


// A helper function to call our secure Supabase Edge Function
async function callAIAssist(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-assist', {
    body: { prompt },
  });

  if (error) {
    console.error("Error invoking Supabase function:", error);
    throw new Error("Failed to get response from AI model via Edge Function.");
  }
  
  // FIX: The invoked function returns an object with a 'text' property.
  return data.text;
}


export const explainControl = async (control: Control, project: Project): Promise<string> => {
  const prompt = `
    As a GRC (Governance, Risk, and Compliance) expert, explain the following control in the context of the project "${project.name}" which uses the frameworks: ${project.frameworks.join(', ')}.

    Control ID: ${control.id}
    Control Name: ${control.name}
    Description: ${control.description}
    Family: ${control.family}

    Provide a clear, concise explanation suitable for a business stakeholder, not just a technical auditor. Focus on the "why" behind the control.
  `;
  return callAIAssist(prompt);
};

export const suggestEvidence = async (control: Control, project: Project): Promise<string> => {
  const prompt = `
    For the project "${project.name}" which is being assessed against ${project.frameworks.join(', ')}, suggest 2-3 specific examples of evidence that would be suitable to demonstrate compliance for the following control:

    Control ID: ${control.id}
    Control Name: ${control.name}
    Description: ${control.description}

    Format the output as a bulleted list. For each item, briefly explain what it is and why it's relevant.
  `;
  return callAIAssist(prompt);
};

export const draftRemediationPlan = async (control: Control, project: Project, issue: string): Promise<string> => {
  const prompt = `
    A compliance issue has been identified for the project "${project.name}" related to the following control:

    Control ID: ${control.id}
    Control Name: ${control.name}
    Control Description: ${control.description}

    Issue Description: ${issue}

    Draft a practical, step-by-step remediation plan to address this issue. The plan should be clear, actionable, and include suggested owners or roles (e.g., "IT Manager", "System Administrator"). Structure it with numbered steps.
  `;
  return callAIAssist(prompt);
};

export const draftPolicySection = async (control: Control, project: Project): Promise<string> => {
  const prompt = `
    For the project "${project.name}", draft a policy section that addresses the requirements of the following control:

    Control ID: ${control.id}
    Control Name: ${control.name}
    Description: ${control.description}

    The policy should be written in clear, formal language suitable for an official company policy document. It should state the company's commitment and outline the key requirements or procedures. Start with a suitable heading.
  `;
  return callAIAssist(prompt);
};

export const generateExecutiveSummary = async (project: Project, assessmentItems: AssessmentItem[], risks: Risk[], controls: Map<string, Control>, userInstructions: string): Promise<string> => {
    const summary = assessmentItems.map(item => {
        const control = controls.get(item.controlId);
        return `- ${control?.id} (${control?.name}): ${item.status}`;
    }).join('\n');

    const riskSummary = risks.map(risk => {
        const control = controls.get(risk.controlId);
        return `- ${risk.title} (Level: ${risk.level}, Related to: ${control?.id})`;
    }).join('\n');

    const prompt = `
        As a GRC consultant, generate an Executive Summary for a compliance report for the project "${project.name}".

        **Project Context:**
        - Frameworks: ${project.frameworks.join(', ')}
        - Assessment Status Summary:
        ${summary}
        - Open Risks:
        ${riskSummary || 'No open risks documented.'}

        **User Instructions:**
        ${userInstructions || 'No special instructions.'}

        **Task:**
        Generate a report in Markdown format with the following sections:
        1.  **## Executive Summary:** A high-level overview of the project's purpose and key findings.
        2.  **## Overall Compliance Posture:** A brief analysis of the assessment status summary.
        3.  **## Key Risks Identified:** A summary of the most significant risks.
        4.  **## Recommended Roadmap:** A high-level, best-practice roadmap with 3-5 actionable steps for improvement based on the findings.

        The tone should be professional and clear, suitable for a business executive.
    `;
    return callAIAssist(prompt);
}

export const analyzePolicyAgainstFramework = async (policyText: string, framework: string): Promise<string> => {
    const prompt = `
        Act as an expert GRC (Governance, Risk, and Compliance) analyst.
        You are tasked with performing a gap analysis on a provided corporate policy against a specific compliance framework.

        **Framework for Analysis:**
        ${framework}

        **Policy Text to Analyze:**
        """
        ${policyText}
        """

        **Task:**
        Generate a detailed gap analysis report in Markdown format. The report must include the following sections:
        1.  **## Overall Summary:** A brief, high-level assessment of the policy's alignment with the framework.
        2.  **## Strengths:** Identify specific clauses or sections of the policy that strongly align with the key controls or principles of the framework. Use a bulleted list.
        3.  **## Identified Gaps:** Pinpoint specific areas where the policy is weak, silent, or non-compliant with the framework's requirements. Be specific and reference control families if possible (e.g., "Incident Response", "Access Control"). Use a bulleted list.
        4.  **## Actionable Recommendations:** For each identified gap, provide a clear, actionable recommendation for how to remediate it. Use a numbered list.

        The tone must be professional, objective, and constructive.
    `;
    return callAIAssist(prompt);
};
