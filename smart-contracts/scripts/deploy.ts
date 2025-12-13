import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Iniciando despliegue de M2Token...");

  const [deployer] = await ethers.getSigners();
  console.log("👨‍💻 Cuenta de despliegue:", deployer.address);

  const M2Token = await ethers.getContractFactory("M2Token");
  const token = await M2Token.deploy();
  await token.waitForDeployment();
  
  const address = await token.getAddress();

  console.log("✅ Contrato desplegado en:", address);
  console.log("⚠️  COPIA ESTA DIRECCION PARA EL BACKEND");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});