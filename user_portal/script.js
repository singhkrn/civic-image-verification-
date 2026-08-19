// Example function to attach to your "Upload" or "Submit" button
async function handleImageUpload(imageFile) {
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
        // This connects to the FastAPI backend running on your computer
        const response = await fetch("http://localhost:8000/api/verify", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Verification failed");
        }

        const result = await response.json();
        console.log("Verification Result:", result);
        
        // Example: Update your HTML with the result
        alert(`Status: ${result.status}\nIssue: ${result.civic_issue.category}\nAI Score: ${result.ai_detection.probability}`);
        
    } catch (error) {
        console.error("Error connecting to backend:", error);
        alert("Make sure the Python backend is running!");
    }
}
