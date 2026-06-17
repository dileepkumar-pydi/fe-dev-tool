export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂', type: 'page' },
  { id: 'base64', label: 'Base64 Tools', icon: '</>', type: 'tool' },
  { id: 'json', label: 'JSON Tools', icon: '{}', type: 'tool' },
  { id: 'hash', label: 'Hash Tools', icon: '#', type: 'tool' },
  { id: 'text', label: 'Text Tools', icon: '📄', type: 'tool' },
  { id: 'timestamp', label: 'Timestamp Tools', icon: '◔', type: 'tool' },
  { id: 'number', label: 'Number Tools', icon: '010', type: 'tool' },
  { id: 'escape', label: 'Escape Tools', icon: '🛡', type: 'tool' },
  { id: 'uuid', label: 'UUID Tools', icon: '✣', type: 'tool' },
  { id: 'color', label: 'Color Tools', icon: '◌', type: 'tool' },
  { id: 'file', label: 'File Tools', icon: '⇪', type: 'tool' },
  { id: 'pdf', label: 'PDF Tools', icon: '▤', type: 'tool' },
]

export const dashboardStats = [
  { label: 'Total Tools', value: '100+', icon: '</>', accent: 'sky' },
  { label: 'API Requests', value: '45.2k', icon: '↗', accent: 'mint' },
  { label: 'This Month', value: '1.8k', icon: '◴', accent: 'slate' },
]

export const dashboardCategories = [
  { id: 'base64', title: 'Base64 Tools', description: 'Encode and decode Base64 data', count: 12, color: 'sky', icon: '</>' },
  { id: 'json', title: 'JSON Tools', description: 'Format, validate, and minify JSON', count: 8, color: 'pink', icon: '{}' },
  { id: 'hash', title: 'Hash Tools', description: 'Generate SHA, MD5, and other hashes', count: 15, color: 'green', icon: '#' },
  { id: 'text', title: 'Text Tools', description: 'Transform and analyze text', count: 20, color: 'orange', icon: '📄' },
  { id: 'timestamp', title: 'Timestamp Tools', description: 'Convert timestamps and dates', count: 6, color: 'rose', icon: '◔' },
  { id: 'number', title: 'Number Tools', description: 'Convert between number bases', count: 10, color: 'indigo', icon: '010' },
  { id: 'escape', title: 'Escape Tools', description: 'Escape and unescape strings', count: 8, color: 'teal', icon: '🛡' },
  { id: 'color', title: 'Color Tools', description: 'Convert color formats', count: 12, color: 'purple', icon: '◌' },
  { id: 'file', title: 'File Tools', description: 'Analyze and process files', count: 9, color: 'amber', icon: '⇪' },
  { id: 'pdf', title: 'PDF Tools', description: 'Merge, split, and organize PDFs', count: 7, color: 'rose', icon: '▤' },
]

export const popularTools = [
  { rank: 1, name: 'Base64 Encode', uses: '12.4k uses' },
  { rank: 2, name: 'JSON Formatter', uses: '10.2k uses' },
  { rank: 3, name: 'SHA-256 Hash', uses: '8.9k uses' },
  { rank: 4, name: 'UUID Generator', uses: '7.1k uses' },
  { rank: 5, name: 'Timestamp Converter', uses: '6.8k uses' },
]

export const recentActivity = [
  { title: 'Base64 Decode', time: '2 minutes ago' },
  { title: 'JSON Validate', time: '15 minutes ago' },
  { title: 'SHA-256 Hash', time: '1 hour ago' },
  { title: 'HEX to RGB', time: '2 hours ago' },
]

export const quickStartGuide = {
  title: 'Quick Start Guide',
  subtitle: 'New to DevTools?',
  description: 'Learn how to use our API and integrate tools into your workflow.',
  action: 'View Documentation',
}

