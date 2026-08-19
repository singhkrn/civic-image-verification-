async function submitReport() {
    const fileInput = document.getElementById('imageInput');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    if (fileInput.files.length === 0) {
        alert("Please select an image first.");
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    loading.classList.remove('hidden');
    results.classList.add('hidden');

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        // Send image to your FastAPI backend
        const response = await fetch("http://localhost:8000/api/verify", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Verification failed on the server.");

        const data = await response.json();
        
        // Display results
        document.getElementById('resStatus').innerText = data.status;
        document.getElementById('resIssue').innerText = data.civic_issue.category;
        document.getElementById('resAi').innerText = data.ai_detection.status;
        
        results.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        alert("Error connecting to the backend. Make sure your Python server is running on localhost:8000.");
    } finally {
        submitBtn.disabled = false;
        loading.classList.add('hidden');
    }
}
