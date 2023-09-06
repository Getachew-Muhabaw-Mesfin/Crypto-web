import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractAddress, contractABI } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  // console.log({ provider, signer, transactionsContract });
  return transactionsContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setformData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("PLEASE INSTALL METAMASK !!");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      //Check if the account is thier or not
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        // should return all the transactions
      } else {
        alert("NO ACCOUNTS FOUND ! Please Connect Your Accout ");
        console.log("NO ACCOUNTS FOUND !");
      }
    } catch (error) {
      console.log(error);
      throw new Error(
        "No Ethereum Object ....Please install metamask and try again!"
      );
    }
  };

  //check the transaction is exist
  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        const currentTransactionCount =
          await transactionsContract.getTransactionCount();

        window.localStorage.setItem(
          "transactionCount",
          currentTransactionCount
        );
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
  //Connnect Wallet function
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("PLEASE INSTALL METAMASK !!");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error(
        "No Ethereum Object ....Please install metamask and try again!"
      );
    }
  };

  //Send Transactions

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("PLEASE INSTALL METAMASK !!");
      //get the data from the form
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      // send functionality

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loding -${transactionHash.hash}`);
      await transactionHash.wait();
      //Scucess
      setIsLoading(false);
      console.log(`Success -${transactionHash.hash}`);

      //get transaction count
      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error(
        "No Ethereum Object ....Please install metamask and try again!"
      );
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExists();
  }, []);
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// const createEthereumContract = () => {
//   const provider = new ethers.providers.Web3Provider(ethereum);
//   const signer = provider.getSigner();
//   const transactionsContract = new ethers.Contract(
//     contractAddress,
//     contractABI,
//     signer
//   );

//   return transactionsContract;
// };

// export const TransactionsProvider = ({ children }) => {
//   const [formData, setformData] = useState({
//     addressTo: "",
//     amount: "",
//     keyword: "",
//     message: "",
//   });
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [transactionCount, setTransactionCount] = useState(
//     localStorage.getItem("transactionCount")
//   );
//   const [transactions, setTransactions] = useState([]);

//   const handleChange = (e, name) => {
//     setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
//   };

//   const getAllTransactions = async () => {
//     try {
//       if (ethereum) {
//         const transactionsContract = createEthereumContract();

//         const availableTransactions =
//           await transactionsContract.getAllTransactions();

//         const structuredTransactions = availableTransactions.map(
//           (transaction) => ({
//             addressTo: transaction.receiver,
//             addressFrom: transaction.sender,
//             timestamp: new Date(
//               transaction.timestamp.toNumber() * 1000
//             ).toLocaleString(),
//             message: transaction.message,
//             keyword: transaction.keyword,
//             amount: parseInt(transaction.amount._hex) / 10 ** 18,
//           })
//         );

//         console.log(structuredTransactions);

//         setTransactions(structuredTransactions);
//       } else {
//         console.log("Ethereum is not present");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const checkIfWalletIsConnect = async () => {
//     try {
//       if (!ethereum) return alert("Please install MetaMask.");

//       const accounts = await ethereum.request({ method: "eth_accounts" });

//       if (accounts.length) {
//         setCurrentAccount(accounts[0]);

//         getAllTransactions();
//       } else {
//         console.log("No accounts found");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };



//   const connectWallet = async () => {
//     try {
//       if (!ethereum) return alert("Please install MetaMask.");

//       const accounts = await ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       setCurrentAccount(accounts[0]);
//       window.location.reload();
//     } catch (error) {
//       console.log(error);

//       throw new Error("No ethereum object");
//     }
//   };

//   const sendTransaction = async () => {
//     try {
//       if (ethereum) {
//         const { addressTo, amount, keyword, message } = formData;
//         const transactionsContract = createEthereumContract();
//         const parsedAmount = ethers.utils.parseEther(amount);

//         await ethereum.request({
//           method: "eth_sendTransaction",
//           params: [
//             {
//               from: currentAccount,
//               to: addressTo,
//               gas: "0x5208",
//               value: parsedAmount._hex,
//             },
//           ],
//         });

//         const transactionHash = await transactionsContract.addToBlockchain(
//           addressTo,
//           parsedAmount,
//           message,
//           keyword
//         );

//         setIsLoading(true);
//         console.log(`Loading - ${transactionHash.hash}`);
//         await transactionHash.wait();
//         console.log(`Success - ${transactionHash.hash}`);
//         setIsLoading(false);

//         const transactionsCount =
//           await transactionsContract.getTransactionCount();

//         setTransactionCount(transactionsCount.toNumber());
//         window.location.reload();
//       } else {
//         console.log("No ethereum object");
//       }
//     } catch (error) {
//       console.log(error);

//       throw new Error("No ethereum object");
//     }
//   };

//   useEffect(() => {
//     checkIfWalletIsConnect();
//     checkIfTransactionsExists();
//   }, [transactionCount]);

//   return (
//     <TransactionContext.Provider
//       value={{
//         transactionCount,
//         connectWallet,
//         transactions,
//         currentAccount,
//         isLoading,
//         sendTransaction,
//         handleChange,
//         formData,
//       }}
//     >
//       {children}
//     </TransactionContext.Provider>
//   );
// };
