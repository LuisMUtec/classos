const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/luism/.claude/plugins/cache/anthropic-agent-skills/document-skills/69c0b1a06741/skills/pptx/scripts/html2pptx');
const path = require('path');

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'edhack — generador de ejercicios CS validados';

  for (let i = 1; i <= 6; i++) {
    const file = path.join(__dirname, `slide${i}.html`);
    await html2pptx(file, pptx);
    console.log(`slide ${i} processed`);
  }

  await pptx.writeFile({ fileName: '/home/luism/dev/edhack/app/pitch-deck.pptx' });
  console.log('pitch-deck.pptx written');
}

build().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
