# Farming Contract

This is a simple farming contract that allows users to deposit Token B and receive rewards in Token A. The contract is covered by unit tests and has been deployed on the test network zksync.

## Contract Functionality

The farming contract supports the following functionality:

1. The admin can replenish Token A balance.
2. Any user can deposit Token B into the contract.
3. Every second, rewards in Token A are distributed to all users based on the proportion of their deposited Token B at the time of distribution.
4. Users can withdraw their deposited Token B and their earned rewards.

## Deployment Addresses

The contract has been deployed on the following addresses:

- Token A address: 0xbD30318F629650Ee87F4Ef638D2bA66Ca136Dd0E
- Token B address: 0xF52A573277d8c1a72704b3be1f9F049f3Cf81c58
- Farm address: 0x3cff8877ECe764Fc0c5762D8fe9FE09464Ad98DB

## Usage

To interact with the farming contract, you will need the addresses of ERC20 Token A, ERC20 Token B, and the Farm contract deployed on the zksync test network.

1. Fund the Farm contract with ERC20 Token A by using the contract's method depositTokenA()(only owner). Transfer the desired amount of ERC20 Token A to the Farm contract's address: 0x3cff8877ECe764Fc0c5762D8fe9FE09464Ad98DB.

2. Deposit ERC20 Token B into the Farm contract by using the contract's method depositTokenB(). Transfer the desired amount of ERC20 Token B to the Farm contract's address: 0x3cff8877ECe764Fc0c5762D8fe9FE09464Ad98DB.

3. The contract will automatically distribute rewards in ERC20 Token A to all users every second based on the proportion of their deposited ERC20 Token B.

4. To withdraw your deposited ERC20 Token B and the earned rewards, use the contract's method withdraw(). This will transfer your deposited ERC20 Token B and rewards back to your address.

## Testing

Unit tests have been written to ensure the functionality of the farming contract. The tests cover various scenarios and can be executed to verify the contract's behavior.

To run the tests locally, follow these steps:

1. Clone the project repository:

   ```
   git clone <repository_url>
   ```

2. Install the required dependencies:

   ```
   cd <project_directory>
   npm install
   ```

3. Clone the local setup repository for setting up a local node:

   ```
   git clone https://github.com/matter-labs/local-setup.git
   ```

4. Navigate to the local setup directory:

   ```
   cd local-setup
   ```

5. Start the local node using Docker:

   ```
   ./start.sh
   ```

   Please ensure that Docker is installed on your system before running this command.

6. Once the local node is up and running, you can proceed to run the tests:

   ```
   cd <project_directory>
   npm test
   ```

   This will execute the unit tests and display the results, ensuring that the farming contract functions as expected.
