# Use local node

```
1)
npm init --yes
npm install --save-dev hardhat
npx hardhat

2)
npx hardhat node

3)
open another Console window

4)
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

###Result:
- in the first Console window you see
```
eth_sendTransaction
  Contract deployment: Greeter
  Contract address:    
  ...
```

