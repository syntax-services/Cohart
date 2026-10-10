/**
 * exportUtils.ts
 * Client-side document export utilities for Ara AI responses in Cohart.
 * Supports: .txt, .docx (Microsoft Word / WPS compatible), and printable .pdf
 */

export function downloadAsText(filename: string, content: string) {
  const safeFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, safeFilename);
}

export function downloadAsDocx(filename: string, title: string, markdownContent: string) {
  const safeFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;

  // Convert basic markdown to clean HTML for Word compatibility
  const htmlBody = markdownContent
    .replace(/^### (.*$)/gim, '<h3 style="font-family: Arial, sans-serif; color: #111; margin-top: 16px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-family: Arial, sans-serif; color: #111; margin-top: 20px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-family: Arial, sans-serif; color: #0B57D0; margin-top: 24px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background-color: #f1f3f4; padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/^\* (.*$)/gim, '<li style="margin-left: 20px; font-family: Arial, sans-serif;">$1</li>')
    .replace(/^- (.*$)/gim, '<li style="margin-left: 20px; font-family: Arial, sans-serif;">$1</li>')
    .replace(/\n\n/g, '</p><p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">')
    .replace(/\n/g, '<br/>');

  const docxTemplate = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1f1f1f; margin: 40px; }
    h1 { color: #0B57D0; font-size: 18pt; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; }
    h2 { color: #1e293b; font-size: 14pt; margin-top: 20px; }
    h3 { color: #334155; font-size: 12pt; }
    p { margin: 8px 0; }
    li { margin: 4px 0 4px 24px; }
    .header-box { border-left: 4px solid #0B57D0; padding-left: 12px; margin-bottom: 24px; color: #64748b; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="header-box">
    <strong>COHART ACADEMIC AI — ARA</strong><br/>
    Generated on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
    Topic: ${escapeXml(title)}
  </div>
  <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
    ${htmlBody}
  </p>
</body>
</html>`;

  const blob = new Blob(['\ufeff', docxTemplate], {
    type: 'application/msword;charset=utf-8',
  });
  triggerDownload(blob, safeFilename);
}

export function downloadAsPdf(filename: string, title: string, markdownContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to save or print this document as PDF.');
    return;
  }

  const htmlBody = markdownContent
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(title)} - Cohart Ara</title>
  <style>
    @page { margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #0B57D0;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .logo {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0B57D0;
    }
    .date {
      font-size: 11px;
      color: #666;
    }
    h1 { font-size: 20px; color: #111; margin-top: 24px; }
    h2 { font-size: 16px; color: #222; margin-top: 18px; }
    h3 { font-size: 14px; color: #333; margin-top: 14px; }
    p { margin: 8px 0; font-size: 13px; }
    li { margin: 4px 0 4px 20px; font-size: 13px; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">COHART • ARA AI</div>
    <div class="date">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
  </div>
  <p>${htmlBody}</p>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`);

  printWindow.document.close();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.warn('Failed to copy text:', err);
    return false;
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
