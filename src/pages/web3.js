import Web3 from 'web3';
import Voting from '../../blockchain/build/contracts/Voting.json'; // You can rename your ABI to this

const contractAddress = '0xcc9DFEea56663B7aFE3F6a448B07E74735b95264'; // Replace this everytime when the contract is deployed

const getWeb3 = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return web3;
  } else {
    alert("Please install MetaMask to use this app.");
  }
};

const getContract = async () => {
  const web3 = await getWeb3();
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(Voting.abi, contractAddress);
};

export { getWeb3, getContract };
