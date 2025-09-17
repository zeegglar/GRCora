# Statement of Applicability - Information Security Policy

**Note**: This document provides a high-level mapping of policy controls to frameworks. A complete Statement of Applicability (SoA) is typically developed as part of a formal ISO 27001 ISMS implementation and requires detailed risk assessment and business context analysis.

## Control Applicability Matrix

### Access Control Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Identity Management | PR.AC-01 | A.9.2.1 | ✅ Applicable | Planned | All users require unique identification |
| Access Provisioning | PR.AC-01 | A.9.2.2 | ✅ Applicable | Planned | Role-based access needed for all systems |
| Access Review | PR.AC-03 | A.9.2.5 | ✅ Applicable | Planned | Quarterly reviews required for compliance |
| Privileged Access | PR.AC-04 | A.9.2.3 | ✅ Applicable | Planned | Administrative accounts require additional controls |
| Remote Access | PR.AC-04 | A.9.1.2 | ✅ Applicable | Planned | Remote work requires secure access mechanisms |

### Cryptography Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Encryption at Rest | PR.DS-01 | A.8.24 | ✅ Applicable | Planned | Sensitive data requires protection |
| Encryption in Transit | PR.DS-02 | A.8.24 | ✅ Applicable | Planned | Network communications need protection |
| Key Management | PR.DS-06 | A.8.24 | ✅ Applicable | Planned | Cryptographic keys require lifecycle management |
| Digital Signatures | PR.DS-06 | A.8.24 | ⚠️ Conditional | Not Planned | May be required for specific business processes |

### Operations Security Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Change Management | PR.IP-03 | A.8.32 | ✅ Applicable | Planned | All system changes require formal process |
| Capacity Management | PR.DS-04 | A.8.6 | ✅ Applicable | Planned | System performance monitoring needed |
| System Monitoring | DE.CM-01 | A.8.15 | ✅ Applicable | Planned | Security events require detection capability |
| Vulnerability Management | DE.CM-08 | A.8.8 | ✅ Applicable | Planned | Regular vulnerability assessments required |
| Backup Management | PR.IP-04 | A.8.13 | ✅ Applicable | Planned | Data protection and business continuity |

### Communications Security Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Network Controls | PR.PT-04 | A.8.20 | ✅ Applicable | Planned | Network segmentation and protection |
| Network Segregation | PR.AC-05 | A.8.22 | ✅ Applicable | Planned | Separation of network environments |
| Information Transfer | PR.DS-02 | A.8.21 | ✅ Applicable | Planned | Secure data transmission policies |

### System Development Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Secure Development | PR.IP-02 | A.8.25 | ✅ Applicable | Planned | Custom development requires security integration |
| Test Data Management | PR.DS-03 | A.8.33 | ✅ Applicable | Planned | Test environments need data protection |
| System Acceptance | PR.IP-02 | A.8.29 | ✅ Applicable | Planned | New systems require security validation |

### Supplier Relationships Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Supplier Assessment | ID.SC-01 | A.5.19 | ✅ Applicable | Planned | Third-party risk management required |
| Supplier Agreements | ID.SC-02 | A.5.20 | ✅ Applicable | Planned | Contractual security requirements |
| Supply Chain Monitoring | ID.SC-04 | A.5.21 | ⚠️ Conditional | Not Planned | Depends on criticality of supplier services |

### Incident Management Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Incident Response | RS.RP-01 | A.5.24 | ✅ Applicable | Planned | Security incidents require formal response |
| Evidence Collection | RS.AN-02 | A.5.25 | ✅ Applicable | Planned | Legal and forensic requirements |
| Incident Communication | RS.CO-02 | A.5.26 | ✅ Applicable | Planned | Stakeholder notification procedures |

### Business Continuity Domain

| Control | NIST CSF 2.0 | ISO 27001:2022 | Applicability | Implementation Status | Justification |
|---------|-------------|----------------|---------------|----------------------|---------------|
| Business Continuity | RC.RP-01 | A.5.29 | ✅ Applicable | Planned | Critical business processes require protection |
| Disaster Recovery | RC.RP-01 | A.5.30 | ✅ Applicable | Planned | IT systems need recovery capabilities |
| Business Impact Analysis | ID.BE-03 | A.5.29 | ✅ Applicable | Planned | Understanding of critical dependencies |

## Implementation Priorities

### Priority 1 (High) - Immediate Implementation Required
- Access Control and Authentication
- Encryption for Sensitive Data
- Basic Monitoring and Logging
- Incident Response Capability
- Backup and Recovery

### Priority 2 (Medium) - Implementation within 6 months
- Vulnerability Management
- Change Management
- Supplier Risk Management
- Business Continuity Planning
- Advanced Monitoring

### Priority 3 (Low) - Implementation within 12 months
- Advanced Cryptographic Controls
- Supply Chain Security
- Business Impact Analysis
- Comprehensive Testing Programs

## Risk-Based Exceptions

### Temporary Exceptions (Max 90 days)
- Controls requiring significant infrastructure investment
- Controls dependent on vendor capabilities
- Controls requiring regulatory clarification

### Permanent Exceptions
- Controls not applicable to business model
- Controls superseded by alternative measures
- Controls with disproportionate cost vs. risk

## Compliance Requirements

### Mandatory Controls (No Exceptions)
- Data Protection and Privacy Controls
- Financial Controls (if applicable)
- Industry-Specific Regulations
- Legal and Contractual Obligations

### Best Practice Controls (Risk-Based)
- Advanced Security Controls
- Process Optimization
- Continuous Improvement
- Innovation and Research

---

**Document Control**
- **Version**: 1.0
- **Last Review**: January 2025
- **Next Review**: July 2025
- **Owner**: Chief Information Security Officer
- **Approver**: Risk Committee

**Note**: This SoA should be reviewed and updated following formal risk assessment, business impact analysis, and detailed control implementation planning as part of a comprehensive ISMS development program.