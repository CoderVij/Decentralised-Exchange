import { BigNumber, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { addLiquidity, calculateCD } from "../utils/addLiquidity";
import {
  getCDTokensBalance,
  getEtherBalance,
  getLPTokensBalance,
  getReserveOfCDTokens,
} from "../utils/getAmounts";
import {
  getTokensAfterRemove,
  removeLiquidity,
} from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";


export default function Home()
{

  const [loading, setLoading] = useState(false);

  const [liquidityTab, setLiquidityTab] = useState(true);

  const zero = BigNumber.from(0);

  const [ethBalance, setEtherBalance] = useState(zero);

  const [reservedCD, setReservedCD] = useState(zero);

  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);

  const [cdBalance, setCDBalance] = useState(zero);

  const [lpBalance, setLPBalance] = useState(zero);

  const [addEther, setAddEther] = useState(zero);

  const [addCDTokens, setAddCDTokens] = useState(zero);

  const [removeEther, setRemoveEther] = useState(zero);

  const [removeCD, setRemoveCD] = useState(zero);

  const [removeLPTokens, setRemoveLPTokens] = useState("0");

  const [swapAmount, setSwapAmount] = useState("");

  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);
 
  const [ethSelected, setEthSelected] = useState(true);

  const web3ModalRef = useRef();

  const [walletConnected, setWalletConnected] = useState(false);


  const getProviderOrSigner = async (needSigner = false) => {

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

  
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) 
    {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) 
    {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => 
  {
    try 
    {
      await getProviderOrSigner();
      setWalletConnected(true);
    } 
    catch (err) 
    {
      console.error(err);
    }
  };


  const getAmounts = async () => 
  {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      
      const _ethBalance = await getEtherBalance(provider, address);
      
      const _cdBalance = await getCDTokensBalance(provider, address);
      
      const _lpBalance = await getLPTokensBalance(provider, address);
      
      const _reservedCD = await getReserveOfCDTokens(provider);
     
      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEtherBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);
    } 
    catch (err) 
    {
      console.error(err);
    }
  };


  const _swapTokens = async () => 
  {
    try 
    {

      const swapAmountWei = utils.parseEther(swapAmount);
 
      if (!swapAmountWei.eq(zero)) 
      {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
      
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );
        setLoading(false);
       
        await getAmounts();
        setSwapAmount("");
      }
    } 
    catch (err) 
    {
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  };


  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try 
    {

      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());

      if (!_swapAmountWEI.eq(zero)) 
      {
        const provider = await getProviderOrSigner();
        
        const _ethBalance = await getEtherBalance(provider, null, true);
        
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        );
        settokenToBeReceivedAfterSwap(amountOfTokens);
      } else 
      {
        settokenToBeReceivedAfterSwap(zero);
      }
    } 
    catch (err) 
    {
      console.error(err);
    }
  };


  const _addLiquidity = async () => 
  {
    try 
    {
      
      const addEtherWei = utils.parseEther(addEther.toString());
      
      if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) 
      {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        
        setAddCDTokens(zero);
       
        await getAmounts();
      } 
      else 
      {
        setAddCDTokens(zero);
      }
    } 
    catch (err) 
    {
      console.error(err);
      setLoading(false);
      setAddCDTokens(zero);
    }
  };


  const _removeLiquidity = async () => 
  {
    try 
    {
      const signer = await getProviderOrSigner(true);

      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);

      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);
    } 
    catch (err) 
    {
      console.error(err);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  };


  const _getTokensAfterRemove = async (_removeLPTokens) => 
  {
    try 
    {
      const provider = await getProviderOrSigner();
      
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      
      const _ethBalance = await getEtherBalance(provider, null, true);
      
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
      
      const { _removeEther, _removeCD } = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);
    } 
    catch (err) 
    {
      console.error(err);
    }
  };


  useEffect(() => 
  {
   
    if (!walletConnected) {

      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts();
    }
  }, [walletConnected]);


  const renderButton = () => {

    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {utils.formatEther(cdBalance)} Simple Human Talk Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} Simple Human Talk LP tokens
          </div>
          <div>
            {/* If reserved CD is zero, render the state for liquidity zero where we ask the user
            how much initial liquidity he wants to add else just render the state where liquidity is not zero and
            we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
            {utils.parseEther(reservedCD.toString()).eq(zero) ? 
            (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Amount of Simple Human Talk tokens"
                  onChange={(e) =>
                    setAddCDTokens(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    )
                  }
                  className={styles.input}
                />
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    // calculate the number of CD tokens that
                    // can be added given  `e.target.value` amount of Eth
                    const _addCDTokens = await calculateCD(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedCD
                    );
                    setAddCDTokens(_addCDTokens);
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                  {`You will need ${utils.formatEther(addCDTokens)} Simple Human Talk
                  Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            )}
            <div>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  // Calculate the amount of Ether and CD tokens that the user would receive
                  // After he removes `e.target.value` amount of `LP` tokens
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                {`You will get ${utils.formatEther(removeCD)} Simple
              Human Talk Tokens and ${utils.formatEther(removeEther)} Eth`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              // Calculate the amount of tokens user would receive after the swap
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
            }}
            className={styles.input}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              // Initialize the values back to zero
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Simple Human Talk Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {ethSelected
              ? `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Simple Human Talk Tokens`
              : `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Eth`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button>
        </div>
      );
    }
  };


  return (
    <div>
      <Head>
        <title>Simple Human Talks</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Simple Human Talks Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Simple Human Talks Tokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(true);
              }}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodev.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Simple Human Talks
      </footer>
    </div>
  );
}