export const toolPages = {
  base64: {
    id: 'base64',
    category: 'Base64 Tools',
    title: 'Base64 Encoder/Decoder',
    badge: 'Popular',
    description: 'Encode text to Base64 or decode Base64 to text',
    layout: 'dual-panels',
    inputTitle: 'Input',
    outputTitle: 'Output',
    inputControls: {
      segmented: ['Encode', 'Decode'],
      textareaPlaceholder: 'Enter text to encode...',
      primaryAction: 'Encode',
      secondaryAction: '↻',
    },
    outputPlaceholder: 'Result will appear here...',
    exampleSection: {
      title: 'Examples',
      cards: [
        { title: 'Plain Text', body: 'Hello, World!' },
        { title: 'Base64', body: 'SGVsbG8sIFdvcmxkIQ==' },
      ],
    },
  },
  json: {
    id: 'json',
    category: 'JSON Tools',
    title: 'JSON Formatter & Validator',
    badge: 'Editor',
    description: 'Format, minify, and validate JSON data',
    layout: 'dual-panels',
    inputTitle: 'Input JSON',
    outputTitle: 'Output',
    inputControls: {
      textareaPlaceholder: '{"key": "value"}',
      actions: ['Format', 'Minify', 'Validate'],
      secondaryAction: '↻',
    },
    outputPlaceholder: 'Formatted/minified JSON will appear here...',
    exampleSection: {
      title: 'Example JSON',
      code: `{
  "user": {
    "id": 12345,
    "name": "John Doe",
    "email": "john@example.com"
  }
}`,
    },
  },
  hash: {
    id: 'hash',
    category: 'Hash Tools',
    title: 'Hash Generator',
    badge: 'Security',
    description: 'Generate cryptographic hashes using various algorithms',
    layout: 'dual-panels',
    inputTitle: 'Input',
    outputTitle: 'All Hashes',
    form: {
      fields: [
        { label: 'Algorithm', type: 'select', value: 'SHA-256' },
        { label: 'Text to Hash', type: 'textarea', placeholder: 'Enter text to hash...' },
      ],
      primaryAction: 'Generate Hash',
      secondaryAction: '↻',
    },
    outputEmpty: 'Generate a hash to see results',
    exampleSection: {
      title: 'About Hash Algorithms',
      cards: [
        { title: 'SHA-256', body: 'Widely used cryptographic hash function, part of SHA-2 family' },
        { title: 'SHA-512', body: 'More secure variant with longer hash output (512 bits)' },
        { title: 'MD5', body: 'Legacy algorithm, not recommended for security-critical applications' },
        { title: 'SHA-1', body: 'Deprecated for security uses, but still used for checksums' },
      ],
    },
  },
  text: {
    id: 'text',
    category: 'Text Tools',
    title: 'Text Transformer',
    badge: 'Transform',
    description: 'Transform text case and analyze text statistics',
    outputPlaceholder: 'Transformed text will appear here...',
    exampleSection: {
      title: 'Transformation Examples',
      cards: [
        { title: 'Input', body: 'Hello World! This is DevTools.' },
        { title: 'UPPERCASE', body: 'HELLO WORLD! THIS IS DEVTOOLS.' },
        { title: 'Title Case', body: 'Hello World! This Is Devtools.' },
        { title: 'Reverse', body: '.slooTveD si sihT !dlroW olleH' },
      ],
    },
  },
  timestamp: {
    id: 'timestamp',
    category: 'Timestamp Tools',
    title: 'Timestamp Converter',
    badge: 'Time',
    description: 'Convert between Unix timestamps and human-readable dates',
    layout: 'two-cards',
    cards: [
      {
        title: 'Timestamp to Date',
        icon: '📅',
        fields: [
          { label: 'Unix Timestamp', type: 'input', value: '1234567890' },
        ],
        primaryAction: 'Convert',
        secondaryAction: 'Now',
      },
      {
        title: 'Date to Timestamp',
        icon: '📅',
        fields: [
          { label: 'Date & Time', type: 'input', value: 'dd/mm/yyyy, --:-- --' },
        ],
        primaryAction: 'Convert',
        secondaryAction: '↻',
      },
    ],
    exampleSection: {
      title: 'Quick Reference',
      cards: [
        { title: 'Current Timestamp', body: '1780742394' },
        { title: 'Format', body: 'Unix timestamp (seconds since Jan 1, 1970)' },
        { title: 'Range', body: '1970-01-01 to 2038-01-19' },
      ],
    },
  },
  number: {
    id: 'number',
    category: 'Number Tools',
    title: 'Number Base Converter',
    badge: 'Binary',
    description: 'Convert numbers between decimal, binary, octal, and hexadecimal',
    outputEmpty: 'Enter a number to see conversions',
    exampleSection: {
      title: 'Quick Reference',
      table: {
        columns: ['Decimal', 'Binary', 'Octal', 'Hexadecimal'],
        rows: [
          ['0', '0b0', '0o0', '0x0'],
          ['1', '0b1', '0o1', '0x1'],
          ['2', '0b10', '0o2', '0x2'],
          ['8', '0b1000', '0o10', '0x8'],
          ['10', '0b1010', '0o12', '0xA'],
        ],
      },
    },
  },
  escape: {
    id: 'escape',
    category: 'Escape Tools',
    title: 'Escape & Unescape',
    badge: 'Encode',
    description: 'Encode and decode URL, HTML, and JavaScript strings',
    outputPlaceholder: 'Result will appear here...',
    exampleSection: {
      title: 'Common Use Cases',
      cards: [
        { title: 'URL Encoding', body: 'Before\nhello world & params=1' },
        { title: 'After', body: 'hello%20world%20%26%20params%3D1' },
        { title: 'HTML Encoding', body: 'Before\n<div>Hello</div>' },
        { title: 'After', body: '&lt;div&gt;Hello&lt;/div&gt;' },
      ],
    },
  },
  uuid: {
    id: 'uuid',
    category: 'UUID Tools',
    title: 'UUID Generator & Validator',
    badge: 'Generate',
    description: 'Generate and validate universally unique identifiers (UUIDs)',
    exampleSection: {
      title: 'About UUIDs',
      cards: [
        { title: 'Format', body: '8-4-4-4-12 hexadecimal digits separated by hyphens' },
        { title: 'Version 4', body: 'Randomly generated, most commonly used version' },
        { title: 'Use Cases', body: 'Database keys, session IDs, distributed systems' },
      ],
    },
  },
  color: {
    id: 'color',
    category: 'Color Tools',
    title: 'Color Converter',
    badge: 'Design',
    description: 'Convert colors between HEX, RGB, and HSL formats',
    layout: 'dual-panels',
    inputTitle: 'Input Color',
    outputTitle: 'Color Formats',
    form: {
      fields: [
        { label: 'HEX Color Code', type: 'color-input', value: '#0ea5e9' },
        { label: 'Pick a Color', type: 'swatch', value: '#0ea5e9' },
      ],
      primaryAction: 'Convert',
      secondaryAction: '↻',
    },
    outputEmpty: 'Enter a color to see conversions',
    exampleSection: {
      title: 'Popular Color Palettes',
      palettes: [
        { name: 'Primary Blue', value: '#0ea5e9' },
        { name: 'Teal', value: '#14b8a6' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Green', value: '#4ade80' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Red', value: '#ef4444' },
      ],
    },
  },
  file: {
    id: 'file',
    category: 'File Tools',
    title: 'File Metadata Viewer',
    badge: 'Upload',
    description: 'Extract metadata and generate checksums from uploaded files',
    layout: 'upload',
    upload: {
      title: 'Upload File',
      emptyTitle: 'Drop file here',
      emptyHint: 'or click to browse',
      action: 'Choose File',
    },
    outputTitle: 'File Information',
    outputEmpty: 'Upload a file to view metadata',
    exampleSection: {
      title: 'Supported Operations',
      cards: [
        { title: 'Metadata Extraction', body: 'Name, size, MIME type, modification date' },
        { title: 'Checksum Generation', body: 'SHA-256 hash for file verification' },
        { title: 'Privacy', body: 'All processing happens locally in your browser' },
      ],
    },
  },
  pdf: {
    id: 'pdf',
    category: 'PDF Tools',
    title: 'PDF Tools',
    badge: 'Browser',
    description: 'Enterprise PDF utilities with the same clean in-browser workflow as the rest of DevTools',
    hero: {
      subtitle: 'Enterprise PDF utilities · Browser-based · Zero uploads',
      highlights: ['Browser-based', 'Secure', 'Instant'],
    },
    operations: [
      {
        id: 'merge',
        label: 'Merge PDF',
        description: 'Combine multiple PDF files into one document',
        tag: 'Popular',
      },
      {
        id: 'split',
        label: 'Split PDF',
        description: 'Extract specific pages or split by ranges',
      },
      {
        id: 'compress',
        label: 'Compress PDF',
        description: 'Reduce file size while preserving readability',
        tag: 'Popular',
      },
      {
        id: 'rotate',
        label: 'Rotate Pages',
        description: 'Rotate pages by 90°, 180°, or 270°',
      },
      {
        id: 'remove',
        label: 'Remove Pages',
        description: 'Delete unwanted pages from a PDF',
      },
      {
        id: 'reorder',
        label: 'Reorder Pages',
        description: 'Rearrange pages before exporting',
      },
      {
        id: 'numbers',
        label: 'Page Numbers',
        description: 'Add page numbers automatically',
      },
      {
        id: 'jpg-to-pdf',
        label: 'JPG to PDF',
        description: 'Convert JPG images into a PDF document',
        tag: 'Convert',
      },
      {
        id: 'word-to-pdf',
        label: 'Word to PDF',
        description: 'Convert DOC or DOCX documents to PDF',
        tag: 'Convert',
      },
      {
        id: 'powerpoint-to-pdf',
        label: 'PowerPoint to PDF',
        description: 'Convert PPT or PPTX slides to PDF',
        tag: 'Convert',
      },
      {
        id: 'excel-to-pdf',
        label: 'Excel to PDF',
        description: 'Convert XLS or XLSX sheets to PDF',
        tag: 'Convert',
      },
      {
        id: 'html-to-pdf',
        label: 'HTML to PDF',
        description: 'Render HTML files as printable PDF documents',
        tag: 'Convert',
      },
      {
        id: 'pdf-to-jpg',
        label: 'PDF to JPG',
        description: 'Export PDF pages as JPG images',
        tag: 'Convert',
      },
      {
        id: 'pdf-to-word',
        label: 'PDF to Word',
        description: 'Convert PDF documents to editable Word format',
        tag: 'Convert',
      },
      {
        id: 'pdf-to-powerpoint',
        label: 'PDF to PowerPoint',
        description: 'Convert PDF content into PowerPoint slides',
        tag: 'Convert',
      },
      {
        id: 'pdf-to-excel',
        label: 'PDF to Excel',
        description: 'Convert PDF tabular content into Excel format',
        tag: 'Convert',
      },
      {
        id: 'pdf-to-pdfa',
        label: 'PDF to PDF/A',
        description: 'Convert standard PDFs into archival PDF/A output',
        tag: 'Archive',
      },
    ],
    uploadPanel: {
      title: 'Drop your PDF files here',
      hint: 'or click to browse from your computer',
      bullets: ['PDF only', 'Up to 100MB', 'Processed locally'],
      action: 'Choose PDF Files',
    },
    capabilities: [
      'Client-side PDF processing',
      'No file size server limit',
      'Preserves original quality',
      'Instant download on complete',
      'Works offline',
    ],
    infoCards: [
      {
        title: 'Privacy First',
        body: 'Your files are processed entirely in-browser using local PDF tooling. Nothing is sent to any server.',
      },
      {
        title: 'About This Tool',
        body: 'Each PDF operation uses the same clean DevTools layout and keeps the background aligned with the rest of the app.',
      },
    ],
    localNote: 'All processing happens locally in your browser. Your files are never uploaded to any server.',
  },
}
