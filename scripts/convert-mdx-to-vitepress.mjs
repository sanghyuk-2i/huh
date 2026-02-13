#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .mdx files in docs directory
function findMdxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .vitepress
      if (!file.startsWith('.') && file !== 'node_modules') {
        findMdxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function convertMdxToVitepress(content) {
  let converted = content;

  // Remove 'icon' from frontmatter
  converted = converted.replace(/^icon:\s*['"].*['"]\s*$/gm, '');

  // Convert <CodeGroup> to ::: code-group
  converted = converted.replace(/<CodeGroup>/g, '::: code-group');
  converted = converted.replace(/<\/CodeGroup>/g, ':::');

  // Convert code block labels: ```bash pnpm -> ```bash [pnpm]
  converted = converted.replace(/```(\w+)\s+(\w+)/g, '```$1 [$2]');

  // Convert <Steps> (remove opening tag)
  converted = converted.replace(/<Steps>/g, '');
  converted = converted.replace(/<\/Steps>/g, '');

  // Convert <Step title="..."> to ### ...
  converted = converted.replace(/<Step title=["']([^"']+)["']>/g, '### $1');
  converted = converted.replace(/<\/Step>/g, '');

  // Convert <Note> to ::: tip
  converted = converted.replace(/<Note>/g, '::: tip');
  converted = converted.replace(/<\/Note>/g, ':::');

  // Convert <Warning> to ::: warning
  converted = converted.replace(/<Warning>/g, '::: warning');
  converted = converted.replace(/<\/Warning>/g, ':::');

  // Convert <Tip> to ::: tip
  converted = converted.replace(/<Tip>/g, '::: tip');
  converted = converted.replace(/<\/Tip>/g, ':::');

  // Convert <Info> to ::: info
  converted = converted.replace(/<Info>/g, '::: info');
  converted = converted.replace(/<\/Info>/g, ':::');

  // Convert <Danger> to ::: danger
  converted = converted.replace(/<Danger>/g, '::: danger');
  converted = converted.replace(/<\/Danger>/g, ':::');

  // Remove <CardGroup> and </CardGroup>
  converted = converted.replace(/<CardGroup[^>]*>/g, '');
  converted = converted.replace(/<\/CardGroup>/g, '');

  // Convert <Card> to markdown links
  converted = converted.replace(/<Card\s+title=["']([^"']+)["']\s+icon=["'][^"']*["']\s+href=["']([^"']+)["']>\s*([^<]*)\s*<\/Card>/g, '- **[$1]($2)** - $3');
  converted = converted.replace(/<Card\s+title=["']([^"']+)["']\s+href=["']([^"']+)["']>\s*([^<]*)\s*<\/Card>/g, '- **[$1]($2)** - $3');

  // Remove <Accordion> and related tags
  converted = converted.replace(/<Accordion[^>]*>/g, '');
  converted = converted.replace(/<\/Accordion>/g, '');
  converted = converted.replace(/<AccordionGroup[^>]*>/g, '');
  converted = converted.replace(/<\/AccordionGroup>/g, '');

  // Fix template literal backticks in table cells ({{userName}} format)
  converted = converted.replace(/\{`\{\{/g, '{{');
  converted = converted.replace(/\}\}`\}/g, '}}');

  // Clean up multiple empty lines
  converted = converted.replace(/\n{3,}/g, '\n\n');

  // Clean up empty icon lines in frontmatter
  converted = converted.replace(/---\n\n/g, '---\n');

  return converted;
}

// Main conversion
const docsDir = path.join(__dirname, '..', 'docs');
const mdxFiles = findMdxFiles(docsDir);

console.log(`Found ${mdxFiles.length} .mdx files to convert`);

let converted = 0;
let skipped = 0;

mdxFiles.forEach((filePath) => {
  // Skip index.mdx as we already have index.md
  if (filePath.endsWith('index.mdx')) {
    console.log(`Skipping: ${filePath}`);
    skipped++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const convertedContent = convertMdxToVitepress(content);

  // Write back to the same file (or rename to .md)
  const newFilePath = filePath.replace('.mdx', '.md');

  fs.writeFileSync(newFilePath, convertedContent, 'utf-8');

  // Remove old .mdx file if we created a new .md file
  if (newFilePath !== filePath) {
    fs.unlinkSync(filePath);
    console.log(`Converted: ${filePath} -> ${newFilePath}`);
  } else {
    console.log(`Updated: ${filePath}`);
  }

  converted++;
});

console.log(`\nConversion complete!`);
console.log(`Converted: ${converted} files`);
console.log(`Skipped: ${skipped} files`);
