# Contract verification on Etherscan 
##(actually Polygonscan)

```
1)
Add to .env
- mumbai provider
- polygonscan api key

2)
add verification to deploy.js
(already done)

3)
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

###Result:
- Contract address: `0x78ACA20AFdAAFA3Ed98617170a84Bf88c7A21DF0`
- Polygonscan contract's link: https://mumbai.polygonscan.com/address/0x78ACA20AFdAAFA3Ed98617170a84Bf88c7A21DF0#code

