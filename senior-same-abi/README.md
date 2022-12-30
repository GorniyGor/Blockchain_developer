# Same ABI two different contracts

```
1)
check contracts

2)
run tests
```

###Result
- ABI is affected by only `public` stuff
- To prevent or improve clarification:
  - make an address of external used contract `public`
  - be careful when use external created contract
  - verify external contract code on etherscan

