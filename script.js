document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const responseMessage = document.getElementById('responseMessage');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        responseMessage.innerHTML = `
            <p>${result.message}</p>
            <p><strong>Registration Code:</strong> ${result.code}</p>
        `;
    } catch (error) {
        responseMessage.textContent = 'Error uploading and sending the voice message.';
        console.error('Error:', error);
    }
});
