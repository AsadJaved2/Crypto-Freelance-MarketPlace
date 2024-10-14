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
            await contract.methods.createJob(title, description, Web3.utils.toWei(payment, 'ether')).send({ from: account });
            loadJobs(contract);
            setTitle('');
            setDescription('');
            setPayment('');
        } catch (error) {
            console.error('Error creating job:', error);
            setError('Error creating job. Please try again.'); // Set error message
        }
    };

    return (
        <div className="container">
            <h1>Freelance Marketplace</h1>
            {error && <p className="error">{error}</p>} {/* Display error messages */}
            <div className="job-creation-form">
                <input
                    type="text"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Job Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Payment (ETH)"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                />
                <button onClick={createJob}>Create Job</button>
            </div>

            <div className="job-list">
                {loading ? (
                    <p>Loading jobs...</p>
                ) : (
                    jobs.map((job, index) => (
                        <JobCard key={index} job={job} account={account} contract={contract} loadJobs={loadJobs} />
                    ))
                )}
            </div>
        </div>
    );
};

export default App;
