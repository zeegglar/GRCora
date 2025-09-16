#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

interface ISOControl {
  id: string;
  theme: string;
  ref: string;
  short_title: string;
  paraphrased_requirement: string;
  tasks: string[];
  csf_function: string[];
  suggested_evidence: string[];
  tags: string[];
}

interface ISOData {
  framework: string;
  generated_on: string;
  license_note: string;
  controls: ISOControl[];
}

function convertISOToJSONL() {
  const inputFile = path.join(process.cwd(), 'public', 'data', 'iso-27001-raw.json');
  const outputFile = path.join(process.cwd(), 'public', 'data', 'iso-27001.jsonl');

  try {
    console.log('📄 Converting ISO 27001 JSON to JSONL format...');

    const rawData = readFileSync(inputFile, 'utf-8');
    const isoData: ISOData = JSON.parse(rawData);

    const jsonlLines: string[] = [];

    for (const control of isoData.controls) {
      const normalizedControl = {
        framework: 'ISO 27001:2022',
        framework_version: '2022',
        source_file: 'iso27001_annexA_paraphrased.json.json',
        control_id: control.ref,
        family: control.theme,
        title: control.short_title,
        description: control.paraphrased_requirement,
        guidance: control.tasks.join('; '),
        evidence_types: control.suggested_evidence,
        csf_mapping: control.csf_function,
        tags: control.tags,
        full_id: control.id
      };

      jsonlLines.push(JSON.stringify(normalizedControl));
    }

    writeFileSync(outputFile, jsonlLines.join('\n'));
    console.log(`✅ Converted ${jsonlLines.length} ISO 27001 controls to JSONL`);
    console.log(`📝 Output file: ${outputFile}`);

  } catch (error) {
    console.error('❌ Error converting ISO file:', error);
    process.exit(1);
  }
}

// Run the conversion
convertISOToJSONL();