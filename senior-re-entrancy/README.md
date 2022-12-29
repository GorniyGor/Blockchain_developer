# Re-Entrancy reproduction

```
1)
check contracts

2)
run tests
```

###Result
- One contract with the vulnerability
- Two are without it
- Other preventions (more preferable):
  - Change state before an action
  - Use @openzeppelin ReentrancyGuard

