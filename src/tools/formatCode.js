export async function formatCode(value, language) {
  if (!value.trim()) throw new Error('Enter code to format.')
  if (value.length > 100_000) throw new Error('Format up to 100,000 characters at a time.')
  const prettier = await import('prettier/standalone')
  let parser
  let plugins
  if (language === 'html') {
    parser = 'html'
    const [html, babel, estree, postcss] = await Promise.all([
      import('prettier/plugins/html'), import('prettier/plugins/babel'), import('prettier/plugins/estree'), import('prettier/plugins/postcss'),
    ])
    plugins = [html.default, babel.default, estree.default, postcss.default]
  } else if (language === 'css') {
    parser = 'css'
    plugins = [(await import('prettier/plugins/postcss')).default]
  } else if (language === 'js') {
    parser = 'babel'
    const [babel, estree] = await Promise.all([import('prettier/plugins/babel'), import('prettier/plugins/estree')])
    plugins = [babel.default, estree.default]
  } else {
    throw new Error('Choose HTML, CSS, or JavaScript.')
  }
  return prettier.format(value, { parser, plugins, tabWidth: 2, printWidth: 100 })
}
