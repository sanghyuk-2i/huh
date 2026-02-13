#!/bin/bash

# Publish all packages to npm in dependency order
# Usage: ./scripts/publish-all.sh

set -e

echo "🚀 Publishing @sanghyuk-2i/huh packages to npm..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must be run from repository root"
  exit 1
fi

# Check if we have built packages
if [ ! -d "packages/core/dist" ]; then
  echo "⚠️  Building packages first..."
  pnpm build
fi

echo "📦 Publishing packages in dependency order..."
echo ""

# 1. Core (no dependencies)
echo "1/7 Publishing @sanghyuk-2i/huh-core..."
cd packages/core
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-core published"
echo ""

# 2. Framework bindings (depend on core)
echo "2/7 Publishing @sanghyuk-2i/huh-react..."
cd packages/react
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-react published"
echo ""

echo "3/7 Publishing @sanghyuk-2i/huh-vue..."
cd packages/vue
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-vue published"
echo ""

echo "4/7 Publishing @sanghyuk-2i/huh-svelte..."
cd packages/svelte
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-svelte published"
echo ""

# 3. Plugins (depend on core)
echo "5/7 Publishing @sanghyuk-2i/huh-plugin-sentry..."
cd packages/plugin-sentry
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-plugin-sentry published"
echo ""

echo "6/7 Publishing @sanghyuk-2i/huh-plugin-datadog..."
cd packages/plugin-datadog
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-plugin-datadog published"
echo ""

# 4. CLI (depends on core)
echo "7/7 Publishing @sanghyuk-2i/huh-cli..."
cd packages/cli
npm publish --access public
cd ../..
echo "✅ @sanghyuk-2i/huh-cli published"
echo ""

echo "🎉 All packages published successfully!"
echo ""
echo "Next steps:"
echo "  1. Check npm: https://www.npmjs.com/package/@sanghyuk-2i/huh-core"
echo "  2. Verify GitHub Packages section is auto-linked"
echo "  3. Update documentation with installation instructions"
