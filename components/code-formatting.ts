import prettier from 'prettier';

export async function formatWithPrettier(code: string, language: 'python' | 'javascript' | 'typescript' | 'html' | 'css'): Promise<string> {
  try {
    const options = {
      parser: language === 'python' ? 'babel' : language,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5' as const,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      arrowParens: 'avoid' as const,
      endOfLine: 'lf' as const,
    };
    return await prettier.format(code, options);
  } catch (error) {
    console.error('Error formatting code:', error);
    return code;
  }
} 