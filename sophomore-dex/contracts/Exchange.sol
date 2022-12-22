pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {

    modifier validTokenAmount(uint _tokenAmount) {
        require(_tokenAmount != 0, "Token amount should be greater than zero");
        _;
    }

    modifier validTokenAddress(address _tokenAddress) {
        require(_tokenAddress != address(0), "Token address passed is a null address");
        _;
    }

    // Exchange is inheriting ERC20, because our exchange would keep track of My Boys Devs LP tokens
    constructor () ERC20("My Boys Devs LP Token", "MBLP") {}

    /**
    * @dev Returns the amount of `Crypto Dev Tokens` held by the contract
    */
    function getTokenAndReserve(address _tokenAddress) public view validTokenAddress(_tokenAddress) returns (IERC20, uint) {
        IERC20 token = ERC20(_tokenAddress);
        return ( token, token.balanceOf(address(this)) );
    }

    /**
    * @dev Adds liquidity to the exchange.
    */
    function addLiquidity(uint _tokenAmount, address _tokenAddress)
    public
    payable
    validTokenAddress(_tokenAddress)
    validTokenAmount(_tokenAmount)
    returns (uint) {
        IERC20 token;
        uint tokenReserve;
        (token, tokenReserve) = getTokenAndReserve(_tokenAddress);
        uint ethBalance = address(this).balance;
        uint lpAmount;
        /*
        If the reserve is empty, intake any user supplied value for
        `Ether` and tokens because there is no ratio currently
        */
        if (tokenReserve == 0) {
            // Transfer the `token` from the user's account to the contract
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            // Take the current ethBalance and mint `ethBalance` amount of LP tokens to the user.
            // `liquidity` provided is equal to `ethBalance` because this is the first time user
            // is adding `Eth` to the contract, so whatever `Eth` contract has is equal to the one supplied
            // by the user in the current `addLiquidity` call
            // `liquidity` tokens that need to be minted to the user on `addLiquidity` call should always be proportional
            // to the Eth specified by the user
            lpAmount = ethBalance;
            _mint(msg.sender, lpAmount);
            // _mint is ERC20.sol smart contract function to mint ERC20 tokens
        } else {
            /*
            If the reserve is not empty, intake any user supplied value for
            `Ether` and determine according to the ratio how many `Crypto Dev` tokens
            need to be supplied to prevent any large price impacts because of the additional
            liquidity
            */
            // EthReserve should be the current ethBalance subtracted by the value of ether sent by the user
            // in the current `addLiquidity` call
            uint ethReserve = ethBalance - msg.value;
            // Ratio should always be maintained so that there are no major price impacts when adding liquidity
            // Ratio here is -> (cryptoDevTokenAmount user can add/cryptoDevTokenReserve in the contract) = (Eth Sent by the user/Eth Reserve in the contract);
            // So doing some maths, (cryptoDevTokenAmount user can add) = (Eth Sent by the user * cryptoDevTokenReserve /Eth Reserve);
            uint proportionalTokenAmount = (tokenReserve * msg.value) / ethReserve;
            require(_tokenAmount >= proportionalTokenAmount, "incorrect ratio of tokens provided");

            // transfer only (cryptoDevTokenAmount user can add) amount of `Crypto Dev tokens` from users account
            // to the contract
            token.transferFrom(msg.sender, address(this), proportionalTokenAmount);

            // The amount of LP tokens that would be sent to the user should be proportional to the liquidity of
            // ether added by the user
            // Ratio here to be maintained is ->
            // (LP tokens to be sent to the user (liquidity)/ totalSupply of LP tokens in contract) = (Eth sent by the user)/(Eth reserve in the contract)
            // by some maths -> liquidity =  (totalSupply of LP tokens in contract * (Eth sent by the user))/(Eth reserve in the contract)
            lpAmount = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, lpAmount);
        }
        return lpAmount;
    }

    /**
    * @dev Returns the amount Eth/tokens that would be returned to the user
    * in the swap
    */
    function removeLiquidity(uint _lpAmount, address _tokenAddress)
    public
    validTokenAddress(_tokenAddress)
    validTokenAmount(_lpAmount)
    returns (uint, uint) {
        IERC20 token;
        uint tokenReserve;
        (token, tokenReserve) = getTokenAndReserve(_tokenAddress);
        uint ethBalance = address(this).balance;
        uint lpTotalSupply = totalSupply();
        // The amount of Eth that would be sent back to the user is based
        // on a ratio
        // Ratio is -> (Eth sent back to the user) / (current Eth reserve)
        // = (amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
        // Then by some maths -> (Eth sent back to the user)
        // = (current Eth reserve * amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
        uint ethAmount = (ethBalance * _lpAmount) / lpTotalSupply;
        // The amount of Crypto Dev token that would be sent back to the user is based
        // on a ratio
        // Ratio is -> (Crypto Dev sent back to the user) / (current Crypto Dev token reserve)
        // = (amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
        // Then by some maths -> (Crypto Dev sent back to the user)
        // = (current Crypto Dev token reserve * amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
        uint tokenAmount = (tokenReserve * _lpAmount) / lpTotalSupply;

        // Burn the sent LP tokens from the user's wallet because they are already sent to
        // remove liquidity
        _burn(msg.sender, _lpAmount);
        // Transfer `ethAmount` of Eth from the contract to the user's wallet
        payable(msg.sender).transfer(ethAmount);
        // Transfer `cryptoDevTokenAmount` of Crypto Dev tokens from the contract to the user's wallet
        token.transfer(msg.sender, tokenAmount);
        return (ethAmount, tokenAmount);
    }

    /**
    * @dev Returns the amount Eth/tokens that would be returned to the user
    * in the swap
    */
    function calculateOutputAmount(uint _inputAmount, uint _inputReserve, uint _outputReserve) public pure returns (uint) {
        require(_inputReserve > 0 && _outputReserve > 0, "invalid reserves");
        // We are charging a fee of `1%`
        // Input amount with fee = (input amount - (1*(input amount)/100)) = ((input amount)*99)/100
        // Because we need to follow the concept of `XY = K` curve
        // We need to make sure (x + Δx) * (y - Δy) = x * y
        // So the final formula is Δy = (y * Δx) / (x + Δx)
        // Δy in our case is `tokens to be received`
        // Δx = ((input amount)*99)/100, x = inputReserve, y = outputReserve
        // So by putting the values in the formulae you can get the numerator and denominator
        uint inputWithFee = _inputAmount * 99;
        return (_outputReserve * inputWithFee) / (_inputReserve * 100 + inputWithFee);
    }

    /**
    * @dev Swaps Eth for Tokens
    */
    function exchangeEthToToken(uint _minTokenAmount, address _tokenAddress) public payable validTokenAddress(_tokenAddress) {
        IERC20 token;
        uint tokenReserve;
        (token, tokenReserve) = getTokenAndReserve(_tokenAddress);
        uint ethReserve = address(this).balance - msg.value;
        // call the `getAmountOfTokens` to get the amount of tokens
        // that would be returned to the user after the swap
        // Notice that the `inputReserve` we are sending is equal to
        // `address(this).balance -e msg.value` instead of just `address(this).balance`
        // because `address(this).balance` already contains the `msg.value` user has sent in the given call
        // so we need to subtract it to get the actual input reserve
        uint outputToken = calculateOutputAmount(msg.value, ethReserve, tokenReserve);

        require(outputToken >= _minTokenAmount, "insufficient output amount");
        // Transfer the tokens to the user
        token.transfer(msg.sender, outputToken);
    }

    /**
    * @dev Swaps Tokens for Eth
    */
    function exchangeTokenToEth(uint _tokenAmount, uint _minEthAmount, address _tokenAddress)
    public
    validTokenAddress(_tokenAddress)
    validTokenAmount(_tokenAmount) {
        IERC20 token;
        uint tokenReserve;
        (token, tokenReserve) = getTokenAndReserve(_tokenAddress);
        uint ethBalance = address(this).balance;
        // call the `calculateOutputAmount` to get the amount of Eth
        // that would be returned to the user after the swap
        uint outputEth = calculateOutputAmount(_tokenAmount, tokenReserve, ethBalance);

        require(outputEth >= _minEthAmount, "insufficient output amount");
        // Transfer tokens from the user's address to the contract
        token.transferFrom(msg.sender, address(this), _tokenAmount);
        // send the `outputEth` to the user from the contract
        payable(msg.sender).transfer(outputEth);
    }
}