const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the shared package
config.watchFolders = [workspaceRoot];

// Let Metro find packages in the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = false;

// Force Metro to resolve Zustand to its CommonJS version instead of ESM
// This fixes the "Cannot use 'import.meta' outside a module" error on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    try {
      const result = require.resolve(moduleName, { paths: [projectRoot, workspaceRoot] });
      return {
        filePath: result,
        type: 'sourceFile',
      };
    } catch (e) {
      // Fallback if not found
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
