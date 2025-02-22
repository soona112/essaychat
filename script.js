async function generateEssay() {
    const input = document.querySelector('#generator input').value;
    const messages = document.querySelector('#generator .messages');
  
    if (!input.trim()) {
      alert('Please enter a topic!');
      return;
    }
  
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = input;
    messages.appendChild(userMsg);
  
    document.querySelector('#generator input').value = '';
  
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'message bot';
    loadingMsg.textContent = 'Generating essay...';
    messages.appendChild(loadingMsg);
  
    try {
      const response = await fetch('http://localhost:3000/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
  
      const data = await response.json();
  
      loadingMsg.textContent = data.essay || 'Failed to generate essay.';
    } catch (error) {
      console.error('Error:', error);
      loadingMsg.textContent = 'An error occurred. Please try again.';
    }
  }
