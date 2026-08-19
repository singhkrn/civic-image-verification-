async function runAdminCheck() {
    const fileInput = document.getElementById('adminImageInput');
    const resultsDiv = document.getElementById('adminResults');
    const jsonOutput = document.getElementById('jsonOutput');
    const resolveBtn = document.getElementById('resolveBtn');

    if (fileInput.files.length === 0) {
        alert("Please select an image for diagnostics.");
        return;
    }

    // Reset resolve button state on a new check
    resolveBtn.innerText = "Mark Issue as Resolved";
    resolveBtn.style.backgroundColor = "#10b981";
    resolveBtn.disabled = false;

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
        
        // Pretty-print the JSON response
        jsonOutput.innerText = JSON.stringify(data, null, 4);

    } catch (error) {
        console.error(error);
        jsonOutput.innerText = "Error: Could not connect to the backend server. Ensure localhost:8000 is running.";
    }
}

function markAsResolved() {
    const resolveBtn = document.getElementById('resolveBtn');
    const jsonOutput = document.getElementById('jsonOutput');

    if (!resolveBtn) return;

    resolveBtn.innerText = "Processing...";
    resolveBtn.disabled = true;

    setTimeout(() => {
        resolveBtn.innerText = "✓ Resolved Successfully";
        resolveBtn.style.backgroundColor = "#059669";
        
        // Append update to log
        jsonOutput.innerText += "\n\n[STATUS UPDATE]: Issue successfully marked as RESOLVED by administrator.";
    }, 600);
}

function filterView(category) {
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    const jsonOutput = document.getElementById('jsonOutput');
    const resultsDiv = document.getElementById('adminResults');
    const resolveBtn = document.getElementById('resolveBtn');

    resultsDiv.classList.remove('hidden');
    if (resolveBtn) resolveBtn.style.display = 'none'; // Hide resolve button on sidebar filters

    if (category === 'pending') {
        jsonOutput.innerText = "Showing all pending submissions awaiting review.";
    } else if (category === 'resolved') {
        jsonOutput.innerText = "Showing history of resolved issues.";
    } else if (category === 'rejected') {
        jsonOutput.innerText = "Showing rejected duplicate submissions.";
    }
}
