// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FreelanceMarketplace {
    struct Job {
        string title;
        string description;
        uint256 payment;
        address payable freelancer;
        bool isComplete;
    }

    Job[] public jobs;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    event JobCreated(uint256 jobId, string title, uint256 payment);
    event JobCompleted(uint256 jobId, address freelancer);

event JobApplied(uint256 jobId, address freelancer);
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createJob(string memory _title, string memory _description, uint256 _payment) public onlyOwner {
        Job memory newJob = Job({
            title: _title,
            description: _description,
            payment: _payment,
            freelancer: payable(address(0)),
            isComplete: false
        });

        jobs.push(newJob);
        emit JobCreated(jobs.length - 1, _title, _payment);
    }

     function applyForJob(uint256 _jobId) public payable {

    Job storage job = jobs[_jobId];

   // require(job.isActive, "Job is not active");
    require(job.freelancer == address(0), "Job already taken"); // Check if job is taken
    require(msg.value == job.payment, "Incorrect payment amount"); // Check payment

    job.freelancer = payable(msg.sender); // Assign freelancer
    emit JobApplied(_jobId, msg.sender); // Emit event
}


    function completeJob(uint256 _jobId) public {
        Job storage job = jobs[_jobId];
        require(job.freelancer == msg.sender, "Only assigned freelancer can complete this job");
        require(!job.isComplete, "Job already completed");

        job.isComplete = true;
        job.freelancer.transfer(job.payment);
        emit JobCompleted(_jobId, msg.sender);
    }

    function jobCount() public view returns (uint256) {
        return jobs.length;
    }

    function getJob(uint256 _jobId) public view returns (string memory, string memory, uint256, address, bool) {
        Job memory job = jobs[_jobId];
        return (job.title, job.description, job.payment, job.freelancer, job.isComplete);
    }
}
