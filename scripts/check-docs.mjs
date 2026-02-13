#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findMdFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findMdFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function checkIssues(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Check for remaining Mintlify components
  const mintlifyTags = [
    '<Card', '<CardGroup', '</Card', '</CardGroup',
    '<Accordion', '</Accordion', '<AccordionGroup', '</AccordionGroup',
    '<Tab', '<Tabs', '</Tab', '</Tabs',
    '<Frame', '</Frame',
    '<Step', '</Step', '<Steps', '</Steps',
    '<Check', '</Check',
    '<Icon ', '<ParamField', '</ParamField',
    '<ResponseField', '</ResponseField',
    '<CodeGroup', '</CodeGroup',  // Just to double check
  ];

  lines.forEach((line, index) => {
    mintlifyTags.forEach(tag => {
      if (line.includes(tag)) {
        issues.push({
          line: index + 1,
          type: 'Mintlify Component',
          content: line.trim(),
          tag: tag
        });
      }
    });

    // Check for template literal issues
    if (line.includes('{`{{') || line.includes('}}`}')) {
      issues.push({
        line: index + 1,
        type: 'Template Literal Issue',
        content: line.trim()
      });
    }

    // Check for broken links
    if (line.match(/]\(\s*\)/)) {
      issues.push({
        line: index + 1,
        type: 'Empty Link',
        content: line.trim()
      });
    }
  });

  return issues;
}

const docsDir = path.join(__dirname, '..', 'docs');
const mdFiles = findMdFiles(docsDir);

console.log(`Checking ${mdFiles.length} files...\n`);

let totalIssues = 0;
const fileIssues = {};

mdFiles.forEach((filePath) => {
  const relativePath = filePath.replace(docsDir, 'docs');
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = checkIssues(content, filePath);

  if (issues.length > 0) {
    totalIssues += issues.length;
    fileIssues[relativePath] = issues;
  }
});

if (totalIssues === 0) {
  console.log('✓ No issues found!');
} else {
  console.log(`Found ${totalIssues} issues in ${Object.keys(fileIssues).length} files:\n`);

  Object.entries(fileIssues).forEach(([file, issues]) => {
    console.log(`\n📄 ${file}`);
    console.log(`   ${issues.length} issue(s):`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: [${issue.type}] ${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}`);
    });
  });
}

// Save detailed report
const reportPath = path.join(__dirname, 'docs-issues-report.json');
fs.writeFileSync(reportPath, JSON.stringify(fileIssues, null, 2));
console.log(`\n\nDetailed report saved to: ${reportPath}`);
