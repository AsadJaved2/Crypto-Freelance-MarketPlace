import React from 'react';

const JobCard = ({ job, account, contract, loadJobs, onApply, onComplete, onApprove }) => {
    const isBuyer = account === job.buyer; // Check if the current account is the buyer
    const isSeller = account === job.freelancer; // Check if the current account is the freelancer

    const handleApply = () => {
        onApply(job.id);
    };

    const handleComplete = () => {
        onComplete(job.id);
    };

    const handleApprove = () => {
        onApprove(job.id);
    };

    return (
        <div className="job-card">
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <p>Payment: {Web3.utils.fromWei(job.payment.toString(), 'ether')} ETH</p>

            {isBuyer && !job.completed && (
                <button onClick={handleApprove}>Approve Job</button>
            )}

            {isSeller && !job.completed && (
                <button onClick={handleComplete}>Complete Job</button>
            )}

            {job.applied && !job.completed && isSeller && (
                <p>You have applied for this job.</p>
            )}

            {!job.applied && !job.completed && isSeller && (
                <button onClick={handleApply}>Apply for Job</button>
            )}
        </div>
    );
};

export default JobCard;
