document.addEventListener('DOMContentLoaded', function() {
    const submitCompletedJobBtn = document.getElementById('submitCompletedJobBtn');
    const submitQueuedJobBtn = document.getElementById('submitQueuedJobBtn');
    const submitRejectedJobBtn = document.getElementById('submitRejectedJobBtn');
    const jobTableBody = document.getElementById('jobTableBody');
    const loadingMessage = document.getElementById('loading');
    const ctx = document.getElementById('jobStatusChart').getContext('2d');
    let jobStatusChart;

    // Function to fetch all jobs from the backend
    async function fetchJobs() {
        try {
            const response = await fetch('/get_jobs');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jobs = await response.json();
            updateDashboard(jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            // Optional: Display an error message to the user
            jobTableBody.innerHTML = '<tr><td colspan="6">Failed to load job data. Please ensure the backend server is running.</td></tr>';
        }
    }

    // Function to update the HTML table and chart with job data
    function updateDashboard(jobs) {
        // --- Update the table ---
        jobTableBody.innerHTML = '';
        if (jobs.length === 0) {
            jobTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No jobs submitted yet.</td></tr>';
        } else {
            jobs.forEach(job => {
                const row = jobTableBody.insertRow();
                row.innerHTML = `
                    <td>${job.job_id}</td>
                    <td class="status-${job.status.toLowerCase()}">${job.status}</td>
                    <td>${job.backend}</td>
                    <td>${job.qubits}</td>
                    <td>${job.shots}</td>
                    <td>${job.submission_time}</td>
                `;
            });
        }

        // --- Update the pie chart ---
        const statusCounts = jobs.reduce((counts, job) => {
            counts[job.status] = (counts[job.status] || 0) + 1;
            return counts;
        }, {});
        
        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);
        
        const statusColors = {
            'Completed': '#4caf50',
            'Queued': '#ffc107',
            'Rejected': '#f44336'
        };
        const colors = labels.map(label => statusColors[label] || '#9e9e9e');

        if (jobStatusChart) {
            jobStatusChart.data.labels = labels;
            jobStatusChart.data.datasets[0].data = data;
            jobStatusChart.data.datasets[0].backgroundColor = colors;
            jobStatusChart.update();
        } else {
            jobStatusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    // Function to submit a new job to the backend
    async function submitJob(endpoint) {
        loadingMessage.classList.remove('hidden');
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to submit job');
            }
            // Wait a moment to simulate job processing before fetching
            setTimeout(fetchJobs, 1000); 
        } catch (error) {
            console.error('Error submitting job:', error);
            alert('Failed to submit job. Please check the server connection.');
        } finally {
            loadingMessage.classList.add('hidden');
        }
    }

    // Event listeners for the buttons
    submitCompletedJobBtn.addEventListener('click', () => submitJob('/submit_job'));
    submitQueuedJobBtn.addEventListener('click', () => submitJob('/submit_queued_job'));
    submitRejectedJobBtn.addEventListener('click', () => submitJob('/submit_rejected_job'));

    // Initial fetch to populate the dashboard on page load
    fetchJobs();
});
