import * as Vorpal from "vorpal";
import { createBlsKeyPair, getSignerFromPrivateKey, listenForAssertions } from "@xai-vanguard-node/core";

/**
 * Starts a runtime of the challenger.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootChallenger(cli: Vorpal) {
    cli
        .command('boot-challenger', 'Starts a runtime of the challenger. You will need the secret key of the challenger to start. You can run \'create-bls-key-pair\' to create this key.')
        .action(async function (this: Vorpal.CommandInstance) {
            const secretKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'secretKey',
                message: 'Enter the secret key of the challenger (You can run \'create-bls-key-pair\' to create this key):',
                mask: '*'
            };
            const {secretKey} = await this.prompt(secretKeyPrompt);

            if (!secretKey || secretKey.length < 1) {
                throw new Error("No secret key passed in. Please generate one with  'create-bls-key-pair'.")
            }

            const { publicKeyHex } = await createBlsKeyPair(secretKey);
            this.log(`Public Key of the Challenger: ${publicKeyHex}`);

            const walletKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'walletKey',
                message: 'Enter the secret key of the wallet that the challenger wants to use:',
                mask: '*'
            };
            const {walletKey} = await this.prompt(walletKeyPrompt);

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No wallet key passed in. Please provide a valid wallet key.")
            }

            const { address } = getSignerFromPrivateKey(walletKey);
            this.log(`Address of the Wallet: ${address}`);

            listenForAssertions((nodeNum, blockHash, sendRoot, event) => {
                console.log(`Assertion confirmed: nodeNum: ${nodeNum.toString()}, blockHash: ${blockHash.toString()}, sendRoot: ${sendRoot.toString()}`);
                console.log(event);
            })
            this.log('The challenger is now listening for assertions...');
            return new Promise((resolve, reject) => {}); // Keep the command alive
        });
}