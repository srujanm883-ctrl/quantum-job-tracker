from flask import Flask, render_template, jsonify, request
import datetime
import random

# Initialize the Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')

# A list to simulate our database of quantum jobs
jobs_db = []

def generate_job_id():
    """Generates a unique, random job ID."""
    return f"job-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"

def generate_job(status):
    """Generates a new simulated quantum job with a given status."""
    backends = ['ibm_brisbane', 'ibm_kyoto', 'ibm_osaka']
    job = {
        'job_id': generate_job_id(),
        'status': status,
        'backend': random.choice(backends),
        'qubits': random.randint(5, 127),
        'shots': random.choice([1024, 2048, 4096, 8192]),
        'submission_time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    jobs_db.append(job)
    # Sort the jobs by submission time in descending order to show recent jobs first
    jobs_db.sort(key=lambda x: datetime.datetime.strptime(x['submission_time'], '%Y-%m-%d %H:%M:%S'), reverse=True)
    return job

@app.route('/')
def index():
    """Renders the main dashboard page."""
    return render_template('dashboard.html')

@app.route('/get_jobs')
def get_jobs():
    """Returns the list of all jobs as JSON."""
    return jsonify(jobs_db)

@app.route('/get_job_counts')
def get_job_counts():
    """Returns the count of completed, queued, and rejected jobs."""
    counts = {
        'completed': sum(1 for job in jobs_db if job['status'] == 'Completed'),
        'queued': sum(1 for job in jobs_db if job['status'] == 'Queued'),
        'rejected': sum(1 for job in jobs_db if job['status'] == 'Rejected'),
    }
    return jsonify(counts)

@app.route('/get_recent_jobs')
def get_recent_jobs():
    """Returns the list of the most recent jobs."""
    # Return the last 5 jobs from the sorted list
    return jsonify(jobs_db[:5])

@app.route('/submit_job', methods=['POST'])
def submit_completed_job():
    """Endpoint to submit a new completed job (simulation)."""
    new_job = generate_job("Completed")
    return jsonify({"message": "Job submitted successfully!", "job": new_job})

@app.route('/submit_queued_job', methods=['POST'])
def submit_queued_job():
    """Endpoint to submit a new queued job (simulation)."""
    new_job = generate_job("Queued")
    return jsonify({"message": "Job submitted successfully!", "job": new_job})

@app.route('/submit_rejected_job', methods=['POST'])
def submit_rejected_job():
    """Endpoint to submit a new rejected job (simulation)."""
    new_job = generate_job("Rejected")
    return jsonify({"message": "Job submitted successfully!", "job": new_job})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
