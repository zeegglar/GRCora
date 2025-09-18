// Control Translation Service - Converts technical controls to plain English

interface ControlTranslation {
  controlId: string;
  framework: string;
  technicalTitle: string;
  plainEnglishTitle: string;
  technicalDescription: string;
  plainEnglishDescription: string;
  whyItMatters: string;
  implementationSteps: string[];
  estimatedCost: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  exampleScenarios: string[];
}

export const controlTranslations: { [key: string]: ControlTranslation } = {
  'ac-1': {
    controlId: 'ac-1',
    framework: 'NIST SP 800-53',
    technicalTitle: 'Policy and Procedures',
    plainEnglishTitle: 'Create Access Control Rules',
    technicalDescription: 'Develop, document, and disseminate access control policy and procedures',
    plainEnglishDescription: 'Write clear rules about who can access your systems and how they should do it safely.',
    whyItMatters: 'Without clear access rules, anyone might access sensitive data like donor information or financial records, putting your organization at risk.',
    implementationSteps: [
      'Write a simple access control policy (1-2 pages)',
      'Define who needs access to what systems',
      'Create procedures for adding/removing user access',
      'Train all staff on the new rules',
      'Review and update rules annually'
    ],
    estimatedCost: '$2,000 - $5,000 (consultant help)',
    estimatedTime: '2-4 weeks',
    difficulty: 'Medium',
    priority: 'High',
    exampleScenarios: [
      'New employee needs access to donor database',
      'Volunteer leaves and access must be removed',
      'Executive needs emergency access while traveling'
    ]
  },

  'ac-2': {
    controlId: 'ac-2',
    framework: 'NIST SP 800-53',
    technicalTitle: 'Account Management',
    plainEnglishTitle: 'Manage User Accounts',
    technicalDescription: 'Define and document account types, assign account managers, require conditions for group membership',
    plainEnglishDescription: 'Give each person their own username and password, and control what they can access based on their job.',
    whyItMatters: 'Shared passwords mean you can\'t tell who did what. Individual accounts let you track access and remove it when people leave.',
    implementationSteps: [
      'Create individual accounts for each staff member',
      'Remove any shared passwords or generic accounts',
      'Set up different access levels (admin, staff, volunteer)',
      'Document who has access to what',
      'Review access permissions every 3 months'
    ],
    estimatedCost: '$500 - $2,000 (mostly time)',
    estimatedTime: '1-2 weeks',
    difficulty: 'Easy',
    priority: 'Critical',
    exampleScenarios: [
      'Staff member leaves - remove their access immediately',
      'New volunteer needs limited access to program data',
      'Finance staff need access to accounting system only'
    ]
  },

  'ac-3': {
    controlId: 'ac-3',
    framework: 'NIST SP 800-53',
    technicalTitle: 'Access Enforcement',
    plainEnglishTitle: 'Control Who Sees What',
    technicalDescription: 'Enforce approved authorizations for logical access to information and system resources',
    plainEnglishDescription: 'Make sure people can only see and change the information they need for their job.',
    whyItMatters: 'If everyone can see everything, sensitive donor data or financial information could be exposed accidentally or maliciously.',
    implementationSteps: [
      'List what each role needs to access (fundraising, programs, admin)',
      'Set up system permissions to match job requirements',
      'Block access to sensitive areas (payroll, major donor info)',
      'Test that restrictions actually work',
      'Train staff on what they can and cannot access'
    ],
    estimatedCost: '$1,000 - $3,000',
    estimatedTime: '1-3 weeks',
    difficulty: 'Medium',
    priority: 'Critical',
    exampleScenarios: [
      'Program coordinator should not see donor financial information',
      'Volunteer can see participant data but not edit it',
      'Only executive director can access salary information'
    ]
  },

  'ia-2': {
    controlId: 'ia-2',
    framework: 'NIST SP 800-53',
    technicalTitle: 'Identification and Authentication (Organizational Users)',
    plainEnglishTitle: 'Secure Login Requirements',
    plainEnglishDescription: 'Require strong passwords and extra security steps (like phone codes) for important systems.',
    technicalDescription: 'Uniquely identify and authenticate organizational users and associate that unique identification with processes acting on behalf of those users',
    whyItMatters: 'Weak passwords are the #1 way hackers break into nonprofit systems. Adding extra security steps blocks 99% of unauthorized access attempts.',
    implementationSteps: [
      'Require strong passwords (12+ characters, mix of letters/numbers/symbols)',
      'Set up two-factor authentication on all important systems',
      'Use a password manager for staff',
      'Change default passwords on all devices and software',
      'Train staff on password security'
    ],
    estimatedCost: '$1,500 - $4,000',
    estimatedTime: '2-4 weeks',
    difficulty: 'Medium',
    priority: 'Critical',
    exampleScenarios: [
      'Staff member tries to log in with weak password "password123"',
      'Someone tries to guess the director\'s email password',
      'Staff member\'s password is stolen in a data breach elsewhere'
    ]
  },

  'sc-8': {
    controlId: 'sc-8',
    framework: 'NIST SP 800-53',
    technicalTitle: 'Transmission Confidentiality and Integrity',
    plainEnglishTitle: 'Secure Communication',
    plainEnglishDescription: 'Protect sensitive information when sending it via email, file sharing, or other communication methods.',
    technicalDescription: 'Protect the confidentiality and integrity of transmitted information',
    whyItMatters: 'Sending donor lists or financial data through regular email is like mailing cash in a clear envelope - anyone can see it.',
    implementationSteps: [
      'Use encrypted email for sensitive information',
      'Set up secure file sharing (like encrypted cloud storage)',
      'Train staff never to email donor lists or financial data',
      'Use secure messaging apps for sensitive discussions',
      'Verify recipient before sending sensitive information'
    ],
    estimatedCost: '$500 - $2,000 annually',
    estimatedTime: '1-2 weeks',
    difficulty: 'Easy',
    priority: 'High',
    exampleScenarios: [
      'Sending year-end donor report to board members',
      'Sharing financial statements with auditors',
      'Collaborating on grant proposals with partners'
    ]
  },

  'cp-9': {
    controlId: 'cp-9',
    framework: 'NIST SP 800-53',
    technicalTitle: 'System Backup',
    plainEnglishTitle: 'Back Up Your Data',
    plainEnglishDescription: 'Automatically save copies of all important information so you can recover if computers crash or hackers attack.',
    technicalDescription: 'Conduct backups of user-level information contained in the system per organization-defined frequency',
    whyItMatters: 'If hackers encrypt your files or your server crashes, backups let you restore everything and keep your nonprofit running.',
    implementationSteps: [
      'Set up automatic daily backups of all important data',
      'Store backup copies in a secure cloud service',
      'Test restoring data from backups monthly',
      'Keep backups for at least 1 year',
      'Encrypt backup files to protect sensitive data'
    ],
    estimatedCost: '$100 - $500 monthly',
    estimatedTime: '1 week',
    difficulty: 'Easy',
    priority: 'Critical',
    exampleScenarios: [
      'Ransomware encrypts all your computers',
      'Server hard drive fails during a storm',
      'Accidentally delete important donor database'
    ]
  }
};

