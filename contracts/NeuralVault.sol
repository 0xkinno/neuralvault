// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NeuralVault is Ownable, ReentrancyGuard {

    struct Agent {
        string  name;
        string  agentType;
        string  metadataHash;
        address wallet;
        uint256 reputation;
        uint256 tasksCompleted;
        uint256 totalEarned;
        uint256 registeredAt;
        bool    active;
    }

    mapping(address => Agent)   public agents;
    mapping(address => bool)    public isRegistered;
    address[]                   public agentList;
    uint256                     public totalAgents;

    struct MemoryEntry {
        string  rootHash;
        string  memoryType;
        string  description;
        uint256 timestamp;
        uint256 size;
    }

    mapping(address => MemoryEntry[]) public agentMemories;
    mapping(address => uint256)       public memoryCount;
    uint256                           public totalMemoryEntries;

    enum TaskStatus { Open, Claimed, Completed, Cancelled }

    struct Task {
        uint256    id;
        address    poster;
        address    assignee;
        string     title;
        string     description;
        string     resultHash;
        uint256    reward;
        TaskStatus status;
        uint256    createdAt;
        uint256    completedAt;
    }

    mapping(uint256 => Task) public tasks;
    uint256                  public taskCount;
    uint256                  public totalRewardsDistributed;

    event AgentRegistered(address indexed agent, string name, string agentType, uint256 timestamp);
    event AgentUpdated(address indexed agent, string metadataHash);
    event AgentDeleted(address indexed agent, uint256 timestamp);
    event AgentReactivated(address indexed agent, uint256 timestamp);
    event MemoryStored(address indexed agent, string rootHash, string memoryType, uint256 timestamp);
    event TaskPosted(uint256 indexed taskId, address indexed poster, uint256 reward, uint256 timestamp);
    event TaskClaimed(uint256 indexed taskId, address indexed assignee, uint256 timestamp);
    event TaskCompleted(uint256 indexed taskId, address indexed assignee, string resultHash, uint256 reward, uint256 timestamp);
    event TaskCancelled(uint256 indexed taskId, uint256 timestamp);
    event ReputationUpdated(address indexed agent, uint256 newScore);
    event PaymentSent(address indexed from, address indexed to, uint256 amount, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function registerAgent(
        string calldata name,
        string calldata agentType,
        string calldata metadataHash
    ) external {
        require(!isRegistered[msg.sender], "NeuralVault: already registered");
        require(bytes(name).length > 0, "NeuralVault: name required");

        agents[msg.sender] = Agent({
            name:           name,
            agentType:      agentType,
            metadataHash:   metadataHash,
            wallet:         msg.sender,
            reputation:     100,
            tasksCompleted: 0,
            totalEarned:    0,
            registeredAt:   block.timestamp,
            active:         true
        });

        isRegistered[msg.sender] = true;
        agentList.push(msg.sender);
        totalAgents++;

        emit AgentRegistered(msg.sender, name, agentType, block.timestamp);
    }

    function updateAgent(string calldata metadataHash) external {
        require(isRegistered[msg.sender], "NeuralVault: not registered");
        agents[msg.sender].metadataHash = metadataHash;
        emit AgentUpdated(msg.sender, metadataHash);
    }

    function deleteAgent() external {
        require(isRegistered[msg.sender], "NeuralVault: not registered");

        delete agents[msg.sender];
        isRegistered[msg.sender] = false;

        for (uint256 i = 0; i < agentList.length; i++) {
            if (agentList[i] == msg.sender) {
                agentList[i] = agentList[agentList.length - 1];
                agentList.pop();
                break;
            }
        }

        if (totalAgents > 0) totalAgents--;
        emit AgentDeleted(msg.sender, block.timestamp);
    }

    function reactivateAgent() external {
        require(isRegistered[msg.sender], "NeuralVault: not registered");
        require(!agents[msg.sender].active, "NeuralVault: already active");
        agents[msg.sender].active = true;
        emit AgentReactivated(msg.sender, block.timestamp);
    }

    function deactivateAgent() external {
        require(isRegistered[msg.sender], "NeuralVault: not registered");
        agents[msg.sender].active = false;
    }

    function storeMemory(
        string calldata rootHash,
        string calldata memoryType,
        string calldata description,
        uint256 size
    ) external {
        require(isRegistered[msg.sender], "NeuralVault: not registered");
        require(bytes(rootHash).length > 0, "NeuralVault: hash required");

        agentMemories[msg.sender].push(MemoryEntry({
            rootHash:    rootHash,
            memoryType:  memoryType,
            description: description,
            timestamp:   block.timestamp,
            size:        size
        }));

        memoryCount[msg.sender]++;
        totalMemoryEntries++;

        emit MemoryStored(msg.sender, rootHash, memoryType, block.timestamp);
    }

    function getMemories(address agent) external view returns (MemoryEntry[] memory) {
        return agentMemories[agent];
    }

    function postTask(string calldata title, string calldata description) external payable {
        require(isRegistered[msg.sender], "NeuralVault: not registered");
        require(msg.value > 0, "NeuralVault: reward required");
        require(bytes(title).length > 0, "NeuralVault: title required");

        taskCount++;
        tasks[taskCount] = Task({
            id:          taskCount,
            poster:      msg.sender,
            assignee:    address(0),
            title:       title,
            description: description,
            resultHash:  "",
            reward:      msg.value,
            status:      TaskStatus.Open,
            createdAt:   block.timestamp,
            completedAt: 0
        });

        emit TaskPosted(taskCount, msg.sender, msg.value, block.timestamp);
    }

    function claimTask(uint256 taskId) external {
        require(isRegistered[msg.sender], "NeuralVault: not registered");
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Open, "NeuralVault: not open");
        require(task.poster != msg.sender, "NeuralVault: cannot claim own task");

        task.assignee = msg.sender;
        task.status   = TaskStatus.Claimed;

        emit TaskClaimed(taskId, msg.sender, block.timestamp);
    }

    function completeTask(uint256 taskId, string calldata resultHash) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.assignee == msg.sender, "NeuralVault: not assignee");
        require(task.status == TaskStatus.Claimed, "NeuralVault: not claimed");

        task.status      = TaskStatus.Completed;
        task.resultHash  = resultHash;
        task.completedAt = block.timestamp;

        agents[msg.sender].tasksCompleted++;
        agents[msg.sender].totalEarned    += task.reward;
        agents[msg.sender].reputation     += 10;
        totalRewardsDistributed           += task.reward;

        (bool sent, ) = payable(msg.sender).call{value: task.reward}("");
        require(sent, "NeuralVault: payment failed");

        emit TaskCompleted(taskId, msg.sender, resultHash, task.reward, block.timestamp);
        emit ReputationUpdated(msg.sender, agents[msg.sender].reputation);
    }

    function cancelTask(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.poster == msg.sender, "NeuralVault: not poster");
        require(task.status == TaskStatus.Open, "NeuralVault: not open");

        task.status = TaskStatus.Cancelled;

        (bool sent, ) = payable(msg.sender).call{value: task.reward}("");
        require(sent, "NeuralVault: refund failed");

        emit TaskCancelled(taskId, block.timestamp);
    }

    function payAgent(address payable recipient) external payable nonReentrant {
        require(isRegistered[recipient], "NeuralVault: recipient not registered");
        require(msg.value > 0, "NeuralVault: amount required");
        require(recipient != msg.sender, "NeuralVault: cannot pay yourself");

        agents[recipient].totalEarned += msg.value;

        (bool sent, ) = recipient.call{value: msg.value}("");
        require(sent, "NeuralVault: payment failed");

        emit PaymentSent(msg.sender, recipient, msg.value, block.timestamp);
    }

    function boostReputation(address agent, uint256 points) external onlyOwner {
        require(isRegistered[agent], "NeuralVault: not registered");
        agents[agent].reputation += points;
        emit ReputationUpdated(agent, agents[agent].reputation);
    }

    function getAgent(address wallet) external view returns (Agent memory) {
        return agents[wallet];
    }

    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }

    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function getVaultStats() external view returns (
        uint256 _totalAgents,
        uint256 _taskCount,
        uint256 _totalMemoryEntries,
        uint256 _totalRewardsDistributed
    ) {
        return (totalAgents, taskCount, totalMemoryEntries, totalRewardsDistributed);
    }

    function getAgentTasks(address agent) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](taskCount);
        uint256 count = 0;
        for (uint256 i = 1; i <= taskCount; i++) {
            if (tasks[i].poster == agent || tasks[i].assignee == agent) {
                result[count] = i;
                count++;
            }
        }
        uint256[] memory trimmed = new uint256[](count);
        for (uint256 i = 0; i < count; i++) { trimmed[i] = result[i]; }
        return trimmed;
    }

    receive() external payable {}
}