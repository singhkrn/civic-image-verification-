async function runAdminCheck() {
    const fileInput = document.getElementById('adminImageInput');
    const resultsDiv = document.getElementById('adminResults');
    const jsonOutput = document.getElementById('jsonOutput');

    if (fileInput.files.length === 0) {
        alert("Please select an image for diagnostics.");
        return;
    }

    jsonOutput.innerText = "Running verification... Please wait.";
    resultsDiv.classList.remove('hidden');

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const response = await fetch("http://localhost:8000/api/verify", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Verification failed.");

        const data = await response.json();
        
        // Pretty-print the exact JSON response for the admin to inspect
        jsonOutput.innerText = JSON.stringify(data, null, 4);

    } catch (error) {
        console.error(error);
        jsonOutput.innerText = "Error: Could not connect to the backend server. Ensure localhost:8000 is running.";
    }
}