export class ControlTranslationService {
  static getTranslation(controlId: string): ControlTranslation | null {
    return controlTranslations[controlId.toLowerCase()] || null;
  }

  static translateControl(technicalControl: any): any {
    const translation = this.getTranslation(technicalControl.control_id);

    if (!translation) {
      // Return original if no translation available
      return {
        ...technicalControl,
        plain_english_title: technicalControl.title,
        plain_english_description: 'Translation not yet available for this control.',
        why_it_matters: 'This is a technical security requirement that helps protect your organization.',
        implementation_steps: ['Consult with IT security professional'],
        estimated_cost: 'Cost varies',
        estimated_time: 'Timeline varies',
        difficulty: 'Medium',
        priority: 'Medium'
      };
    }

    return {
      ...technicalControl,
      plain_english_title: translation.plainEnglishTitle,
      plain_english_description: translation.plainEnglishDescription,
      why_it_matters: translation.whyItMatters,
      implementation_steps: translation.implementationSteps,
      estimated_cost: translation.estimatedCost,
      estimated_time: translation.estimatedTime,
      difficulty: translation.difficulty,
      priority: translation.priority,
      example_scenarios: translation.exampleScenarios
    };
  }

  static searchTranslatedControls(query: string): ControlTranslation[] {
    const searchTerm = query.toLowerCase();
    return Object.values(controlTranslations).filter(control =>
      control.plainEnglishTitle.toLowerCase().includes(searchTerm) ||
      control.plainEnglishDescription.toLowerCase().includes(searchTerm) ||
      control.whyItMatters.toLowerCase().includes(searchTerm)
    );
  }

  static getControlsByPriority(priority: 'Critical' | 'High' | 'Medium' | 'Low'): ControlTranslation[] {
    return Object.values(controlTranslations).filter(control => control.priority === priority);
  }

  static getControlsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): ControlTranslation[] {
    return Object.values(controlTranslations).filter(control => control.difficulty === difficulty);
  }

  static getCriticalControls(): ControlTranslation[] {
    return this.getControlsByPriority('Critical');
  }

  static getQuickWins(): ControlTranslation[] {
    return Object.values(controlTranslations).filter(control =>
      control.difficulty === 'Easy' && (control.priority === 'Critical' || control.priority === 'High')
    );
  }
}