import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig, task, vars } from "hardhat/config";

import "@nomicfoundation/hardhat-ethers";
import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-solhint";

// import "@matterlabs/hardhat-zksync-solc";
// import "@matterlabs/hardhat-zksync-verify";

import 'hardhat-abi-exporter';
import "hardhat-tracer";
import "hardhat-gas-reporter";

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";

// const ETHERSCAN_API_KEY =  vars.get("ETHERSCAN_API_KEY")
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || vars.get("ETHERSCAN_API_KEY")
const PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || vars.get("ACCOUNT_PRIVATE_KEY")
const INFURA_ID = process.env.INFURA_API_KEY || vars.get("INFURA_API_KEY")

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      // forking: {
      //   url: "https://sepolia.infura.io/v3/${INFURA_ID}",
      // },
      // accounts: {
      //   mnemonic: process.env.SEED_PHRASE,
      // },
      chainId: 31337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_ID}`,
      accounts: [PRIVATE_KEY]
    },
    // Prod
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    arbitrum: {
      chainId: 42161,
      url: "https://arb1.arbitrum.io/rpc",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    astarzkevm: {
      url: "https://rpc.astar-zkevm.gelato.digital",
      chainId: 3776,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    base: {
      url: `https://mainnet.base.org`,
      chainId: 8453,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    blast: {
      url: `https://blastl2-mainnet.public.blastapi.io`,
      chainId: 81457,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    bsc: {
      chainId: 56,
      url: "https://bsc-dataseed.binance.org/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    ethereum: {
      chainId: 1,
      url: `https://ethereum.infura.io/v3/${INFURA_ID}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    fantom: {
      chainId: 250,
      url: `https://rpcapi.fantom.network/`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    gnosis: {
      chainId: 100,
      url: `https://gnosis-mainnet.public.blastapi.io`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    linea: {
      url: `https://linea-mainnet.infura.io/v3/${INFURA_ID}`,
      chainId: 59144,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    metis: {
      chainId: 1088,
      url: "https://metis-mainnet.public.blastapi.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    mode: {
      url: `https://mainnet.mode.network`,
      chainId: 34443,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    optimism: {
      chainId: 10,
      url: "https://mainnet.optimism.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    playblock: {
      chainId: 1829,
      url: `https://rpc.playblock.io`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // polygon: {
    //   chainId: 137,
    //   url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    //   accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    // },
    polygonzk: {
      url: "https://zkevm-rpc.com",
      chainId: 1101,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    real: {
      url: "https://rpc.realforreal.gelato.digital/",
      chainId: 111188,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    reyanetwork: {
      url: "https://rpc.reya.network",
      chainId: 1729,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // zksync: {
    //   zksync: true,
    //   url: "https://mainnet.era.zksync.io",
    //   chainId: 324,
    //   accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    //   verifyURL:
    //     "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    // },
    // Staging
    amoy: {
      chainId: 80002,
      url: `https://rpc-amoy.polygon.technology`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    arbsepolia: {
      chainId: 421614,
      url: `https://sepolia-rollup.arbitrum.io/rpc`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    astarzkyoto: {
      chainId: 6038361,
      url: `https://rpc.zkyoto.gelato.digital`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    basesepolia: {
      url: `https://sepolia.base.org`,
      chainId: 84532,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    blackberry: {
      url: `https://rpc.polygon-blackberry.gelato.digital`,
      chainId: 94204209,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    blastsepolia: {
      chainId: 168587773,
      url: `https://sepolia.blast.io`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    gelopcelestiatestnet: {
      chainId: 123420111,
      url: `https://rpc.op-celestia-testnet.gelato.digital`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    gelatoorbittestnet: {
      url: `https://rpc.gelato-orbit-anytrust-testnet.gelato.digital`,
      chainId: 88153591557,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // goerli: {
    //   chainId: 5,
    //   url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_ID}`,
    //   accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    // },
    lisksepolia: {
      chainId: 4202,
      url: `https://rpc.lisk-sepolia-testnet.gelato.digital`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    osepolia: {
      chainId: 11155420,
      url: `https://sly-light-scion.optimism-sepolia.quiknode.pro/30140607e2dbcaf7d581b1e706ce2f33579f5f8e/`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    reyacronos: {
      chainId: 89346161,
      url: `https://rpc.reya-cronos.gelato.digital`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // sepolia: {
    //   chainId: 11155111,
    //   url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ID}`,
    //   accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    // },
    unreal: {
      chainId: 18231,
      url: `https://rpc.unreal.gelato.digital`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    unrealorbit: {
      chainId: 18233,
      url: `https://rpc.unreal-orbit.gelato.digital`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    zkatana: {
      chainId: 1261120,
      url: "https://rpc.zkatana.gelato.digital",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  gasReporter: {
    showMethodSig: true,
    showTimeSpent: true
  },
  ignition: {
    strategyConfig: {
      create2: {
        // To learn more about salts, see the CreateX documentation
        salt: "0xdff281e068e1b163cf0510b14c6194f5142dcfb563cea2dc42556621ef87d2d1",
      },
    },
  },
};

export default config;
