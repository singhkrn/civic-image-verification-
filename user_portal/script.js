const newComplaintBtn = document.getElementById("newComplaintBtn");

const complaintModal = document.getElementById("complaintModal");

const complaintForm = document.getElementById("complaintForm");

const complaintList = document.getElementById("complaintList");

const searchComplaint = document.getElementById("searchComplaint");


// open form 

newComplaintBtn.addEventListener("click", function () {

    complaintModal.style.display = "flex";

});


// close form

function closeComplaintForm() {

    complaintModal.style.display = "none";

}


// complain storage in form of array

let complaints = [];

// complain submit

complaintForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const title = document.getElementById("title").value;

    const description = document.getElementById("description").value;

    const category = document.getElementById("category").value;

    const location = document.getElementById("location").value;

    const priority = document.getElementById("priority").value;


    const complaint = {

        id: "CIV-" + (complaints.length + 1001),

        title: title,

        description: description,

        category: category,

        location: location,

        priority: priority,

        status: "Pending",

        date: new Date().toLocaleDateString()

    };

    complaints.push(complaint);
    displayComplaints();
    complaintForm.reset();
    closeComplaintForm();

});


// displaying complain

function displayComplaints(list = complaints) {

    complaintList.innerHTML = "";


    if (list.length === 0) {

        complaintList.innerHTML = `
            <p class="no-complaints">
                No complaints found.
            </p>
        `;
        return;
    }

    list.forEach(function (complaint) {

        const card = document.createElement("div");
        card.classList.add("complaint-card");

        card.innerHTML = `
             <h3>
                ${complaint.title}
            </h3>

            <div class="complaint-details">
                ${complaint.id}
                ${complaint.category}
                ${complaint.location}
            </div>

            <p class="description">
                ${complaint.description}
            </p>

            <div class="complaint-bottom">

                <span>
                    ${complaint.date}
                    ${complaint.priority} priority
                </span>

                <span class="status ${getStatusClass(complaint.status)}">
                    ${complaint.status}
                </span>

            </div>
        `;


        complaintList.appendChild(card);

    });

}

// status class 

function getStatusClass(status) {

    if (status === "Pending") {
        return "pending";
    }
    if (status === "In Progress") {
        return "progress";
    }
    if (status === "Resolved") {
        return "resolved";
    }

    return "pending";
}


// search 

searchComplaint.addEventListener("input", function () {

    const search = this.value.toLowerCase();


    const filtered = complaints.filter(function (complaint) {

            return (

                complaint.title
                 .toLowerCase()
                .includes(search)

                ||

                complaint.category
                    .toLowerCase()
                    .includes(search)

                ||

                complaint.location
                    .toLowerCase()
                    .includes(search)

                ||

                complaint.status
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayComplaints(filtered);

});