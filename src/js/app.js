import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import JobCard from './JobCard.js'; 
import FreelanceMarketplace from './contracts/FreelanceMarketplace.json';

const App = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [payment, setPayment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // State for error messages

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();
                const deployedNetwork = FreelanceMarketplace.networks[networkId];
                const instance = new web3.eth.Contract(
                    FreelanceMarketplace.abi,
                    deployedNetwork && deployedNetwork.address,
                );
                setContract(instance);
                loadJobs(instance);
            } else {
                alert('Please install MetaMask!');
            }
        };

        initWeb3();
    }, []);

    const loadJobs = async (contract) => {
        setLoading(true); 
        try {
            const jobCount = await contract.methods.jobCount().call();
            const jobsArray = [];
            for (let i = 0; i < jobCount; i++) {
                const job = await contract.methods.jobs(i).call();
                jobsArray.push({ ...job, id: i });
            }
            setJobs(jobsArray);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false); 
        }
    };

    const createJob = async () => {
        if (!title || !description || !payment || parseFloat(payment) <= 0) {
            alert("Please fill out all fields and ensure payment is greater than 0");
            return;
        }

        try {
            await contract.methods.createJob(title, description).send({ from: account, value: Web3.utils.toWei(payment, 'ether') });
            loadJobs(contract);
            setTitle('');
            setDescription('');
            setPayment('');
        } catch (error) {
            console.error('Error creating job:', error);
            setError('Error creating job. Please try again.'); // Set error message
        }
    };

    const applyForJob = async (jobId) => {
        try {
            await contract.methods.applyForJob(jobId).send({ from: account });
            loadJobs(contract);
        } catch (error) {
            console.error('Error applying for job:', error);
            setError('Error applying for job. Please try again.');
        }
    };

    const completeJob = async (jobId) => {
        try {
            await contract.methods.completeJob(jobId).send({ from: account });
            loadJobs(contract);
        } catch (error) {
            console.error('Error completing job:', error);
            setError('Error completing job. Please try again.');
        }
    };

    const approveJob = async (jobId) => {
        try {
            await contract.methods.approveJob(jobId).send({ from: account });
            loadJobs(contract);
        } catch (error) {
            console.error('Error approving job:', error);
            setError('Error approving job. Please try again.');
        }
    };

    return (
        <div className="container">
            <h1>Freelance Marketplace</h1>
            {error && <p className="error">{error}</p>}
            {/* Job creation form */}
            <div className="job-list">
                {loading ? (
                    <p>Loading jobs...</p>
                ) : (
                    jobs.map((job) => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            account={account} 
                            contract={contract} 
                            loadJobs={loadJobs} 
                            onApply={applyForJob} 
                            onComplete={completeJob} 
                            onApprove={approveJob}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default App;
