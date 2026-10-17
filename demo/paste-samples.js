// Contoh isi clipboard nyata (disederhanakan) untuk menguji paste di demo.
export const PASTE_SAMPLES = {
  gdocs: {
    label: 'Google Docs',
    html: '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc"><h1 dir="ltr" style="line-height:1.38;margin-top:20pt;"><span style="font-size:20pt;font-family:Arial;color:#000000;font-weight:400;">Dari Google Docs</span></h1><p dir="ltr" style="line-height:1.38;"><span style="font-size:11pt;font-family:Arial;font-weight:400;">Teks biasa, </span><span style="font-size:11pt;font-family:Arial;font-weight:700;">tebal</span><span style="font-size:11pt;font-weight:400;">, dan </span><span style="font-size:11pt;font-weight:400;font-style:italic;">miring</span><span style="font-size:11pt;font-weight:400;">.</span></p><ul style="margin-top:0;"><li dir="ltr" style="list-style-type:disc;"><p dir="ltr" role="presentation"><span style="font-weight:400;">Item satu</span></p></li><li dir="ltr"><p dir="ltr" role="presentation"><span>Item dua</span></p></li></ul></b>',
  },
  word: {
    label: 'Microsoft Word',
    html: `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><style>p.MsoNormal{margin:0}</style></head><body><!--StartFragment--><p class=MsoNormal><b><span style='font-size:14.0pt;mso-bidi-font-family:Calibri'>Dari Microsoft Word<o:p></o:p></span></b></p><p class=MsoListParagraph style='mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span>Simbol bullet palsu dari Word dibuang<o:p></o:p></span></p><p class=MsoNormal><i>Catatan</i>&nbsp;akhir<o:p>&nbsp;</o:p></p><!--EndFragment--></body></html>`,
  },
  evil: {
    label: 'HTML berbahaya',
    html: '<p onclick="alert(1)" style="color:red">Teks aman <img src=x onerror="alert(\'xss\')"><a href="javascript:alert(1)">link jahat</a> <a href="https://example.com" target="_blank" onmouseover="alert(2)">link aman</a></p><script>alert(3)</script><iframe src="https://example.com"></iframe><p x-init="alert(4)">Atribut Alpine dibuang</p>',
  },
  text: {
    label: 'Teks polos',
    text: 'Paragraf pertama dari teks polos.\nBaris kedua masih di paragraf yang sama.\n\nParagraf kedua. Karakter <b>HTML</b> tetap jadi teks.',
  },
};
