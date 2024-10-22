async function uploadPDF() {
  const fileInput = document.getElementById("pdfFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function(e) {
    const typedArray = new Uint8Array(e.target.result);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      textContent.items.forEach((item) => {
        text += item.str + " ";
      });
    }
    getSummary(text);
  };

  reader.readAsArrayBuffer(file);
}

async function getSummary(text) {
  const apiKey = 'YOUR-CHATGPT-API-KEY';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Please summarize this text: ${text}` },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const summary = data.choices[0].message.content;

    document.getElementById('summary').innerText = summary;
  } catch (error) {
    console.error('Error summarizing text:', error);
  }
}
