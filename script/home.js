let allIssues = [];
let currentStatus = "all";

const issueContainer = document.getElementById("issue-container");
const issueCount = document.getElementById("issue-count");
const loadingSpinner = document.getElementById("loading-spinner");

const loadIssues = () => {
    loadingSpinner.classList.remove("hidden");
    issueContainer.innerHTML = "";

    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
        .then(res => res.json())
        .then(data => {
            allIssues = data.data;
            showIssues(allIssues);
            loadingSpinner.classList.add("hidden");
        })
        .catch(error => {
            console.log(error);
            loadingSpinner.classList.add("hidden");
        });
};

const showIssues = (issues) => {
    issueContainer.innerHTML = "";
    issueCount.innerText = `${issues.length} Issues`;

    if (issues.length === 0) {
        issueContainer.innerHTML = `
            <div class="col-span-full text-center bg-white rounded-xl p-10 shadow-sm">
                <p class="text-gray-500 text-lg">No issues found</p>
            </div>
        `;
        return;
    }

    issues.forEach(issue => {
        const div = document.createElement("div");

        const borderColor = issue.status === "open" ? "border-green-500" : "border-violet-500";

        const statusColor = issue.status === "open"
            ? "bg-green-100 text-green-700"
            : "bg-violet-100 text-violet-700";

        const statusIcon = issue.status === "open"
            ? "../assets/Open-Status.png"
            : "../assets/Closed- Status .png";

        const priorityColor =
            issue.priority === "high" ? "bg-red-100 text-red-600" :
            issue.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-600";

        div.innerHTML = `
            <div onclick="loadSingleIssue(${issue.id})"
                class="bg-white rounded-xl shadow-sm p-4 border-t-4 ${borderColor} cursor-pointer hover:shadow-md transition">

                <div class="flex justify-between items-center mb-3">

                    <span class="text-xs px-2 py-1 rounded-full ${statusColor} capitalize flex items-center gap-1">

                        <img src="${statusIcon}" class="w-3 h-3">

                        ${issue.status}

                    </span>

                    <span class="text-xs px-2 py-1 rounded-full ${priorityColor} capitalize">

                        ${issue.priority}

                    </span>

                </div>

                <h2 class="font-semibold text-[15px] mb-2 line-clamp-2">${issue.title}</h2>

                <p class="text-sm text-gray-500 mb-3 line-clamp-3">${issue.description}</p>

                <div class="flex flex-wrap gap-2 mb-3">
                    ${issue.labels.map(label => `
                        <span class="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">${label}</span>
                    `).join("")}
                </div>

                <div class="text-xs text-gray-500 space-y-1">
                    <p><span class="font-semibold">Author:</span> ${issue.author}</p>
                    <p><span class="font-semibold">Created:</span> ${new Date(issue.createdAt).toLocaleDateString()}</p>
                </div>

            </div>
        `;

        issueContainer.appendChild(div);
    });
};

const filterIssues = (status) => {
    currentStatus = status;
    setActiveTab(status);

    if (status === "all") {
        showIssues(allIssues);
    } else {
        const filtered = allIssues.filter(issue => issue.status === status);
        showIssues(filtered);
    }
};

const setActiveTab = (status) => {
    document.getElementById("tab-all").className = "btn btn-sm bg-gray-100 border-none tab-btn";
    document.getElementById("tab-open").className = "btn btn-sm bg-gray-100 border-none tab-btn";
    document.getElementById("tab-closed").className = "btn btn-sm bg-gray-100 border-none tab-btn";

    document.getElementById(`tab-${status}`).className = "btn btn-sm btn-primary tab-btn";
};

const loadSingleIssue = (id) => {
    fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
        .then(res => res.json())
        .then(data => displayModal(data.data));
};

const displayModal = (issue) => {
    const modalContent = document.getElementById("modal-content");

    modalContent.innerHTML = `
        <h2 class="text-2xl font-bold mb-3">${issue.title}</h2>

        <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-3 py-1 rounded-full text-sm ${issue.status === "open" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"} capitalize">
                ${issue.status}
            </span>
            <span class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 capitalize">
                ${issue.priority}
            </span>
        </div>

        <p class="text-gray-600 mb-4">${issue.description}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span class="font-semibold">Author:</span> ${issue.author}</p>
            <p><span class="font-semibold">Assignee:</span> ${issue.assignee ? issue.assignee : "Not Assigned"}</p>
            <p><span class="font-semibold">Created At:</span> ${new Date(issue.createdAt).toLocaleString()}</p>
            <p><span class="font-semibold">Updated At:</span> ${new Date(issue.updatedAt).toLocaleString()}</p>
        </div>

        <div class="mt-4">
            <h3 class="font-semibold mb-2">Labels</h3>
            <div class="flex flex-wrap gap-2">
                ${issue.labels.map(label => `
                    <span class="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm">${label}</span>
                `).join("")}
            </div>
        </div>
    `;

    document.getElementById("issue_modal").showModal();
};

document.getElementById("tab-all").addEventListener("click", () => filterIssues("all"));
document.getElementById("tab-open").addEventListener("click", () => filterIssues("open"));
document.getElementById("tab-closed").addEventListener("click", () => filterIssues("closed"));

document.getElementById("search-btn").addEventListener("click", () => {
    const searchText = document.getElementById("search-input").value.trim();

    if (!searchText) {
        filterIssues(currentStatus);
        return;
    }

    loadingSpinner.classList.remove("hidden");
    issueContainer.innerHTML = "";

    fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`)
        .then(res => res.json())
        .then(data => {
            let searchResult = data.data;

            if (currentStatus !== "all") {
                searchResult = searchResult.filter(issue => issue.status === currentStatus);
            }

            showIssues(searchResult);
            loadingSpinner.classList.add("hidden");
        })
        .catch(error => {
            console.log(error);
            loadingSpinner.classList.add("hidden");
        });
});

loadIssues();