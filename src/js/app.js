// // import abi from '../../build/contracts/FreelanceMarketplace.json'
// // const contractABI =abi.abi;
// // const contractAddress = '0x694c4E3B980110993b8D085f2acac0062412C3C2';

// // let web3;
// // let freelanceContract;

// // window.addEventListener('load', async () => {
// //     if (window.ethereum) {
// //         web3 = new Web3(window.ethereum);
// //         await ethereum.request({ method: 'eth_requestAccounts' });
// //     } else {
// //         console.log('Please install MetaMask');
// //         return;
// //     }

// //     freelanceContract = new web3.eth.Contract(contractABI, contractAddress);

// //     document.getElementById('createJobBtn').addEventListener('click', createJob);

// //     loadJobs();
// // });

// // async function createJob() {
// //     const accounts = await web3.eth.getAccounts();
// //     await freelanceContract.methods.createJob('Web Development', 'Build a website', web3.utils.toWei('0.1', 'ether'))
// //         .send({ from: accounts[0] });
// //     loadJobs();
// // }

// // async function loadJobs() {
// //     const jobs = await freelanceContract.methods.getJobs().call();
// //     const jobList = document.getElementById('jobList');
// //     jobList.innerHTML = '';

// //     jobs.forEach((job, index) => {
// //         const li = document.createElement('li');
// //         li.innerText = `${job.title} - ${web3.utils.fromWei(job.payment, 'ether')} ETH`;
// //         jobList.appendChild(li);
// //     });
// // }


// import React, { useState, useEffect } from 'react';
// import Web3 from 'web3';
// import JobCard from './components/JobCard';
// import './styles.css';
// import FreelanceMarketplace from './contracts/FreelanceMarketplace.json'; // Add your contract's ABI here

// const App = () => {
//     const [account, setAccount] = useState('');
//     const [contract, setContract] = useState(null);
//     const [jobs, setJobs] = useState([]);
//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [payment, setPayment] = useState('');

//     useEffect(() => {
//         const initWeb3 = async () => {
//             if (window.ethereum) {
//                 const web3 = new Web3(window.ethereum);
//                 await window.ethereum.request({ method: 'eth_requestAccounts' });
//                 const accounts = await web3.eth.getAccounts();
//                 setAccount(accounts[0]);

//                 const networkId = await web3.eth.net.getId();
//                 const deployedNetwork = FreelanceMarketplace.networks[networkId];
//                 const instance = new web3.eth.Contract(
//                     FreelanceMarketplace.abi,
//                     deployedNetwork && deployedNetwork.address,
//                 );
//                 setContract(instance);
//                 loadJobs(instance);
//             } else {
//                 alert('Please install MetaMask!');
//             }
//         };

//         initWeb3();
//     }, []);

//     const loadJobs = async (contract) => {
//         const jobCount = await contract.methods.jobCount().call();
//         const jobsArray = [];
//         for (let i = 1; i <= jobCount; i++) {
//             const job = await contract.methods.jobs(i).call();
//             jobsArray.push(job);
//         }
//         setJobs(jobsArray);
//     };

//     const createJob = async () => {
//         await contract.methods.createJob(title, description).send({ from: account, value: Web3.utils.toWei(payment, 'ether') });
//         loadJobs(contract);
//         setTitle('');
//         setDescription('');
//         setPayment('');
//     };

//     const applyForJob = async (jobId) => {
//         await contract.methods.applyForJob(jobId).send({ from: account });
//         loadJobs(contract);
//     };

//     return (
//         <div className="container">
//             <h1>Freelance Marketplace</h1>
//             <input
//                 type="text"
//                 placeholder="Job Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//             />
//             <input
//                 type="text"
//                 placeholder="Job Description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//             />
//             <input
//                 type="number"
//                 placeholder="Payment (ETH)"
//                 value={payment}
//                 onChange={(e) => setPayment(e.target.value)}
//             />
//             <button onClick={createJob}>Create Job</button>
//             <div className="job-list">
//                 {jobs.map((job, index) => (
//                     <JobCard key={index} job={{ ...job, id: index + 1 }} onApply={applyForJob} />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default App;



import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import JobCard from './components/JobCard'; // Assuming you have a JobCard component
import './styles.css';
import FreelanceMarketplace from './contracts/FreelanceMarketplace.json';

const App = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [payment, setPayment] = useState('');

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
        const jobCount = await contract.methods.jobCount().call();
        const jobsArray = [];
        for (let i = 0; i < jobCount; i++) {
            const job = await contract.methods.jobs(i).call();
            jobsArray.push({ ...job, id: i });
        }
        setJobs(jobsArray);
    };

    const createJob = async () => {
        await contract.methods.createJob(title, description, Web3.utils.toWei(payment, 'ether')).send({ from: account });
        loadJobs(contract);
        setTitle('');
        setDescription('');
        setPayment('');
    };

    const applyForJob = async (jobId) => {
        await contract.methods.applyForJob(jobId).send({ from: account });
        loadJobs(contract);
    };

    const completeJob = async (jobId) => {
        await contract.methods.completeJob(jobId).send({ from: account });
        loadJobs(contract);
    };

    return (
        <div className="container">
            <h1>Freelance Marketplace</h1>
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

            <div className="job-list">
                {jobs.map((job, index) => (
                    <JobCard key={index} job={{ ...job, id: index + 1 }} />
                ))}
            </div>
        </div>
    );
};

const JobCard = ({ job, applyForJob, completeJob }) => {
    return (
        <div className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p>{Web3.utils.fromWei(job.payment, 'ether')} ETH</p>
            {job.freelancer === '0x0000000000000000000000000000000000000000' ? (
                <button onClick={() => applyForJob(job.id)}>Apply for Job</button>
            ) : job.freelancer === account ? (
                <button onClick={() => completeJob(job.id)} disabled={job.isComplete}>
                    {job.isComplete ? 'Job Completed' : 'Complete Job'}
                </button>
            ) : (
                <p>Assigned to: {job.freelancer}</p>
            )}
        </div>
    );
};

export default App;
