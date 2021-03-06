
import { config } from "../config/config";
import { DemoAccount } from "../model/demo-account";

import { Harmony } from '@harmony-js/core';
import { ChainID,
         ChainType,
         hexToNumber,
         numberToHex,
         fromWei,
         Units,
         Unit } from '@harmony-js/utils';
import { Account, Wallet } from '@harmony-js/account';
import { ContractFactory, Contract } from '@harmony-js/contract';
import { Messenger, HttpProvider } from '@harmony-js/network';
import { toBech32, toChecksumAddress } from '@harmony-js/crypto';

// the purpose of this client is to test deloying contact and 
// calling its methods
export class ExampleClient{

    private contract: Contract; 
    private account: DemoAccount;
    private contractJson: any;
    private contractAddr: string;

    constructor() {

      this.account = DemoAccount.deserializeArray(config.accounts).find((account: DemoAccount) => {
        return account.name === 'home';
      });

      this.contractJson = require('../contracts/Counter.json');
    }

    private getContract(): Contract{
    
        const wallet = new Wallet(
          new Messenger(
            new HttpProvider('https://api.s0.b.hmny.io'),
            ChainType.Harmony,
            ChainID.HmyTestnet,
          ),
        );
    
        const factory = new ContractFactory(wallet);
      
        return this.contractAddr? factory.createContract(this.contractJson.abi, this.contractAddr) : 
          factory.createContract(this.contractJson.abi);
    }
    
    // deploy the counter contract
    async deployExample(): Promise<string> {

        const contract = this.getContract();

        const options3 = { data: this.contractJson.bytecode }; // contractConstructor needs contract bytecode to deploy
          
        contract.wallet.addByPrivateKey(this.account.privateKey);
                  
        let gas: string = await contract.methods.contractConstructor(options3).estimateGas(this.options1);
        let options2 = {...this.options2, gasLimit: hexToNumber(gas)};
        let response = await  contract.methods.contractConstructor(options3).send(options2)

        console.log(response.transaction.receipt);

        this.contractAddr = response.transaction.receipt.contractAddress;

        return `${this.contractAddr} ${toBech32(this.contractAddr)}`;
    }

    private get options1(): { gasPrice:string} {
      return  { gasPrice: '0x3B9ACA00' }; 
    }

    private get options2(): { gasPrice:string, gasLimit: string} {
      return  { gasPrice: '1000000000', gasLimit: '21000' };
    }

    // getCounter example
    async getCount(): Promise<string> {

      const contract = this.getContract();
      
      const gas = await contract.methods.getCount().estimateGas(this.options1);
      
      let options2 = {...this.options2, gasLimit: hexToNumber(gas)};
      const count = await contract.methods.getCount().call(options2);
            
      return count;
   }

   // increment counter
   async increment(): Promise<string> {
       
        const contract = this.getContract();
        
        contract.wallet.addByPrivateKey(this.account.privateKey);
        
        const gas: string = await contract.methods.incrementCounter().estimateGas(this.options1)
        const options2 = {...this.options2, gasLimit: hexToNumber(gas)};

        const response = await contract.methods.incrementCounter().send(options2)
        console.log(response.transaction.receipt);

        return this.getCount();
   }

   async jumpTo(): Promise<string> {

      const contract = this.getContract();
        
      contract.wallet.addByPrivateKey(this.account.privateKey);
    
      //const method = contract.methods.jumpTo(10);

      const gas: string = await contract.methods.jumpTo(10).estimateGas(this.options1)
      const options2 = {...this.options2, gasLimit: hexToNumber(gas)};

      const response = await contract.methods.jumpTo(10).send(options2);

      console.log(response.transaction.receipt);

      return this.getCount();
  }
}

