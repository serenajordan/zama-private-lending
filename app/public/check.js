(async () => {
  // @ts-ignore
  const provider = new ethers.BrowserProvider(window.ethereum);
  const chain = await window.ethereum.request({ method: 'eth_chainId' });
  console.log('ChainId:', chain); // expect 0xaa36a7 for Sepolia
  console.log('NEXT_PUBLIC_POOL:', process.env.NEXT_PUBLIC_POOL);
  console.log('NEXT_PUBLIC_TOKEN:', process.env.NEXT_PUBLIC_TOKEN);
  console.log('pool code len:', (await provider.getCode(process.env.NEXT_PUBLIC_POOL)).length);
  console.log('token code len:', (await provider.getCode(process.env.NEXT_PUBLIC_TOKEN)).length);
})();
