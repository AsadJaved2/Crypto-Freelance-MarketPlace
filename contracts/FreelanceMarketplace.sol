// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FreelanceMarketplace {
    struct Job {
        string title;
        string description;
        uint256 payment;
        address payable freelancer;
        address payable creator;
        bool isComplete;
        bool isApproved;
        bool isActive; // Track if the job is still active
    }

    Job[] public jobs;
    address public owner;
    mapping(uint256 => uint256) public escrowBalances; // Track escrow balances for each job
    mapping(uint256 => mapping(address => bool)) public jobApplications; // Track job applications

    constructor() {
        owner = msg.sender;
    }

    event JobCreated(uint256 jobId, string title, uint256 payment);
    event JobApplied(uint256 jobId, address freelancer);
    event JobCompleted(uint256 jobId, address freelancer);
    event JobApproved(uint256 jobId, address creator);
    event JobCancelled(uint256 jobId, address creator, uint256 refundedAmount); // New event for job cancellation

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyCreator(uint256 _jobId) {
        require(msg.sender == jobs[_jobId].creator, "Only the job creator can call this function");
        _;
    }

    modifier onlyFreelancer(uint256 _jobId) {
        require(msg.sender == jobs[_jobId].freelancer, "Only assigned freelancer can call this function");
        _;
    }

    function createJob(string memory _title, string memory _description) public payable {
        require(msg.value > 0, "Payment must be greater than 0");
        
        Job memory newJob = Job({
            title: _title,
            description: _description,
            payment: msg.value,
            freelancer: payable(address(0)),
            creator: payable(msg.sender),
            isComplete: false,
            isApproved: false,
            isActive: true
        });

        jobs.push(newJob);
        uint256 jobId = jobs.length - 1;
        escrowBalances[jobId] = msg.value; // Store payment in escrow
        
        emit JobCreated(jobId, _title, msg.value);
    }

    function applyForJob(uint256 _jobId) public {
        Job storage job = jobs[_jobId];
        
        require(job.isActive, "Job is no longer active");
        require(job.freelancer == address(0), "Job already taken");
        require(msg.sender != job.creator, "Creator cannot apply for their own job");
        require(!jobApplications[_jobId][msg.sender], "Already applied for this job");

        job.freelancer = payable(msg.sender); // Assign freelancer to the job
        jobApplications[_jobId][msg.sender] = true; // Mark as applied
        emit JobApplied(_jobId, msg.sender);
    }

    function completeJob(uint256 _jobId) public onlyFreelancer(_jobId) {
        Job storage job = jobs[_jobId];
        require(!job.isComplete, "Job already completed");

        job.isComplete = true;
        emit JobCompleted(_jobId, msg.sender);
    }

    function approveJob(uint256 _jobId) public onlyCreator(_jobId) {
        Job storage job = jobs[_jobId];

        job.isApproved = true;
        uint256 payment = escrowBalances[_jobId];
        escrowBalances[_jobId] = 0;
        job.freelancer.transfer(payment); // Transfer payment from escrow to freelancer
        emit JobApproved(_jobId, msg.sender);
    }

    function cancelJob(uint256 _jobId) public onlyCreator(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.isActive, "Job is not active");
        require(job.freelancer == address(0), "Cannot cancel job with assigned freelancer");

        job.isActive = false;
        uint256 payment = escrowBalances[_jobId];
        escrowBalances[_jobId] = 0;
        payable(msg.sender).transfer(payment); // Return payment from escrow to creator
        emit JobCancelled(_jobId, msg.sender, payment); // Emit cancellation event
    }

    function jobCount() public view returns (uint256) {
        return jobs.length;
    }

    function getJob(uint256 _jobId) public view returns (Job memory) {
    require(_jobId < jobs.length, "Job ID does not exist"); // Ensure job ID is valid
    return jobs[_jobId]; // Return the existing job directly
}
    function getAppliedJobs() public view returns (uint256[] memory) {
        uint256 appliedJobCount = 0;
        uint256 totalJobs = jobs.length;

        for (uint256 i = 0; i < totalJobs; i++) {
            if (jobs[i].freelancer == msg.sender) {
                appliedJobCount++;
            }
        }

        uint256[] memory appliedJobIDs = new uint256[](appliedJobCount);
        uint256 index = 0;

        for (uint256 i = 0; i < totalJobs; i++) {
            if (jobs[i].freelancer == msg.sender) {
                appliedJobIDs[index] = i;
                index++;
            }
        }

        return appliedJobIDs;
    }
}
