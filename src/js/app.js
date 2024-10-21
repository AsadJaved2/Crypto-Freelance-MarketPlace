import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import JobCard from './JobCard.js';
import FreelanceMarketplace from './contracts/FreelanceMarketplace.json';
import './App.css'; // Optional: Custom CSS for additional styling

const App = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [payment, setPayment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 

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
            setError('Error loading jobs. Please refresh the page.'); // Set error message
        } finally {
            setLoading(false); 
        }
    };

    const loadCreatedJobs = async (contract) => {
        setLoading(true); 
        try {
            const jobCount = await contract.methods.jobCount().call();
            const jobsArray = [];
            for (let i = 0; i < jobCount; i++) {
                const job = await contract.methods.jobs(i).call();
                console.log(job);
                jobsArray.push({ ...job, id: i });
            }
            setJobs(jobsArray);
        } catch (error) {
            console.error('Error loading jobs:', error);
            setError('Error loading jobs. Please refresh the page.'); // Set error message
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
            setError(''); // Clear any existing errors
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

    if (loading) {
        return <div className="text-center">Loading...</div>; 
    }

    return (
        <div className="container">
            <h1>Freelance Marketplace</h1>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job Title"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job Description"
            />
            <input
                type="text"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                placeholder="Payment (in ETH)"
            />
            <button onClick={createJob}>Create Job</button>

            <h2>Available Jobs</h2>
            {jobs.length > 0 ? (
                jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        account={account}
                        applyForJob={applyForJob}
                        completeJob={completeJob}
                        approveJob={approveJob}
                    />
                ))
            ) : (
                <div>No available jobs at the moment.</div>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default App;
