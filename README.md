# SmartVote
Biometric-Backed Voting on the Blockchain

## **Abstract**

Traditional voting systems suffer from several challenges, including voter impersonation, ballot tampering, multiple voting, and lack of transparency, which compromise electoral integrity. To address these issues, this paper proposes a Blockchain-Based Biometric Voting System that integrates fingerprint authentication with blockchain technology to enhance the security, transparency, and reliability of elections. Biometric authentication ensures that only registered voters and administrators can access the system, eliminating impersonation and fraudulent voting. The R307 fingerprint module is used for real-time voter authentication, preventing unauthorized access. Once verified, votes are recorded on a blockchain ledger, ensuring data immutability and decentralization. Unlike conventional databases, blockchain technology eliminates single points of failure, preventing vote manipulation and unauthorized modifications. The system also incorporates a web-based interface that allows voters to register, authenticate, and securely cast their votes, while administrators can manage the election process with full transparency. Blockchain’s decentralized nature ensures that all transactions, including candidate registration, vote counting, and election results, are securely stored and verifiable, preventing tampering and external interference. Initial testing demonstrates high accuracy in biometric verification and efficient blockchain-based vote storage, making the system scalable for local, state, and national elections. By integrating biometric security with blockchain's trustless nature, this system provides a fraud-resistant, transparent, and tamper-proof voting solution, fostering greater public confidence in electoral processes.

## **Steps to run this project**

### **Step 1: Installing the necessary dependencies**

`npm install` <br>
`npm i react react-router-dom react-icons axios` // _for frontend_ <br>
`npm i express mongoose cors body-parser path dotenv bcrypt` // _for backend_ <br>
`npm i serialport` // _for biometric_ <br>
`npm i truffle web3` // _for blockchain_ <br>
Install `Ganache` via [Ganache Installation](https://archive.trufflesuite.com/ganache/) and `MetaMask` via [MetaMask Chrome Extension](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)

### **Step 2: Starting the project**

#### **Part 1: Frontend** <br>
In the root directory of the project, run the following command <br>
`npm run dev`

#### **Part 2: Backend** <br>
- `cd server` <br>
- `npm run server`

#### **Part 3: Biometric Setup** <br>
Connect the `Arduino Mega 2560` with the figerprint module `R307` <br>
Pin on `R307` - Pin on `Arduino Mega 2560`
- `RX` - `TX1` // _`pin 18`_
- `TX` - `RX1` // _`pin 19`_
- `Ground` - `GND`
- `5V` - `5V`

Now run the following commands in the terminal
- `cd biometric`
- `node server.js`

#### Part 4: **Blockchain Setup** <br>
1. On `Ganache` create a new workspace.
2. On `MetaMask` create a test network:
   - **RPC URL**: `http://127.0.0.1:7545` // _for Ganache GUI_
   - **Chain ID**: `1337`
3. Add the accounts from the `Ganache` on the `MetaMask`
4. Run the following commands in the terminal
   - `cd blockchain`
   - `truffle migrate` // _to deploy the smart contracts_ or `truffle migrate --reset` // _to redeploy the smart contracts_
5. On succesfull deployment replace the contract address in the `Web3.js` file with the new contract address generated everytime you deploy the contract
