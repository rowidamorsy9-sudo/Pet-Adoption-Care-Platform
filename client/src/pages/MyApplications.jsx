import React, { useState } from "react";
import "./MyApplications.css";

function MyApplications() {
    const [email, setEmail] = useState("");
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchApplications = async () => {
        setMessage("");

        if (email.trim() === "") {
            setApplications([]);
            setMessage("Please enter your email first to view your applications.");
            return;
        }

        setLoading(true);

        try {
            const url = `http://localhost:4000/api/applications/my-applications?email=${email.trim()}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setApplications(data);

                if (data.length === 0) {
                    setMessage("No applications found for this email.");
                }
            } else {
                setMessage(data.message || "Something went wrong");
            }
        } catch (error) {
            setMessage("Cannot connect to server");
        }

        setLoading(false);
    };

    const pendingCount = applications.filter((app) => app.status === "pending").length;
    const approvedCount = applications.filter((app) => app.status === "approved").length;
    const rejectedCount = applications.filter((app) => app.status === "rejected").length;

    return (
        <div className="applications-page">
            <h1>My Applications</h1>

            <p className="applications-subtitle">
                Please enter the same email you used in the adoption form to view your applications.
            </p>

            <div className="applications-search">
                <input
                    type="email"
                    placeholder="Write your email first"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button onClick={fetchApplications} disabled={loading}>
                    {loading ? "Loading..." : "View Applications"}
                </button>
            </div>

            {message && <h3 className="applications-message">{message}</h3>}

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total</h3>
                    <p>{applications.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Pending</h3>
                    <p>{pendingCount}</p>
                </div>

                <div className="stat-card">
                    <h3>Approved</h3>
                    <p>{approvedCount}</p>
                </div>

                <div className="stat-card">
                    <h3>Rejected</h3>
                    <p>{rejectedCount}</p>
                </div>
            </div>

            <div className="applications-list">
                {applications.map((application) => (
                    <div className="application-card" key={application._id}>
                        {application.petImage && (
                            <img src={application.petImage} alt={application.petName} />
                        )}

                        <div>
                            <h2>{application.petName}</h2>

                            <p>
                                <strong>Name:</strong> {application.userName}
                            </p>

                            <p>
                                <strong>Email:</strong> {application.userEmail}
                            </p>

                            <p>
                                <strong>Phone:</strong> {application.phone}
                            </p>

                            <p>
                                <strong>Address:</strong> {application.address}
                            </p>

                            <p>
                                <strong>Reason:</strong> {application.reason}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                <span className={`status ${application.status}`}>
                                    {application.status}
                                </span>
                            </p>

                            <p>
                                <strong>Submitted:</strong>{" "}
                                {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyApplications;