// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public admin;
    uint256 public totalVotes;

    constructor() public {
        // Initilizing default values
        admin = msg.sender;
    }

    function getAdmin() public view returns (address) {
        // Returns account address used to deploy contract (i.e. admin)
        return admin;
    }

    struct Candidate {
        uint256 candidateId;
        string name;
        uint256 voteCount;
    }
    mapping(uint256 => Candidate) public candidateDetails;
    uint256 public candidatesCount;

    function addCandidate(string[] memory candidateNames) public {
        for (uint256 i = 0; i < candidateNames.length; i++) {
            candidatesCount++;
            candidateDetails[candidatesCount] = Candidate(
                candidatesCount,
                candidateNames[i],
                0
            );
        }
    }

    struct ElectionDetails {
        string adminID;
        string electionTitle;
    }
    ElectionDetails electionDetails;

    function setElectionDetails(
        string memory _adminID,
        string memory _electionTitle
    ) public {
        electionDetails = ElectionDetails(_adminID, _electionTitle);
    }

    // Get Elections details
    function getElectionDetails()
        public
        view
        returns (string memory adminID, string memory electionTitle)
    {
        return (electionDetails.adminID, electionDetails.electionTitle);
    }

    struct Voter {
        uint256 voterID;
        bool hasVoted;
    }
    mapping(uint256 => Voter) public voterDetails;
    uint256 public votersCount;

    function addVoters(uint256[] memory voterIDs) public {
        for (uint256 i = 0; i < voterIDs.length; i++) {
            votersCount++;
            voterDetails[voterIDs[i]] = Voter(voterIDs[i], false);
        }
    }

    function vote(uint256 candidateID, uint256 voterID) public {
        require(voterDetails[voterID].hasVoted == false);
        candidateDetails[candidateID].voteCount += 1;
        voterDetails[voterID].hasVoted = true;
        totalVotes += 1;
    }
}
