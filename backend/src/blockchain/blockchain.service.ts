import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as M2TokenABI from '../abis/M2Token.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.initializeBlockchain();
  }

  private initializeBlockchain() {
    try {
      const rpcUrl = this.configService.get<string>('RPC_URL');
      const privateKey = this.configService.get<string>('PRIVATE_KEY'); 
      const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

      if (!rpcUrl || !privateKey || !contractAddress) {
        this.logger.error('Faltan variables de entorno para Blockchain');
        return;
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, M2TokenABI.abi, this.wallet);

      this.logger.log(`🔗 Blockchain conectada. Wallet: ${this.wallet.address}`);
      this.logger.log(`📜 Contrato cargado en: ${contractAddress}`);
    } catch (error) {
      this.logger.error('Error inicializando BlockchainService', error);
    }
  }

  /**
   * Emite tokens para un proveedor basado en un remito validado.
   * @param toAddress Dirección de la wallet del proveedor (0x...)
   * @param projectId ID del proyecto (ej: 1 para Torre Alvear)
   * @param amountM2 Cantidad de metros cuadrados (se multiplicará por 100)
   * @param mongoRemitoId ID único del remito en MongoDB
   */
  async mintTokens(toAddress: string, projectId: number, amountM2: number, mongoRemitoId: string) {
    try {
      this.logger.log(`🏗️ Iniciando Minting: ${amountM2}m2 para ${toAddress} (Proyecto ${projectId})`);

      const tokenAmount = amountM2 * 100;

      const network = await this.provider.getNetwork();
      const chainId = network.chainId;
      const contractAddress = await this.contract.getAddress();

      const remitoHash = ethers.solidityPackedKeccak256(
        ['uint256', 'address', 'uint256', 'string'],
        [chainId, contractAddress, projectId, mongoRemitoId]
      );

      const tx = await this.contract.mintRemito(
        toAddress,
        projectId,
        tokenAmount,
        remitoHash
      );

      this.logger.log(`⏳ Transacción enviada. Hash: ${tx.hash}. Esperando confirmación...`);

      const receipt = await tx.wait();

      this.logger.log(`✅ Tokens emitidos con éxito en bloque ${receipt.blockNumber}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokensMinted: tokenAmount
      };

    } catch (error) {
      this.logger.error(`❌ Error en Minting: ${error.message}`);
      if (error.message.includes('Remito ya procesado')) {
        throw new Error('Este remito ya fue pagado en la Blockchain (Doble Gasto prevenido).');
      }
      throw error;
    }
  }

  async getBalance(walletAddress: string, projectId: number): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(walletAddress, projectId);
      
      return balance.toString();
    } catch (error) {
      this.logger.error(`Error consultando saldo: ${error.message}`);
      throw error;
    }
  }

  async burnTokens(userWallet: string, projectId: number, amount: number) {
    try {
      this.logger.log(`Iniciando Quema (Burn): ${amount} tokens de ${userWallet} (Proyecto ${projectId})`);

      const tx = await this.contract.adminBurn(
        userWallet,
        projectId,
        amount
      );

      this.logger.log(`Transacción de quema enviada. Hash: ${tx.hash}`);
      const receipt = await tx.wait();
      this.logger.log(`Quema confirmada en bloque ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      this.logger.error(`Error en Burn: ${error.message}`);
      throw error;
    }
  }
}