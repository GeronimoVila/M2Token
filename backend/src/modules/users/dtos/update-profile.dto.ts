import { IsString, IsOptional, IsEthereumAddress } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  cuil?: string;

  @IsOptional()
  @IsString()
  cbu?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsEthereumAddress({ message: 'La wallet debe ser una dirección válida de Ethereum (0x...)' })
  walletAddress?: string;
}