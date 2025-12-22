// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract M2Token is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    event TokenEmitido(address indexed to, uint256 indexed idProyecto, uint256 cantidad, bytes32 indexed remitoHash);
    event TokenCanjeado(address indexed user, uint256 indexed idProyecto, uint256 cantidad);

    // Idempotencia: Hash del remito => bool
    mapping(bytes32 => bool) public remitosProcesados;

    constructor() ERC1155("https://api.m2token.com/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    function mintRemito(
        address to, 
        uint256 idProyecto, 
        uint256 amount, 
        bytes32 remitoHash
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(!remitosProcesados[remitoHash], "Error: Remito ya procesado");
        require(amount > 0, "Error: Cantidad debe ser mayor a 0");

        remitosProcesados[remitoHash] = true;
        _mint(to, idProyecto, amount, "");
        emit TokenEmitido(to, idProyecto, amount, remitoHash);
    }

    function mintBatchRemito(
        address to,
        uint256[] memory idsProyectos,
        uint256[] memory amounts,
        bytes32[] memory remitoHashes
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(idsProyectos.length == amounts.length, "Longitud invalida");
        require(idsProyectos.length == remitoHashes.length, "Longitud invalida");

        for (uint256 i = 0; i < remitoHashes.length; i++) {
            require(!remitosProcesados[remitoHashes[i]], "Un remito ya fue procesado");
            remitosProcesados[remitoHashes[i]] = true;
            emit TokenEmitido(to, idsProyectos[i], amounts[i], remitoHashes[i]);
        }
        _mintBatch(to, idsProyectos, amounts, "");
    }

    /**
     * @dev Permite al Admin (Empresa) quemar tokens de un usuario tras pagarle off-chain.
     */
    function adminBurn(address account, uint256 id, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        _burn(account, id, amount);
        emit TokenCanjeado(account, id, amount);
    }

    function canjear(uint256 idProyecto, uint256 amount) public whenNotPaused {
        require(balanceOf(msg.sender, idProyecto) >= amount, "Saldo insuficiente");
        burn(msg.sender, idProyecto, amount);
        emit TokenCanjeado(msg.sender, idProyecto, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Overrides
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}