import React, { useState, useEffect, useCallback } from "react";

const SalviumWallet = () => {
  const nodes = [
    "http://localhost:8010/proxy/json_rpc",
    "http://seed01.salvium.io:19081/json_rpc",
    "http://seed02.salvium.io:19081/json_rpc",
    "http://seed03.salvium.io:19081/json_rpc"
  ];

  const [rpcUrl, setRpcUrl] = useState(nodes[0]);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const formatAmount = (amount) => {
    return (amount / 1e8).toFixed(2).padStart(10);
  };

  const fetchBalance = useCallback(async () => {
    const requestData = {
      jsonrpc: "2.0",
      id: "0",
      method: "get_balance",
      params: {}
    };
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();
      console.log("Raw Balance Response:", data);
      
      if (data.result && Array.isArray(data.result.balances) && data.result.balances.length > 0) {
        const extractedBalance = data.result.balances[0].balance;
        console.log("Extracted Balance:", extractedBalance);
        setBalance(formatAmount(extractedBalance));
      } else {
        setBalance("Error: Invalid Balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error");
    }
  }, [rpcUrl]);

  const fetchTransactions = useCallback(async () => {
    const requestData = {
      jsonrpc: "2.0",
      id: "0",
      method: "get_transfers",
      params: { in: true, out: true }
    };
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();
      console.log("Transactions Response:", data);
      console.log("Full Transaction Data:", data.result);
      
      if (data.result) {
        const incoming = data.result.in.map(tx => ({ ...tx, type: "IN" })) || [];
        const outgoing = data.result.out.map(tx => ({ ...tx, type: "OUT" })) || [];
        const sortedTransactions = [...incoming, ...outgoing].sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(sortedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [rpcUrl]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  return (
    <div>
      <h1>Salvium Web Wallet</h1>
      <label>
        Select Node:
        <select onChange={(e) => setRpcUrl(e.target.value)} value={rpcUrl}>
          {nodes.map((node, index) => (
            <option key={index} value={node}>{node}</option>
          ))}
        </select>
      </label>
      <h2>Balance: {balance !== null ? `${balance} SAL` : "Loading..."}</h2>
      <h3>Transactions:</h3>
      <ul style={{ fontFamily: "monospace" }}>
        {transactions.map((tx, index) => (
          <li key={index} style={{ color: tx.type === "IN" ? "green" : "blue", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span style={{ minWidth: "50px" }}>{tx.type}</span>
            <span style={{ minWidth: "100px", textAlign: "right" }}>{formatAmount(tx.amount)} SAL</span>
            <span>{tx.txid}</span>
          </li>
        ))}
      </ul>
      <button onClick={fetchBalance}>Refresh Balance</button>
      <button onClick={fetchTransactions}>Refresh Transactions</button>
    </div>
  );
};

export default SalviumWallet;
