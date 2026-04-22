const fs = require('fs');
const path = require('path');

const projectRoot = 'c:\\Users\\PMLS\\Downloads\\homease-main';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it imports colors statically from theme
    if (!content.includes('colors') || !content.includes('@/constants/theme')) return;

    // Skip already refactored manual files
    if (filePath.includes('ThemeContext') || filePath.includes('theme.ts') || filePath.includes('types.ts') || filePath.includes('settings.tsx') || filePath.endsWith('app\\_layout.tsx')) {
        return;
    }
    
    let original = content;

    // Remove colors from import { colors, fonts } from "@/constants/theme"
    content = content.replace(/colors\s*,\s*/g, '');
    content = content.replace(/,\s*colors/g, '');
    content = content.replace(/import\s*\{\s*colors\s*\}\s*from\s+['"]@\/constants\/theme['"];?\r?\n/g, '');

    // Add useTheme import if not there
    if (!content.includes('useTheme')) {
        const lastImportIndex = content.lastIndexOf('import ');
        let endOfLastImport = content.indexOf('\n', lastImportIndex);
        if (endOfLastImport === -1) endOfLastImport = content.length;
        content = content.slice(0, endOfLastImport) + '\nimport { useTheme } from "@/context/ThemeContext";' + content.slice(endOfLastImport);
    }

    // Change StyleSheet.create to createStyles
    let hasStyles = false;
    if (content.includes('const styles = StyleSheet.create')) {
        hasStyles = true;
        content = content.replace(/const styles = StyleSheet\.create/g, 'const createStyles = (colors: any) => StyleSheet.create');
    }

    // Insert hooks into the main component. 
    // Usually it's `export default function Name() {` or `export default function() {`
    // Wait, components might not be `export default function`. They might be `const Comp = () => {`
    // Let's also check for `export default function ` OR `export function ` OR `const [A-Z].* = .*=> {`
    
    const functionRegex = /(export(?: default)? function\s+[a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/;
    const arrowRegex = /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{)/;

    if (functionRegex.test(content)) {
        content = content.replace(functionRegex, function(match) {
            let injected = `\n  const { colors } = useTheme();`;
            if (hasStyles) {
                injected += `\n  const styles = createStyles(colors);`;
            }
            return match + injected;
        });
    } else if (arrowRegex.test(content)) {
        content = content.replace(arrowRegex, function(match) {
            let injected = `\n  const { colors } = useTheme();`;
            if (hasStyles) {
                injected += `\n  const styles = createStyles(colors);`;
            }
            return match + injected;
        });
    } else {
        console.log("WARNING: Could not find inject point for hooks in", filePath);
    }
    
    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed', filePath);
    }
}

function walkArgs(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkArgs(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const targetDirs = [path.join(projectRoot, 'app'), path.join(projectRoot, 'components')];
targetDirs.forEach(dir => {
    try {
        walkArgs(dir).forEach(processFile);
    } catch(e) {}
});

console.log("Refactoring complete.");
