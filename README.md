# Ethernaut challenges with Mocha and Chai

## Initial setup
### 1 - create .env file with
```
RPC_URL=...
PRIVATE_KEY=... (without '0x')
```
### 2a - follow instructions from https://github.com/OpenZeppelin/ethernaut to install locally

### 2b - if runing node v18, run below command **before** starting the local React application
```
export NODE_OPTIONS=--openssl-legacy-provider
```
If that command is not ran, you might see an error like this
>Error: error:0308010C:digital envelope routines::unsupported

## Run puzzle solutions
```
cd ethernaut-challenges
npx hardhat test --network localhost
```