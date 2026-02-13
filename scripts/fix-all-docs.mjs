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

function fixTabs(content) {
  let fixed = content;

  // Convert <Tabs> and </Tabs> to ::: details (collapsible sections)
  // or just remove them if they're wrapping code examples
  fixed = fixed.replace(/<Tabs>\s*\n/g, '');
  fixed = fixed.replace(/\n\s*<\/Tabs>/g, '');

  // Convert <Tab title="..."> sections
  // Strategy: Convert each Tab to a heading with the content below
  const tabPattern = /<Tab title=["']([^"']+)["']>\s*\n([\s\S]*?)\n\s*<\/Tab>/g;

  fixed = fixed.replace(tabPattern, (match, title, content) => {
    // Clean up the content
    const cleanContent = content.trim();
    return `#### ${title}\n\n${cleanContent}`;
  });

  return fixed;
}

function fixParamFields(content) {
  let fixed = content;

  // Convert <ParamField> to markdown
  const paramPattern = /<ParamField\s+path=["']([^"']+)["']\s+type=["']([^"']+)["'](\s+required)?>\s*\n([\s\S]*?)\n\s*<\/ParamField>/g;

  fixed = fixed.replace(paramPattern, (match, path, type, required, description) => {
    const isRequired = required ? ' (required)' : '';
    const cleanDesc = description.trim();
    return `**\`${path}\`** \`${type}\`${isRequired}\n\n${cleanDesc}`;
  });

  return fixed;
}

function fixTemplateBackticks(content) {
  let fixed = content;

  // Fix {`{{...}}`} to {{...}}
  fixed = fixed.replace(/\{`\{\{/g, '{{');
  fixed = fixed.replace(/\}\}`\}/g, '}}');

  return fixed;
}

function cleanupWhitespace(content) {
  let fixed = content;

  // Remove excessive empty lines
  fixed = fixed.replace(/\n{4,}/g, '\n\n\n');

  return fixed;
}

function fixAllIssues(content) {
  let fixed = content;

  fixed = fixTabs(fixed);
  fixed = fixParamFields(fixed);
  fixed = fixTemplateBackticks(fixed);
  fixed = cleanupWhitespace(fixed);

  return fixed;
}

const docsDir = path.join(__dirname, '..', 'docs');
const mdFiles = findMdFiles(docsDir);

console.log(`Processing ${mdFiles.length} files...\n`);

let fixedCount = 0;

mdFiles.forEach((filePath) => {
  const relativePath = filePath.replace(docsDir, 'docs');
  const content = fs.readFileSync(filePath, 'utf-8');
  const fixed = fixAllIssues(content);

  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    console.log(`✓ Fixed: ${relativePath}`);
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files!`);
