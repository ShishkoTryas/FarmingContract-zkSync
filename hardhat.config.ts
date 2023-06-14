import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@matterlabs/hardhat-zksync-toolbox";
import dotenv from "dotenv";
dotenv.config();

const zkSyncTestnet =
    process.env.NODE_ENV == "test"
        ? {
          url: "http://localhost:3050",
          ethNetwork: "http://localhost:8545",
          zksync: true,
        }
        : {
          url: "https://testnet.era.zksync.dev",
          ethNetwork: "goerli",
          zksync: true,
        };

const config: HardhatUserConfig = {
  defaultNetwork: "zkSyncTestnet",
  zksolc: {
    version: "1.3.5",
    compilerSource: "binary",
    settings: {},
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    zkSyncTestnet,
  },
};

export default config;