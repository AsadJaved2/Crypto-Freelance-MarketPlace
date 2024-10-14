import React from 'react';
import Web3 from 'web3';

const JobCard = ({ job, account, contract, loadJobs }) => {
    const applyForJob = async (jobId) => {
        try {
            await contract.methods.applyForJob(jobId).send({ from: account });
            loadJobs(contract); 
        } catch (error) {
            console.error("Error applying for job:", error);
        }
    };

    const completeJob = async (jobId) => {
        try {
            await contract.methods.completeJob(jobId).send({ from: account });
            loadJobs(contract);
        } catch (error) {
            console.error("Error completing job:", error);
        }
    };

    return (
        <div className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p>{Web3.utils.fromWei(job.payment, 'ether')} ETH</p>
            {job.isActive ? (
                job.freelancer === '0x0000000000000000000000000000000000000000' ? (
                    <button onClick={() => applyForJob(job.id)}>Apply for Job</button>
                ) : job.freelancer.toLowerCase() === account.toLowerCase() ? (
                    <button onClick={() => completeJob(job.id)} disabled={job.isComplete}>
                        {job.isComplete ? 'Job Completed' : 'Complete Job'}
                    </button>
                ) : (
                    <p>Assigned to: {job.freelancer}</p>
                )
            ) : (
                <p>This job is no longer active.</p>
            )}
        </div>
    );
};

export default JobCard;
