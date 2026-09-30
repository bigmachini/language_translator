const message = document.querySelector('#message');
const translate = document.querySelector('#translate');
const result = document.querySelector('#result');
const status = document.querySelector('#status');
const count = document.querySelector('#count');

message.addEventListener('input', () => count.textContent = `${message.value.length} / 4000`);
message.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    runTranslation();
  }
});
translate.addEventListener('click', runTranslation);

function resultBlock(text) {
  const block = document.createElement('article');
  block.textContent = text;
  block.addEventListener('click', async () => {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Copied.';
  });
  return block;
}

async function runTranslation() {
  const text = message.value.trim();
  if (!text || translate.disabled) return;
  translate.disabled = true;
  status.textContent = 'Translating…';
  result.hidden = true;
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Translation failed.');
    let copyText;
    result.replaceChildren();
    if (data.source_language === 'english') {
      copyText = `${data.corrected_english}\n\n${data.french}`;
    } else {
      copyText = data.english;
    }
    result.append(resultBlock(copyText));
    result.hidden = false;
    message.value = '';
    count.textContent = '0 / 4000';
    message.focus();
    try {
      await navigator.clipboard.writeText(copyText);
      status.textContent = 'Translated and copied.';
    } catch {
      status.textContent = 'Translation ready—click it to copy.';
    }
  } catch (error) {
    status.textContent = error.message;
  } finally {
    translate.disabled = false;
  }
}
