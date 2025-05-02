module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Ganache runs on localhost
      port: 7545,        // Ensure this matches Ganache's RPC port
      network_id: "*",   // Match any network ID
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Match your Solidity contract version
    },
  },
};
