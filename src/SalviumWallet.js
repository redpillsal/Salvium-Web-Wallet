import React, { useState, useEffect, useCallback } from "react";
import CryptoJS from "crypto-js";
import "./styles.css";

const SalviumWallet = () => {
  const nodes = [
    "http://seed01.salvium.io:19081/json_rpc",
    "http://seed02.salvium.io:19081/json_rpc",
    "http://seed03.salvium.io:19081/json_rpc"
  ];

  const [rpcUrl, setRpcUrl] = useState(nodes[0]);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [confirmSeed, setConfirmSeed] = useState("");
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [generatedSeed, setGeneratedSeed] = useState(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletData");
    if (storedWallet) {
      setPage("login");
    } else {
      setPage("create-wallet");
    }
  }, []);

  const formatAmount = (amount) => {
    return (amount / 1e8).toFixed(2).padStart(10);
  };

  const handleGenerateWallet = async () => {
    const requestData = {
      jsonrpc: "2.0",
      id: "0",
      method: "create_wallet",
      params: {}
    };
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();
      if (data.result && data.result.mnemonic) {
        setGeneratedSeed(data.result.mnemonic);
        setPage("confirm-seed");
      }
    } catch (error) {
      console.error("Error generating wallet:", error);
    }
  };

  const handleConfirmSeed = () => {
    if (confirmSeed === generatedSeed) {
      setSeedPhrase(generatedSeed);
      setPage("create-wallet");
    } else {
      alert("Seed phrases do not match. Please try again.");
    }
  };

  const handleCreateWallet = async () => {
    if (seedPhrase && username && password) {
      const requestData = {
        jsonrpc: "2.0",
        id: "0",
        method: "restore_deterministic_wallet",
        params: { seed: seedPhrase, filename: username, password: password }
      };
      try {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData)
        });
        const data = await response.json();
        if (data.result) {
          const encryptedWallet = CryptoJS.AES.encrypt(seedPhrase, password).toString();
          localStorage.setItem("walletData", JSON.stringify({ username, encryptedWallet }));
          setPage("login");
        }
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
    }
  };

  return (
    <div className="container">
      {page === "login" && (
        <div className="login-box">
          <h1>Login to Salvium Wallet</h1>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => setPage("create-wallet")}>Restore from Seed</button>
          <button onClick={handleGenerateWallet}>Create New Wallet</button>
        </div>
      )}
      {page === "confirm-seed" && (
        <div className="seed-box">
          <h1>Confirm Your Seed Phrase</h1>
          <p>{generatedSeed}</p>
          <input type="text" placeholder="Re-enter your seed phrase" value={confirmSeed} onChange={(e) => setConfirmSeed(e.target.value)} />
          <button onClick={handleConfirmSeed}>Confirm</button>
        </div>
      )}
      {page === "create-wallet" && (
        <div className="wallet-box">
          <h1>Create Wallet</h1>
          <input type="text" placeholder="Enter your Salvium seed" value={seedPhrase} onChange={(e) => setSeedPhrase(e.target.value)} />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleCreateWallet}>Create Wallet</button>
        </div>
      )}
    </div>
  );
};

export default SalviumWallet;
