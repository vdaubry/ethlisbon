import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { SafeAuthKit, Web3AuthModalPack } from "@/utils/safe-core/index";

const getSafeAuth = async () => {
  const options: Web3AuthOptions = {
    clientId:
      "BNcj0sLcTDZbJROfleFr6YPIcfIX6-Z2ZPFiIkl3Pvqtavkxhcn4hK5nrY_MWcovRQdvwCWhj6s_ufi8TbC34oU",
    web3AuthNetwork: "testnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x5",
      rpcTarget: "https://goerli.infura.io/v3/c01468162cae4441ba6c94ac3ece1cc7",
    },
    uiConfig: {
      theme: "dark",
      loginMethodsOrder: ["google", "facebook"],
    },
  };

  const modalConfig = {
    [WALLET_ADAPTERS.TORUS_EVM]: {
      label: "torus",
      showOnModal: false,
    },
    [WALLET_ADAPTERS.METAMASK]: {
      label: "metamask",
      showOnDesktop: true,
      showOnMobile: false,
    },
  };

  const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
      mfaLevel: "mandatory",
    },
    adapterSettings: {
      uxMode: "popup",
      whiteLabel: {
        name: "Safe",
      },
    },
  });

  const adapter = new Web3AuthModalPack(
    options,
    [openloginAdapter],
    modalConfig
  );

  const safeAuthKit = await SafeAuthKit.init(adapter, {
    txServiceUrl: "https://safe-transaction-goerli.safe.global",
  });

  return safeAuthKit;
};

export default getSafeAuth;
