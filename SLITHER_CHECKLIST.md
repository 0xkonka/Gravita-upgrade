Summary
 - [arbitrary-send-erc20](#arbitrary-send-erc20) (1 results) (High)
 - [unchecked-transfer](#unchecked-transfer) (10 results) (High)
 - [uninitialized-state](#uninitialized-state) (1 results) (High)
 - [divide-before-multiply](#divide-before-multiply) (9 results) (Medium)
 - [incorrect-equality](#incorrect-equality) (4 results) (Medium)
 - [locked-ether](#locked-ether) (1 results) (Medium)
 - [reentrancy-no-eth](#reentrancy-no-eth) (5 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (14 results) (Medium)
 - [unused-return](#unused-return) (7 results) (Medium)
 - [events-access](#events-access) (9 results) (Low)
 - [events-maths](#events-maths) (3 results) (Low)
 - [missing-zero-check](#missing-zero-check) (10 results) (Low)
 - [calls-loop](#calls-loop) (24 results) (Low)
 - [reentrancy-benign](#reentrancy-benign) (8 results) (Low)
 - [reentrancy-events](#reentrancy-events) (24 results) (Low)
 - [timestamp](#timestamp) (27 results) (Low)
 - [assembly](#assembly) (2 results) (Informational)
 - [dead-code](#dead-code) (1 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
 - [similar-names](#similar-names) (5 results) (Informational)
 - [too-many-digits](#too-many-digits) (1 results) (Informational)
 - [constable-states](#constable-states) (2 results) (Optimization)
## arbitrary-send-erc20
Impact: High
Confidence: High
 - [ ] ID-0
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46) uses arbitrary from in transferFrom: [IERC20(assetToken).transferFrom(params.recipient,address(this),assetTokensNeededPlusFee)](contracts/TestContracts/MockUniswapRouterV3.sol#L42)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46


## unchecked-transfer
Impact: High
Confidence: Medium
 - [ ] ID-1
[FlashLoan.flashLoan(uint256)](contracts/FlashLoan.sol#L62-L86) ignores return value by [IDebtToken(debtToken).transfer(msg.sender,_amount)](contracts/FlashLoan.sol#L74)

contracts/FlashLoan.sol#L62-L86


 - [ ] ID-2
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46) ignores return value by [IERC20(debtToken).transfer(params.recipient,params.amountOut)](contracts/TestContracts/MockUniswapRouterV3.sol#L43)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46


 - [ ] ID-3
[FlashLoanTester.executeOperation(uint256,uint256,address)](contracts/TestContracts/FlashLoanTester.sol#L20-L24) ignores return value by [IERC20(_tokenAddress).transfer(msg.sender,_amount + _fee)](contracts/TestContracts/FlashLoanTester.sol#L23)

contracts/TestContracts/FlashLoanTester.sol#L20-L24


 - [ ] ID-4
[FlashLoan.sendFeeToCollector()](contracts/FlashLoan.sol#L138-L142) ignores return value by [IDebtToken(debtToken).transfer(collector,feeAmount)](contracts/FlashLoan.sol#L141)

contracts/FlashLoan.sol#L138-L142


 - [ ] ID-5
[MockBorrowerOperations.closeTrenBox(address)](contracts/TestContracts/MockBorrowerOperations.sol#L9-L11) ignores return value by [IERC20(_asset).transfer(msg.sender,IERC20(_asset).balanceOf(address(this)))](contracts/TestContracts/MockBorrowerOperations.sol#L10)

contracts/TestContracts/MockBorrowerOperations.sol#L9-L11


 - [ ] ID-6
[TRENStaking.stake(uint256)](contracts/TREN/TRENStaking.sol#L98-L137) ignores return value by [trenToken.transferFrom(msg.sender,address(this),_TRENamount)](contracts/TREN/TRENStaking.sol#L134)

contracts/TREN/TRENStaking.sol#L98-L137


 - [ ] ID-7
[FlashLoan.flashLoanForRepay(address)](contracts/FlashLoan.sol#L88-L119) ignores return value by [IDebtToken(debtToken).transfer(msg.sender,netDebt)](contracts/FlashLoan.sol#L99)

contracts/FlashLoan.sol#L88-L119


 - [ ] ID-8
[FlashLoanTester.withdrawTokens(address,address)](contracts/TestContracts/FlashLoanTester.sol#L26-L29) ignores return value by [IERC20(_tokenAddress).transfer(_receiver,_amount)](contracts/TestContracts/FlashLoanTester.sol#L28)

contracts/TestContracts/FlashLoanTester.sol#L26-L29


 - [ ] ID-9
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L152-L179) ignores return value by [IERC20(_tokenIn).transfer(msg.sender,_collAmountIn - amountIn)](contracts/FlashLoan.sol#L177)

contracts/FlashLoan.sol#L152-L179


 - [ ] ID-10
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46) ignores return value by [IERC20(assetToken).transferFrom(params.recipient,address(this),assetTokensNeededPlusFee)](contracts/TestContracts/MockUniswapRouterV3.sol#L42)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46


## uninitialized-state
Impact: High
Confidence: High
 - [ ] ID-11
[TrenBoxManager.TrenBoxOwners](contracts/TrenBoxManager.sol#L95) is never initialized. It is used in:
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L340-L354)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L779-L799)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L801-L825)
	- [TrenBoxManager.getTrenBoxOwnersCount(address)](contracts/TrenBoxManager.sol#L927-L929)
	- [TrenBoxManager.getTrenBoxFromTrenBoxOwnersArray(address,uint256)](contracts/TrenBoxManager.sol#L931-L941)

contracts/TrenBoxManager.sol#L95


## divide-before-multiply
Impact: Medium
Confidence: Medium
 - [ ] ID-12
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L319-L341) performs a multiplication on the result of a division:
	- [decayRate = (_amount * PRECISION) / lifeTime](contracts/FeeCollector.sol#L338)
	- [expiredAmount = (elapsedTime * decayRate) / PRECISION](contracts/FeeCollector.sol#L339)

contracts/FeeCollector.sol#L319-L341


 - [ ] ID-13
[StabilityPool._computeRewardsPerUnitStaked(address,uint256,uint256,uint256)](contracts/StabilityPool.sol#L523-L556) performs a multiplication on the result of a division:
	- [collGainPerUnitStaked = collateralNumerator / _totalDeposits](contracts/StabilityPool.sol#L553)
	- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L554-L555)

contracts/StabilityPool.sol#L523-L556


 - [ ] ID-14
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46) performs a multiplication on the result of a division:
	- [assetTokensNeeded = (stableCoinsNeeded + fee_1) / ratioAssetToStable](contracts/TestContracts/MockUniswapRouterV3.sol#L38)
	- [fee_2 = (assetTokensNeeded * fee2) / FEE_DENOMINATOR](contracts/TestContracts/MockUniswapRouterV3.sol#L39)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46


 - [ ] ID-15
[StabilityPool._computeTRENPerUnitStaked(uint256,uint256)](contracts/StabilityPool.sol#L441-L466) performs a multiplication on the result of a division:
	- [TRENPerUnitStaked = TRENNumerator / _totalDeposits](contracts/StabilityPool.sol#L463)
	- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L464)

contracts/StabilityPool.sol#L441-L466


 - [ ] ID-16
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) performs a multiplication on the result of a division:
	- [collLot = (maxRedeemableDebt * DECIMAL_PRECISION) / vars.price](contracts/TrenBoxManagerOperations.sol#L406)
	- [collLot = (collLot * redemptionSofteningParam) / PERCENTAGE_PRECISION](contracts/TrenBoxManagerOperations.sol#L408)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-17
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L525-L581) performs a multiplication on the result of a division:
	- [debtRewardPerUnitStaked = debtNumerator / assetStakes](contracts/TrenBoxManager.sol#L564)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L568-L569)

contracts/TrenBoxManager.sol#L525-L581


 - [ ] ID-18
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L133-L139) performs a multiplication on the result of a division:
	- [timePassed = (block.timestamp - lastUpdateTime) / SECONDS_IN_ONE_MINUTE](contracts/TREN/CommunityIssuance.sol#L135)
	- [totalDistribuedSinceBeginning = trenDistribution * timePassed](contracts/TREN/CommunityIssuance.sol#L136)

contracts/TREN/CommunityIssuance.sol#L133-L139


 - [ ] ID-19
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L112-L127) performs a multiplication on the result of a division:
	- [claimable = ((entityRule.totalSupply / TWO_YEARS) * (block.timestamp - entityRule.createdDate)) - entityRule.claimed](contracts/TREN/LockedTREN.sol#L121-L123)

contracts/TREN/LockedTREN.sol#L112-L127


 - [ ] ID-20
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L525-L581) performs a multiplication on the result of a division:
	- [collRewardPerUnitStaked = collNumerator / assetStakes](contracts/TrenBoxManager.sol#L563)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L566-L567)

contracts/TrenBoxManager.sol#L525-L581


## incorrect-equality
Impact: Medium
Confidence: High
 - [ ] ID-21
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L93-L102) uses a dangerous strict equality:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L95)

contracts/TREN/LockedTREN.sol#L93-L102


 - [ ] ID-22
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L104-L111) uses a dangerous strict equality:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L105)

contracts/TREN/CommunityIssuance.sol#L104-L111


 - [ ] ID-23
[CommunityIssuance.sendTREN(address,uint256)](contracts/TREN/CommunityIssuance.sol#L141-L150) uses a dangerous strict equality:
	- [safeAmount == 0](contracts/TREN/CommunityIssuance.sol#L145)

contracts/TREN/CommunityIssuance.sol#L141-L150


 - [ ] ID-24
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L104-L110) uses a dangerous strict equality:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L107)

contracts/TREN/LockedTREN.sol#L104-L110


## locked-ether
Impact: Medium
Confidence: High
 - [ ] ID-25
Contract locking ether found:
	Contract [MockUniswapRouterV3](contracts/TestContracts/MockUniswapRouterV3.sol#L7-L59) has payable functions:
	 - [IUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/Interfaces/IUniswapRouterV3.sol#L14-L17)
	 - [MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L46)
	But does not have a function to withdraw the ether

contracts/TestContracts/MockUniswapRouterV3.sol#L7-L59


## reentrancy-no-eth
Impact: Medium
Confidence: Medium
 - [ ] ID-26
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L492)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	State variables written after the call(s):
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
		- [P = newP](contracts/StabilityPool.sol#L626)
	[StabilityPool.P](contracts/StabilityPool.sol#L217) can be used in cross function reentrancies:
	- [StabilityPool.P](contracts/StabilityPool.sol#L217)
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L829-L880)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L558-L628)
	- [StabilityPool.initialize()](contracts/StabilityPool.sol#L263-L270)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
		- [currentEpoch = currentEpochCached](contracts/StabilityPool.sol#L600)
	[StabilityPool.currentEpoch](contracts/StabilityPool.sol#L225) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L829-L880)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L558-L628)
	- [StabilityPool.currentEpoch](contracts/StabilityPool.sol#L225)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
		- [currentScale = 0](contracts/StabilityPool.sol#L602)
		- [currentScale = currentScaleCached](contracts/StabilityPool.sol#L615)
	[StabilityPool.currentScale](contracts/StabilityPool.sol#L222) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L829-L880)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L558-L628)
	- [StabilityPool.currentScale](contracts/StabilityPool.sol#L222)

contracts/StabilityPool.sol#L480-L501


 - [ ] ID-27
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L391-L393)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L398)
	State variables written after the call(s):
	- [trenBox.debt = _newDebt](contracts/TrenBoxManager.sol#L401)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L65) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L65)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L779-L799)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L674-L687)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L728-L732)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L801-L825)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L735-L750)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L340-L354)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L977-L990)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1007-L1029)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L253-L267)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L200-L217)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L220-L236)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L915-L925)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L903-L913)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L891-L901)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L879-L889)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L962-L975)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L992-L1005)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L950-L960)
	- [trenBox.coll = _newColl](contracts/TrenBoxManager.sol#L402)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L65) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L65)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L779-L799)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L674-L687)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L728-L732)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L801-L825)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L735-L750)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L340-L354)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L977-L990)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1007-L1029)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L253-L267)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L200-L217)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L220-L236)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L915-L925)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L903-L913)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L891-L901)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L879-L889)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L962-L975)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L992-L1005)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L950-L960)
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L403)
		- [trenBox.stake = newStake](contracts/TrenBoxManager.sol#L745)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L65) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L65)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L779-L799)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L674-L687)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L728-L732)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L801-L825)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L735-L750)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L340-L354)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L977-L990)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1007-L1029)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L253-L267)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L200-L217)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L220-L236)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L915-L925)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L903-L913)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L891-L901)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L879-L889)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L962-L975)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L992-L1005)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L950-L960)

contracts/TrenBoxManager.sol#L378-L413


 - [ ] ID-28
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L380-L409):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L390)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L400)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1001)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L401)
		- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L938)
	State variables written after the call(s):
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L405)
		- [depositSnapshots[_depositor].S[colls[i]] = 0](contracts/StabilityPool.sol#L960)
		- [depositorSnapshots.P = 0](contracts/StabilityPool.sol#L965)
		- [depositorSnapshots.G = 0](contracts/StabilityPool.sol#L966)
		- [depositorSnapshots.epoch = 0](contracts/StabilityPool.sol#L967)
		- [depositorSnapshots.scale = 0](contracts/StabilityPool.sol#L968)
		- [depositSnapshots[_depositor].S[asset] = currentS](contracts/StabilityPool.sol#L979)
		- [depositorSnapshots.P = currentP](contracts/StabilityPool.sol#L986)
		- [depositorSnapshots.G = currentG](contracts/StabilityPool.sol#L987)
		- [depositorSnapshots.scale = currentScaleCached](contracts/StabilityPool.sol#L988)
		- [depositorSnapshots.epoch = currentEpochCached](contracts/StabilityPool.sol#L989)
	[StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L207) can be used in cross function reentrancies:
	- [StabilityPool.S(address,address)](contracts/StabilityPool.sol#L994-L996)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L207)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L814-L826)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L670-L691)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L769-L777)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L405)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L953)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L197) can be used in cross function reentrancies:
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L380-L409)
	- [StabilityPool.deposits](contracts/StabilityPool.sol#L197)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L814-L826)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L670-L691)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L769-L777)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L401)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L654)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L190) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L652-L656)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L312-L314)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501)

contracts/StabilityPool.sol#L380-L409


 - [ ] ID-29
Reentrancy in [StabilityPool.provideToSP(uint256,address[])](contracts/StabilityPool.sol#L328-L363):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L340)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L348)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1001)
	- [_sendToStabilityPool(msg.sender,_amount)](contracts/StabilityPool.sol#L352)
		- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L887)
	State variables written after the call(s):
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L355)
		- [depositSnapshots[_depositor].S[colls[i]] = 0](contracts/StabilityPool.sol#L960)
		- [depositorSnapshots.P = 0](contracts/StabilityPool.sol#L965)
		- [depositorSnapshots.G = 0](contracts/StabilityPool.sol#L966)
		- [depositorSnapshots.epoch = 0](contracts/StabilityPool.sol#L967)
		- [depositorSnapshots.scale = 0](contracts/StabilityPool.sol#L968)
		- [depositSnapshots[_depositor].S[asset] = currentS](contracts/StabilityPool.sol#L979)
		- [depositorSnapshots.P = currentP](contracts/StabilityPool.sol#L986)
		- [depositorSnapshots.G = currentG](contracts/StabilityPool.sol#L987)
		- [depositorSnapshots.scale = currentScaleCached](contracts/StabilityPool.sol#L988)
		- [depositorSnapshots.epoch = currentEpochCached](contracts/StabilityPool.sol#L989)
	[StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L207) can be used in cross function reentrancies:
	- [StabilityPool.S(address,address)](contracts/StabilityPool.sol#L994-L996)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L207)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L814-L826)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L670-L691)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L769-L777)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L355)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L953)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L197) can be used in cross function reentrancies:
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L952-L992)
	- [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L380-L409)
	- [StabilityPool.deposits](contracts/StabilityPool.sol#L197)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L814-L826)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L670-L691)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L769-L777)
	- [_sendToStabilityPool(msg.sender,_amount)](contracts/StabilityPool.sol#L352)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L889)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L190) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L652-L656)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L312-L314)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501)

contracts/StabilityPool.sol#L328-L363


 - [ ] ID-30
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L492)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L500)
		- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L646)
		- [IDebtToken(debtToken).burn(address(this),_debtToOffset)](contracts/StabilityPool.sol#L648)
		- [IActivePool(activePool).sendAsset(_asset,address(this),_amount)](contracts/StabilityPool.sol#L649)
	State variables written after the call(s):
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L500)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L654)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L190) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L652-L656)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L312-L314)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501)

contracts/StabilityPool.sol#L480-L501


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-31
[TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L689) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L689


 - [ ] ID-32
[TrenBoxManagerOperations._getTotalsFromBatchLiquidate_NormalMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L593) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L593


 - [ ] ID-33
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(address,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L870) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L870


 - [ ] ID-34
[TrenBoxManagerOperations.batchLiquidateTrenBoxes(address,address[]).vars](contracts/TrenBoxManagerOperations.sol#L148) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L148


 - [ ] ID-35
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L740) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L740


 - [ ] ID-36
[TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L515) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L515


 - [ ] ID-37
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).vars](contracts/BorrowerOperations.sol#L101) is a local variable never initialized

contracts/BorrowerOperations.sol#L101


 - [ ] ID-38
[TrenBoxManagerOperations.liquidateTrenBoxes(address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L79) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L79


 - [ ] ID-39
[TRENStaking.increaseFee_Asset(address,uint256).assetFeePerTRENStaked](contracts/TREN/TRENStaking.sol#L209) is a local variable never initialized

contracts/TREN/TRENStaking.sol#L209


 - [ ] ID-40
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_NormalMode(address,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L654) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L654


 - [ ] ID-41
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256).totals](contracts/TrenBoxManagerOperations.sol#L220) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L220


 - [ ] ID-42
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256).zeroVals](contracts/TrenBoxManagerOperations.sol#L847) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L847


 - [ ] ID-43
[TRENStaking.increaseFee_DebtToken(uint256).feePerTRENStaked](contracts/TREN/TRENStaking.sol#L225) is a local variable never initialized

contracts/TREN/TRENStaking.sol#L225


 - [ ] ID-44
[BorrowerOperations._adjustTrenBox(address,uint256,address,uint256,uint256,bool,address,address).vars](contracts/BorrowerOperations.sol#L275) is a local variable never initialized

contracts/BorrowerOperations.sol#L275


## unused-return
Impact: Medium
Confidence: Medium
 - [ ] ID-45
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L152-L179) ignores return value by [IERC20(_tokenIn).approve(address(swapRouter),0)](contracts/FlashLoan.sol#L176)

contracts/FlashLoan.sol#L152-L179


 - [ ] ID-46
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L152-L179) ignores return value by [IERC20(_tokenIn).approve(address(swapRouter),_collAmountIn)](contracts/FlashLoan.sol#L154)

contracts/FlashLoan.sol#L152-L179


 - [ ] ID-47
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address)](contracts/BorrowerOperations.sol#L87-L173) ignores return value by [ITrenBoxManager(trenBoxManager).increaseTrenBoxColl(vars.asset,msg.sender,_assetAmount)](contracts/BorrowerOperations.sol#L140)

contracts/BorrowerOperations.sol#L87-L173


 - [ ] ID-48
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address)](contracts/BorrowerOperations.sol#L87-L173) ignores return value by [ITrenBoxManager(trenBoxManager).increaseTrenBoxDebt(vars.asset,msg.sender,vars.compositeDebt)](contracts/BorrowerOperations.sol#L141-L143)

contracts/BorrowerOperations.sol#L87-L173


 - [ ] ID-49
[PriceFeed._fetchChainlinkOracleResponse(address)](contracts/PriceFeed.sol#L156-L177) ignores return value by [(roundId,answer,updatedAt) = ChainlinkAggregatorV3Interface(_oracleAddress).latestRoundData()](contracts/PriceFeed.sol#L161-L176)

contracts/PriceFeed.sol#L156-L177


 - [ ] ID-50
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L71-L103) ignores return value by [(answer,updatedAt) = ChainlinkAggregatorV3Interface(sequencerUptimeFeedAddress).latestRoundData()](contracts/Pricing/PriceFeedL2.sol#L74-L82)

contracts/Pricing/PriceFeedL2.sol#L71-L103


 - [ ] ID-51
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) ignores return value by [ITrenBoxManager(trenBoxManager).updateBaseRateFromRedemption(_asset,totals.totalCollDrawn,totals.price,totals.totalDebtTokenSupplyAtStart)](contracts/TrenBoxManagerOperations.sol#L286-L288)

contracts/TrenBoxManagerOperations.sol#L207-L307


## events-access
Impact: Low
Confidence: Medium
 - [ ] ID-52
[TRENStaking.setAddresses(address,address,address,address,address)](contracts/TREN/TRENStaking.sol#L74-L95) should emit an event for: 
	- [feeCollectorAddress = _feeCollectorAddress](contracts/TREN/TRENStaking.sol#L87) 
	- [trenBoxManagerAddress = _trenBoxManagerAddress](contracts/TREN/TRENStaking.sol#L90) 

contracts/TREN/TRENStaking.sol#L74-L95


 - [ ] ID-53
[CommunityIssuance.setAdminContract(address)](contracts/TREN/CommunityIssuance.sol#L72-L75) should emit an event for: 
	- [adminContract = _admin](contracts/TREN/CommunityIssuance.sol#L74) 

contracts/TREN/CommunityIssuance.sol#L72-L75


 - [ ] ID-54
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L40-L64) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [trenBoxManagerOperations = _addresses[15]](contracts/Dependencies/AddressesConfigurable.sol#L61) 
	- [trenBoxManagerOperations = _addresses[15]](contracts/Dependencies/AddressesConfigurable.sol#L61) 

contracts/Dependencies/AddressesConfigurable.sol#L40-L64


 - [ ] ID-55
[CommunityIssuance.setAddresses(address,address,address)](contracts/TREN/CommunityIssuance.sol#L57-L70) should emit an event for: 
	- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L66) 

contracts/TREN/CommunityIssuance.sol#L57-L70


 - [ ] ID-56
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L40-L64) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/AddressesConfigurable.sol#L46) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 

contracts/Dependencies/AddressesConfigurable.sol#L40-L64


 - [ ] ID-57
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L40-L64) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/AddressesConfigurable.sol#L46) 
	- [adminContract = _addresses[1]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 

contracts/Dependencies/AddressesConfigurable.sol#L40-L64


 - [ ] ID-58
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L40-L64) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 

contracts/Dependencies/AddressesConfigurable.sol#L40-L64


 - [ ] ID-59
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L40-L64) should emit an event for: 
	- [timelockAddress = _addresses[12]](contracts/Dependencies/AddressesConfigurable.sol#L58) 

contracts/Dependencies/AddressesConfigurable.sol#L40-L64


 - [ ] ID-60
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L40-L64) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L48) 
	- [defaultPool = _addresses[5]](contracts/Dependencies/AddressesConfigurable.sol#L51) 
	- [stabilityPool = _addresses[11]](contracts/Dependencies/AddressesConfigurable.sol#L57) 
	- [stabilityPool = _addresses[11]](contracts/Dependencies/AddressesConfigurable.sol#L57) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L60) 
	- [trenBoxManagerOperations = _addresses[15]](contracts/Dependencies/AddressesConfigurable.sol#L61) 

contracts/Dependencies/AddressesConfigurable.sol#L40-L64


## events-maths
Impact: Low
Confidence: Medium
 - [ ] ID-61
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L81-L91) should emit an event for: 
	- [TRENSupplyCap -= _fundToRemove](contracts/TREN/CommunityIssuance.sol#L88) 

contracts/TREN/CommunityIssuance.sol#L81-L91


 - [ ] ID-62
[LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L43-L59) should emit an event for: 
	- [assignedTRENTokens += _totalSupply](contracts/TREN/LockedTREN.sol#L48) 

contracts/TREN/LockedTREN.sol#L43-L59


 - [ ] ID-63
[CommunityIssuance.setWeeklyTrenDistribution(uint256)](contracts/TREN/CommunityIssuance.sol#L152-L154) should emit an event for: 
	- [trenDistribution = _weeklyReward / DISTRIBUTION_DURATION](contracts/TREN/CommunityIssuance.sol#L153) 

contracts/TREN/CommunityIssuance.sol#L152-L154


## missing-zero-check
Impact: Low
Confidence: Medium
 - [ ] ID-64
[TRENStaking.setAddresses(address,address,address,address,address)._feeCollectorAddress](contracts/TREN/TRENStaking.sol#L76) lacks a zero-check on :
		- [feeCollectorAddress = _feeCollectorAddress](contracts/TREN/TRENStaking.sol#L87)

contracts/TREN/TRENStaking.sol#L76


 - [ ] ID-65
[Timelock.setPendingAdmin(address)._pendingAdmin](contracts/Timelock.sol#L105) lacks a zero-check on :
		- [pendingAdmin = _pendingAdmin](contracts/Timelock.sol#L109)

contracts/Timelock.sol#L105


 - [ ] ID-66
[TRENStaking.setAddresses(address,address,address,address,address)._debtTokenAddress](contracts/TREN/TRENStaking.sol#L75) lacks a zero-check on :
		- [debtTokenAddress = _debtTokenAddress](contracts/TREN/TRENStaking.sol#L86)

contracts/TREN/TRENStaking.sol#L75


 - [ ] ID-67
[TRENStaking.setAddresses(address,address,address,address,address)._trenBoxManagerAddress](contracts/TREN/TRENStaking.sol#L79) lacks a zero-check on :
		- [trenBoxManagerAddress = _trenBoxManagerAddress](contracts/TREN/TRENStaking.sol#L90)

contracts/TREN/TRENStaking.sol#L79


 - [ ] ID-68
[TRENStaking.setAddresses(address,address,address,address,address)._treasuryAddress](contracts/TREN/TRENStaking.sol#L78) lacks a zero-check on :
		- [treasuryAddress = _treasuryAddress](contracts/TREN/TRENStaking.sol#L89)

contracts/TREN/TRENStaking.sol#L78


 - [ ] ID-69
[Timelock.executeTransaction(address,uint256,string,bytes,uint256).target](contracts/Timelock.sol#L159) lacks a zero-check on :
		- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L192)

contracts/Timelock.sol#L159


 - [ ] ID-70
[FlashLoanTester.setFlashLoanAddress(address)._flashLoan](contracts/TestContracts/FlashLoanTester.sol#L12) lacks a zero-check on :
		- [flashLoan = _flashLoan](contracts/TestContracts/FlashLoanTester.sol#L13)

contracts/TestContracts/FlashLoanTester.sol#L12


 - [ ] ID-71
[AddressesConfigurable.setTRENStaking(address)._trenStaking](contracts/Dependencies/AddressesConfigurable.sol#L70) lacks a zero-check on :
		- [trenStaking = _trenStaking](contracts/Dependencies/AddressesConfigurable.sol#L71)

contracts/Dependencies/AddressesConfigurable.sol#L70


 - [ ] ID-72
[AddressesConfigurable.setCommunityIssuance(address)._communityIssuance](contracts/Dependencies/AddressesConfigurable.sol#L66) lacks a zero-check on :
		- [communityIssuance = _communityIssuance](contracts/Dependencies/AddressesConfigurable.sol#L67)

contracts/Dependencies/AddressesConfigurable.sol#L66


 - [ ] ID-73
[CommunityIssuance.setAddresses(address,address,address)._adminContract](contracts/TREN/CommunityIssuance.sol#L60) lacks a zero-check on :
		- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L66)

contracts/TREN/CommunityIssuance.sol#L60


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-74
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [newNICR != _partialRedemptionHintNICR || _getNetDebt(_asset,newDebt) < IAdminContract(adminContract).getMinNetDebt(_asset)](contracts/TrenBoxManagerOperations.sol#L1112-L1114)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-75
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executePartialRedemption(_asset,_borrower,newDebt,newColl,newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManagerOperations.sol#L1120-L1128)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-76
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingAssetReward(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L399-L404)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-77
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executeFullRedemption(_asset,_borrower,newColl)](contracts/TrenBoxManagerOperations.sol#L1100)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-78
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(vars.asset,currentTrenBoxBorrower,vars.price) < IAdminContract(adminContract).getMcr(vars.asset)](contracts/TrenBoxManagerOperations.sol#L363-L366)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-79
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxNetDebt = _getNetDebt(vars.asset,ITrenBoxManager(trenBoxManager).getTrenBoxDebt(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingDebtTokenReward(vars.asset,currentTrenBoxBorrower))](contracts/TrenBoxManagerOperations.sol#L381-L387)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-80
[SafetyTransfer.decimalsCorrection(address,uint256)](contracts/Dependencies/SafetyTransfer.sol#L12-L31) has external calls inside a loop: [decimals = IERC20Decimals(_token).decimals()](contracts/Dependencies/SafetyTransfer.sol#L19)

contracts/Dependencies/SafetyTransfer.sol#L12-L31


 - [ ] ID-81
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [maxRedeemableDebt = TrenMath._min(remainingDebt,currentTrenBoxNetDebt - IAdminContract(adminContract).getMinNetDebt(vars.asset))](contracts/TrenBoxManagerOperations.sol#L394-L398)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-82
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L257)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-83
[TrenBase._getCompositeDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L29-L31) has external calls inside a loop: [_debt + IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L30)

contracts/Dependencies/TrenBase.sol#L29-L31


 - [ ] ID-84
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [nextUserToCheck = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L254-L255)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-85
[TrenBase._getNetDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L33-L35) has external calls inside a loop: [_debt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L34)

contracts/Dependencies/TrenBase.sol#L33-L35


 - [ ] ID-86
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L439-L483) has external calls inside a loop: [currentAddress = ITrenBoxManager(trenBoxManager).getTrenBoxFromTrenBoxOwnersArray(_asset,arrayIndex)](contracts/TrenBoxManagerOperations.sol#L468-L469)

contracts/TrenBoxManagerOperations.sol#L439-L483


 - [ ] ID-87
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [singleRedemption.debtLot = TrenMath._min(_maxDebtTokenAmount,trenBoxDebt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset))](contracts/TrenBoxManagerOperations.sol#L1081-L1084)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-88
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [trenBoxDebt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1076)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-89
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [trenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1077)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-90
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [currentBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L241)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-91
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [newDebt == IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/TrenBoxManagerOperations.sol#L1099)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-92
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxNetDebt > IAdminContract(adminContract).getMinNetDebt(vars.asset)](contracts/TrenBoxManagerOperations.sol#L392)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-93
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L368-L369)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-94
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [currentBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(_asset,currentBorrower,totals.price) < IAdminContract(adminContract).getMcr(_asset)](contracts/TrenBoxManagerOperations.sol#L236-L239)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-95
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L362-L371) has external calls inside a loop: [ITRENStaking(trenStaking).increaseFee_DebtToken(_feeAmount)](contracts/FeeCollector.sol#L367)

contracts/FeeCollector.sol#L362-L371


 - [ ] ID-96
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L420-L421)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-97
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L439-L483) has external calls inside a loop: [currentNICR = ITrenBoxManager(trenBoxManager).getNominalICR(_asset,currentAddress)](contracts/TrenBoxManagerOperations.sol#L470-L471)

contracts/TrenBoxManagerOperations.sol#L439-L483


## reentrancy-benign
Impact: Low
Confidence: Medium
 - [ ] ID-98
Reentrancy in [StabilityPool._sendToStabilityPool(address,uint256)](contracts/StabilityPool.sol#L886-L891):
	External calls:
	- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L887)
	State variables written after the call(s):
	- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L889)

contracts/StabilityPool.sol#L886-L891


 - [ ] ID-99
Reentrancy in [TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L525-L581):
	External calls:
	- [IStabilityPool(stabilityPool).offset(_debtToOffset,_asset,_collToSendToStabilityPool)](contracts/TrenBoxManager.sol#L537)
	State variables written after the call(s):
	- [L_Colls[_asset] = liquidatedColl](contracts/TrenBoxManager.sol#L574)
	- [L_Debts[_asset] = liquidatedDebt](contracts/TrenBoxManager.sol#L575)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L566-L567)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L568-L569)

contracts/TrenBoxManager.sol#L525-L581


 - [ ] ID-100
Reentrancy in [StabilityPool._sendToDepositor(address,uint256)](contracts/StabilityPool.sol#L934-L940):
	External calls:
	- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L938)
	State variables written after the call(s):
	- [_decreaseDebtTokens(debtTokenWithdrawal)](contracts/StabilityPool.sol#L939)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L654)

contracts/StabilityPool.sol#L934-L940


 - [ ] ID-101
Reentrancy in [StabilityPool._sendGainsToDepositor(address,address[],uint256[])](contracts/StabilityPool.sol#L902-L931):
	External calls:
	- [IERC20(asset).safeTransfer(_to,amount)](contracts/StabilityPool.sol#L925)
	State variables written after the call(s):
	- [totalColl.amounts = _leftSubColls(totalColl,assets,amounts)](contracts/StabilityPool.sol#L930)

contracts/StabilityPool.sol#L902-L931


 - [ ] ID-102
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L391-L393)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L398)
	State variables written after the call(s):
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L403)
		- [totalStakes[_asset] = newTotal](contracts/TrenBoxManager.sol#L747)

contracts/TrenBoxManager.sol#L378-L413


 - [ ] ID-103
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L413-L418):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	State variables written after the call(s):
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L416)
		- [epochToScaleToG[currentEpoch][currentScale] = newEpochToScaleToG](contracts/StabilityPool.sol#L437)
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L416)
		- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L464)

contracts/StabilityPool.sol#L413-L418


 - [ ] ID-104
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L639-L650):
	External calls:
	- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L646)
	State variables written after the call(s):
	- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L647)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L654)

contracts/StabilityPool.sol#L639-L650


 - [ ] ID-105
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L492)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	State variables written after the call(s):
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
		- [epochToScaleToSum[_asset][currentEpochCached][currentScaleCached] = newS](contracts/StabilityPool.sol#L594)
	- [(collGainPerUnitStaked,debtLossPerUnitStaked) = _computeRewardsPerUnitStaked(_asset,_amountAdded,_debtToOffset,cachedTotalDebtTokenDeposits)](contracts/StabilityPool.sol#L493-L496)
		- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L554-L555)
	- [(collGainPerUnitStaked,debtLossPerUnitStaked) = _computeRewardsPerUnitStaked(_asset,_amountAdded,_debtToOffset,cachedTotalDebtTokenDeposits)](contracts/StabilityPool.sol#L493-L496)
		- [lastDebtTokenLossError_Offset = 0](contracts/StabilityPool.sol#L542)
		- [lastDebtTokenLossError_Offset = (debtLossPerUnitStaked * _totalDeposits) - lossNumerator](contracts/StabilityPool.sol#L551)

contracts/StabilityPool.sol#L480-L501


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-106
Reentrancy in [TrenBoxManager.closeTrenBoxLiquidation(address,address)](contracts/TrenBoxManager.sol#L610-L623):
	External calls:
	- [_closeTrenBox(_asset,_borrower,Status.closedByLiquidation)](contracts/TrenBoxManager.sol#L618)
		- [ISortedTrenBoxes(sortedTrenBoxes).remove(_asset,_borrower)](contracts/TrenBoxManager.sol#L798)
	- [IFeeCollector(feeCollector).liquidateDebt(_borrower,_asset)](contracts/TrenBoxManager.sol#L619)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,_borrower,0,0,0,TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManager.sol#L620-L622)

contracts/TrenBoxManager.sol#L610-L623


 - [ ] ID-107
Reentrancy in [TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L681-L727):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L697-L699)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L700)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L718)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L719-L725)

contracts/TrenBoxManagerOperations.sol#L681-L727


 - [ ] ID-108
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L729-L852):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L784-L786)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L787)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L798)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L799-L805)

contracts/TrenBoxManagerOperations.sol#L729-L852


 - [ ] ID-109
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L729-L852):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L760-L762)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L763)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L770)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L771-L777)

contracts/TrenBoxManagerOperations.sol#L729-L852


 - [ ] ID-110
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L391-L393)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L398)
	Event emitted after the call(s):
	- [TotalStakesUpdated(_asset,newTotal)](contracts/TrenBoxManager.sol#L748)
		- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L403)
	- [TrenBoxUpdated(_asset,_borrower,_newDebt,_newColl,trenBox.stake,TrenBoxManagerOperation.redeemCollateral)](contracts/TrenBoxManager.sol#L405-L412)

contracts/TrenBoxManager.sol#L378-L413


 - [ ] ID-111
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L413-L418):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	Event emitted after the call(s):
	- [GainsUpdated(newEpochToScaleToG,currentEpoch,currentScale)](contracts/StabilityPool.sol#L438)
		- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L416)

contracts/StabilityPool.sol#L413-L418


 - [ ] ID-112
Reentrancy in [StabilityPool._payOutTRENGains(address)](contracts/StabilityPool.sol#L998-L1004):
	External calls:
	- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1001)
	Event emitted after the call(s):
	- [TRENPaidToDepositor(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1002)

contracts/StabilityPool.sol#L998-L1004


 - [ ] ID-113
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L492)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	Event emitted after the call(s):
	- [EpochUpdated(currentEpochCached)](contracts/StabilityPool.sol#L601)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
	- [ProductUpdated(newP)](contracts/StabilityPool.sol#L627)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
	- [ScaleUpdated(0)](contracts/StabilityPool.sol#L603)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
	- [ScaleUpdated(currentScaleCached)](contracts/StabilityPool.sol#L616)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
	- [SumUpdated(_asset,newS,currentEpochCached,currentScaleCached)](contracts/StabilityPool.sol#L595)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)

contracts/StabilityPool.sol#L480-L501


 - [ ] ID-114
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L380-L409):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L390)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L400)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1001)
	Event emitted after the call(s):
	- [TRENPaidToDepositor(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1002)
		- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L400)

contracts/StabilityPool.sol#L380-L409


 - [ ] ID-115
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L729-L852):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L818-L820)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L823)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L831)
	- [ICollSurplusPool(collSurplusPool).accountSurplus(_asset,_borrower,singleLiquidation.collSurplus)](contracts/TrenBoxManagerOperations.sol#L833-L835)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L837-L843)

contracts/TrenBoxManagerOperations.sol#L729-L852


 - [ ] ID-116
Reentrancy in [BorrowerOperations.openTrenBox(address,uint256,uint256,address,address)](contracts/BorrowerOperations.sol#L87-L173):
	External calls:
	- [vars.debtTokenFee = _triggerBorrowingFee(vars.asset,_debtTokenAmount)](contracts/BorrowerOperations.sol#L112)
		- [IDebtToken(debtToken).mint(_asset,feeCollector,debtTokenFee)](contracts/BorrowerOperations.sol#L443)
		- [IFeeCollector(feeCollector).increaseDebt(msg.sender,_asset,debtTokenFee)](contracts/BorrowerOperations.sol#L444)
	- [ITrenBoxManager(trenBoxManager).setTrenBoxStatus(vars.asset,msg.sender,1)](contracts/BorrowerOperations.sol#L138)
	- [ITrenBoxManager(trenBoxManager).increaseTrenBoxColl(vars.asset,msg.sender,_assetAmount)](contracts/BorrowerOperations.sol#L140)
	- [ITrenBoxManager(trenBoxManager).increaseTrenBoxDebt(vars.asset,msg.sender,vars.compositeDebt)](contracts/BorrowerOperations.sol#L141-L143)
	- [ITrenBoxManager(trenBoxManager).updateTrenBoxRewardSnapshots(vars.asset,msg.sender)](contracts/BorrowerOperations.sol#L145)
	- [vars.stake = ITrenBoxManager(trenBoxManager).updateStakeAndTotalStakes(vars.asset,msg.sender)](contracts/BorrowerOperations.sol#L146-L147)
	- [ISortedTrenBoxes(sortedTrenBoxes).insert(vars.asset,msg.sender,vars.NICR,_upperHint,_lowerHint)](contracts/BorrowerOperations.sol#L149-L151)
	- [vars.arrayIndex = ITrenBoxManager(trenBoxManager).addTrenBoxOwnerToArray(vars.asset,msg.sender)](contracts/BorrowerOperations.sol#L152-L153)
	Event emitted after the call(s):
	- [TrenBoxCreated(vars.asset,msg.sender,vars.arrayIndex)](contracts/BorrowerOperations.sol#L154)

contracts/BorrowerOperations.sol#L87-L173


 - [ ] ID-117
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L480-L501):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L492)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L500)
		- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L646)
		- [IDebtToken(debtToken).burn(address(this),_debtToOffset)](contracts/StabilityPool.sol#L648)
		- [IActivePool(activePool).sendAsset(_asset,address(this),_amount)](contracts/StabilityPool.sol#L649)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L655)
		- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L500)

contracts/StabilityPool.sol#L480-L501


 - [ ] ID-118
Reentrancy in [TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[])](contracts/TrenBoxManagerOperations.sol#L506-L582):
	External calls:
	- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L550-L552)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L760-L762)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L763)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L770)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L784-L786)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L787)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L798)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L818-L820)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L823)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L831)
		- [ICollSurplusPool(collSurplusPool).accountSurplus(_asset,_borrower,singleLiquidation.collSurplus)](contracts/TrenBoxManagerOperations.sol#L833-L835)
	- [singleLiquidation = _liquidateNormalMode(_asset,vars.user,vars.remainingDebtTokenInStabPool)](contracts/TrenBoxManagerOperations.sol#L570-L571)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L697-L699)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L700)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L718)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L719-L725)
		- [singleLiquidation = _liquidateNormalMode(_asset,vars.user,vars.remainingDebtTokenInStabPool)](contracts/TrenBoxManagerOperations.sol#L570-L571)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L771-L777)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L550-L552)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L799-L805)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L550-L552)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L837-L843)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L550-L552)

contracts/TrenBoxManagerOperations.sol#L506-L582


 - [ ] ID-119
Reentrancy in [FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L373-L378):
	External calls:
	- [IERC20(debtToken).safeTransfer(_borrower,_refundAmount)](contracts/FeeCollector.sol#L375)
	Event emitted after the call(s):
	- [FeeRefunded(_borrower,_asset,_refundAmount)](contracts/FeeCollector.sol#L376)

contracts/FeeCollector.sol#L373-L378


 - [ ] ID-120
Reentrancy in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L158-L200):
	External calls:
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L192)
	Event emitted after the call(s):
	- [ExecuteTransaction(txHash,target,value,signature,data,eta)](contracts/Timelock.sol#L197)

contracts/Timelock.sol#L158-L200


 - [ ] ID-121
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L639-L650):
	External calls:
	- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L646)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L655)
		- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L647)

contracts/StabilityPool.sol#L639-L650


 - [ ] ID-122
Reentrancy in [BorrowerOperations.closeTrenBox(address)](contracts/BorrowerOperations.sol#L387-L423):
	External calls:
	- [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,msg.sender)](contracts/BorrowerOperations.sol#L392)
	- [refund = IFeeCollector(feeCollector).simulateRefund(msg.sender,_asset,1000000000000000000)](contracts/BorrowerOperations.sol#L398)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,msg.sender)](contracts/BorrowerOperations.sol#L406)
	- [ITrenBoxManager(trenBoxManager).closeTrenBox(_asset,msg.sender)](contracts/BorrowerOperations.sol#L407)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,msg.sender,0,0,0,BorrowerOperation.closeTrenBox)](contracts/BorrowerOperations.sol#L409)

contracts/BorrowerOperations.sol#L387-L423


 - [ ] ID-123
Reentrancy in [TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307):
	External calls:
	- [ITrenBoxManager(trenBoxManager).isValidFirstRedemptionHint(_asset,_firstRedemptionHint,totals.price)](contracts/TrenBoxManagerOperations.sol#L227-L229)
	- [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L257)
	- [singleRedemption = _redeemCollateralFromTrenBox(_asset,currentBorrower,totals.remainingDebt,totals.price,_upperPartialRedemptionHint,_lowerPartialRedemptionHint,_partialRedemptionHintNICR)](contracts/TrenBoxManagerOperations.sol#L259-L267)
		- [ITrenBoxManager(trenBoxManager).executeFullRedemption(_asset,_borrower,newColl)](contracts/TrenBoxManagerOperations.sol#L1100)
		- [ITrenBoxManager(trenBoxManager).executePartialRedemption(_asset,_borrower,newDebt,newColl,newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManagerOperations.sol#L1120-L1128)
	- [ITrenBoxManager(trenBoxManager).updateBaseRateFromRedemption(_asset,totals.totalCollDrawn,totals.price,totals.totalDebtTokenSupplyAtStart)](contracts/TrenBoxManagerOperations.sol#L286-L288)
	- [ITrenBoxManager(trenBoxManager).finalizeRedemption(_asset,msg.sender,totals.totalDebtToRedeem,totals.collFee,totals.totalCollDrawn)](contracts/TrenBoxManagerOperations.sol#L296-L298)
	Event emitted after the call(s):
	- [Redemption(_asset,_debtTokenAmount,totals.totalDebtToRedeem,totals.totalCollDrawn,totals.collFee)](contracts/TrenBoxManagerOperations.sol#L300-L306)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-124
Reentrancy in [StabilityPool._sendToDepositor(address,uint256)](contracts/StabilityPool.sol#L934-L940):
	External calls:
	- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L938)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L655)
		- [_decreaseDebtTokens(debtTokenWithdrawal)](contracts/StabilityPool.sol#L939)

contracts/StabilityPool.sol#L934-L940


 - [ ] ID-125
Reentrancy in [FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L362-L371):
	External calls:
	- [IERC20(debtToken).safeTransfer(collector,_feeAmount)](contracts/FeeCollector.sol#L365)
	- [ITRENStaking(trenStaking).increaseFee_DebtToken(_feeAmount)](contracts/FeeCollector.sol#L367)
	Event emitted after the call(s):
	- [FeeCollected(_borrower,_asset,collector,_feeAmount)](contracts/FeeCollector.sol#L369)

contracts/FeeCollector.sol#L362-L371


 - [ ] ID-126
Reentrancy in [DefaultPool.sendAssetToActivePool(address,uint256)](contracts/DefaultPool.sol#L81-L102):
	External calls:
	- [IERC20(_asset).safeTransfer(activePool,safetyTransferAmount)](contracts/DefaultPool.sol#L97)
	- [IDeposit(activePool).receivedERC20(_asset,_amount)](contracts/DefaultPool.sol#L98)
	Event emitted after the call(s):
	- [AssetSent(activePool,_asset,safetyTransferAmount)](contracts/DefaultPool.sol#L101)
	- [DefaultPoolAssetBalanceUpdated(_asset,newBalance)](contracts/DefaultPool.sol#L100)

contracts/DefaultPool.sol#L81-L102


 - [ ] ID-127
Reentrancy in [FeeCollector.handleRedemptionFee(address,uint256)](contracts/FeeCollector.sol#L196-L201):
	External calls:
	- [ITRENStaking(trenStaking).increaseFee_Asset(_asset,_amount)](contracts/FeeCollector.sol#L198)
	Event emitted after the call(s):
	- [RedemptionFeeCollected(_asset,_amount)](contracts/FeeCollector.sol#L200)

contracts/FeeCollector.sol#L196-L201


 - [ ] ID-128
Reentrancy in [AdminContract.addNewCollateral(address,uint256,uint256)](contracts/AdminContract.sol#L118-L150):
	External calls:
	- [IStabilityPool(stabilityPool).addCollateralType(_collateral)](contracts/AdminContract.sol#L146)
	Event emitted after the call(s):
	- [CollateralAdded(_collateral)](contracts/AdminContract.sol#L149)

contracts/AdminContract.sol#L118-L150


 - [ ] ID-129
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L380-L409):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L390)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L400)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1001)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L401)
		- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L938)
	Event emitted after the call(s):
	- [DepositSnapshotUpdated(_depositor,0,0)](contracts/StabilityPool.sol#L969)
		- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L405)
	- [DepositSnapshotUpdated(_depositor,currentP,currentG)](contracts/StabilityPool.sol#L991)
		- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L405)
	- [GainsWithdrawn(msg.sender,assets,amounts,loss)](contracts/StabilityPool.sol#L408)
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L655)
		- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L401)
	- [UserDepositChanged(msg.sender,newDeposit)](contracts/StabilityPool.sol#L406)

contracts/StabilityPool.sol#L380-L409


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-130
[TrenBoxManager._updateLastFeeOpTime(address)](contracts/TrenBoxManager.sol#L856-L864) uses timestamp for comparisons
	Dangerous comparisons:
	- [timePassed >= SECONDS_IN_ONE_MINUTE](contracts/TrenBoxManager.sol#L858)

contracts/TrenBoxManager.sol#L856-L864


 - [ ] ID-131
[FeeCollector._updateFeeRecord(address,address,uint256,IFeeCollector.FeeRecord)](contracts/FeeCollector.sol#L281-L305) uses timestamp for comparisons
	Dangerous comparisons:
	- [NOW < _sRecord.from](contracts/FeeCollector.sol#L291)

contracts/FeeCollector.sol#L281-L305


 - [ ] ID-132
[LockedTREN.isEntityExits(address)](contracts/TREN/LockedTREN.sol#L133-L135) uses timestamp for comparisons
	Dangerous comparisons:
	- [entitiesVesting[_entity].createdDate != 0](contracts/TREN/LockedTREN.sol#L134)

contracts/TREN/LockedTREN.sol#L133-L135


 - [ ] ID-133
[LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L43-L59) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(entitiesVesting[_entity].createdDate == 0,Entity already has a Vesting Rule)](contracts/TREN/LockedTREN.sol#L46)

contracts/TREN/LockedTREN.sol#L43-L59


 - [ ] ID-134
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L93-L102) uses timestamp for comparisons
	Dangerous comparisons:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L95)

contracts/TREN/LockedTREN.sol#L93-L102


 - [ ] ID-135
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L133-L139) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(lastUpdateTime != 0,Stability pool hasn't been assigned)](contracts/TREN/CommunityIssuance.sol#L134)

contracts/TREN/CommunityIssuance.sol#L133-L139


 - [ ] ID-136
[Timelock.queueTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L114-L137) uses timestamp for comparisons
	Dangerous comparisons:
	- [eta < block.timestamp + delay || eta > block.timestamp + delay + GRACE_PERIOD](contracts/Timelock.sol#L125)

contracts/Timelock.sol#L114-L137


 - [ ] ID-137
[FeeCollector._createOrUpdateFeeRecord(address,address,uint256)](contracts/FeeCollector.sol#L244-L263) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= block.timestamp](contracts/FeeCollector.sol#L256)

contracts/FeeCollector.sol#L244-L263


 - [ ] ID-138
[CommunityIssuance.issueTREN()](contracts/TREN/CommunityIssuance.sol#L113-L131) uses timestamp for comparisons
	Dangerous comparisons:
	- [totalTRENIssued >= maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L116)
	- [totalIssuance > maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L121)

contracts/TREN/CommunityIssuance.sol#L113-L131


 - [ ] ID-139
[TrenBoxManagerOperations._validateRedemptionRequirements(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L1028-L1060) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionBlockTimestamp > block.timestamp](contracts/TrenBoxManagerOperations.sol#L1039)

contracts/TrenBoxManagerOperations.sol#L1028-L1060


 - [ ] ID-140
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L81-L91) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(totalTRENIssued <= newCap,CommunityIssuance: Stability Pool doesn't have enough supply.)](contracts/TREN/CommunityIssuance.sol#L83-L86)

contracts/TREN/CommunityIssuance.sol#L81-L91


 - [ ] ID-141
[FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L373-L378) uses timestamp for comparisons
	Dangerous comparisons:
	- [_refundAmount != 0](contracts/FeeCollector.sol#L374)

contracts/FeeCollector.sol#L373-L378


 - [ ] ID-142
[TrenBoxManager.updateBaseRateFromRedemption(address,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L441-L461) uses timestamp for comparisons
	Dangerous comparisons:
	- [assert(bool)(newBaseRate != 0)](contracts/TrenBoxManager.sol#L456)

contracts/TrenBoxManager.sol#L441-L461


 - [ ] ID-143
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L112-L127) uses timestamp for comparisons
	Dangerous comparisons:
	- [entityRule.startVestingDate > block.timestamp](contracts/TREN/LockedTREN.sol#L116)
	- [block.timestamp >= entityRule.endVestingDate](contracts/TREN/LockedTREN.sol#L118)

contracts/TREN/LockedTREN.sol#L112-L127


 - [ ] ID-144
[PriceFeed._isStalePrice(uint256,uint256)](contracts/PriceFeed.sol#L145-L154) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp - _priceTimestamp > _oracleTimeoutSeconds](contracts/PriceFeed.sol#L153)

contracts/PriceFeed.sol#L145-L154


 - [ ] ID-145
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L362-L371) uses timestamp for comparisons
	Dangerous comparisons:
	- [_feeAmount != 0](contracts/FeeCollector.sol#L363)

contracts/FeeCollector.sol#L362-L371


 - [ ] ID-146
[Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L158-L200) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < eta](contracts/Timelock.sol#L174)
	- [block.timestamp > eta + GRACE_PERIOD](contracts/Timelock.sol#L177)

contracts/Timelock.sol#L158-L200


 - [ ] ID-147
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L319-L341) uses timestamp for comparisons
	Dangerous comparisons:
	- [_from > NOW](contracts/FeeCollector.sol#L329)
	- [NOW >= _to](contracts/FeeCollector.sol#L332)

contracts/FeeCollector.sol#L319-L341


 - [ ] ID-148
[FeeCollector._decreaseDebt(address,address,uint256)](contracts/FeeCollector.sol#L210-L242) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= NOW](contracts/FeeCollector.sol#L218)

contracts/FeeCollector.sol#L210-L242


 - [ ] ID-149
[FeeCollector.collectFees(address[],address[])](contracts/FeeCollector.sol#L161-L189) uses timestamp for comparisons
	Dangerous comparisons:
	- [expiredAmount > 0](contracts/FeeCollector.sol#L178)

contracts/FeeCollector.sol#L161-L189


 - [ ] ID-150
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L71-L103) uses timestamp for comparisons
	Dangerous comparisons:
	- [timeSinceSequencerUp <= delay](contracts/Pricing/PriceFeedL2.sol#L99)

contracts/Pricing/PriceFeedL2.sol#L71-L103


 - [ ] ID-151
[FeeCollector.simulateRefund(address,address,uint256)](contracts/FeeCollector.sol#L113-L137) uses timestamp for comparisons
	Dangerous comparisons:
	- [record.amount == 0 || record.to < block.timestamp](contracts/FeeCollector.sol#L126)

contracts/FeeCollector.sol#L113-L137


 - [ ] ID-152
[PriceFeed._fetchOracleScaledPrice(IPriceFeed.OracleRecord)](contracts/PriceFeed.sol#L128-L143) uses timestamp for comparisons
	Dangerous comparisons:
	- [oraclePrice != 0 && ! _isStalePrice(priceTimestamp,oracle.timeoutSeconds)](contracts/PriceFeed.sol#L139)

contracts/PriceFeed.sol#L128-L143


 - [ ] ID-153
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L152-L179) uses timestamp for comparisons
	Dangerous comparisons:
	- [amountIn < _collAmountIn](contracts/FlashLoan.sol#L175)

contracts/FlashLoan.sol#L152-L179


 - [ ] ID-154
[TrenBoxManager._calcRedemptionFee(uint256,uint256)](contracts/TrenBoxManager.sol#L841-L854) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionFee >= _assetDraw](contracts/TrenBoxManager.sol#L850)

contracts/TrenBoxManager.sol#L841-L854


 - [ ] ID-155
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L104-L111) uses timestamp for comparisons
	Dangerous comparisons:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L105)

contracts/TREN/CommunityIssuance.sol#L104-L111


 - [ ] ID-156
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L104-L110) uses timestamp for comparisons
	Dangerous comparisons:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L107)

contracts/TREN/LockedTREN.sol#L104-L110


## assembly
Impact: Informational
Confidence: High
 - [ ] ID-157
[BytesLib.toAddress(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L62-L72) uses assembly
	- [INLINE ASM](contracts/TestContracts/MockUniswapRouterV3.sol#L67-L69)

contracts/TestContracts/MockUniswapRouterV3.sol#L62-L72


 - [ ] ID-158
[BytesLib.toUint24(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L74-L84) uses assembly
	- [INLINE ASM](contracts/TestContracts/MockUniswapRouterV3.sol#L79-L81)

contracts/TestContracts/MockUniswapRouterV3.sol#L74-L84


## dead-code
Impact: Informational
Confidence: Medium
 - [ ] ID-159
[BorrowerOperations._getUSDValue(uint256,uint256)](contracts/BorrowerOperations.sol#L448-L450) is never used and should be removed

contracts/BorrowerOperations.sol#L448-L450


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-160
Low level call in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L158-L200):
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L192)

contracts/Timelock.sol#L158-L200


## similar-names
Impact: Informational
Confidence: Medium
 - [ ] ID-161
Variable [AdminContract.setPercentDivisor(address,uint256).percentDivisor](contracts/AdminContract.sol#L250) is too similar to [IAdminContract.setPercentDivisor(address,uint256).precentDivisor](contracts/Interfaces/IAdminContract.sol#L90)

contracts/AdminContract.sol#L250


 - [ ] ID-162
Variable [IAdminContract.setCollateralParameters(address,uint256,uint256,uint256,uint256,uint256,uint256,uint256).percentDivisor](contracts/Interfaces/IAdminContract.sol#L79) is too similar to [IAdminContract.setPercentDivisor(address,uint256).precentDivisor](contracts/Interfaces/IAdminContract.sol#L90)

contracts/Interfaces/IAdminContract.sol#L79


 - [ ] ID-163
Variable [AdminContract.CCR_DEFAULT](contracts/AdminContract.sol#L28) is too similar to [AdminContract.MCR_DEFAULT](contracts/AdminContract.sol#L29)

contracts/AdminContract.sol#L28


 - [ ] ID-164
Variable [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound1](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L70) is too similar to [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound2](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L79)

contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L70


 - [ ] ID-165
Variable [AdminContract.setCollateralParameters(address,uint256,uint256,uint256,uint256,uint256,uint256,uint256).percentDivisor](contracts/AdminContract.sol#L159) is too similar to [IAdminContract.setPercentDivisor(address,uint256).precentDivisor](contracts/Interfaces/IAdminContract.sol#L90)

contracts/AdminContract.sol#L159


## too-many-digits
Impact: Informational
Confidence: Medium
 - [ ] ID-166
[BytesLib.toAddress(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L62-L72) uses literals with too many digits:
	- [tempAddress = mload(uint256)(_bytes + 0x20 + _start) / 0x1000000000000000000000000](contracts/TestContracts/MockUniswapRouterV3.sol#L68)

contracts/TestContracts/MockUniswapRouterV3.sol#L62-L72


## constable-states
Impact: Optimization
Confidence: High
 - [ ] ID-167
[TrenBoxManager.isSetupInitialized](contracts/TrenBoxManager.sol#L101) should be constant 

contracts/TrenBoxManager.sol#L101


 - [ ] ID-168
[TRENToken._1_MILLION](contracts/TREN/TRENToken.sol#L12) should be constant 

contracts/TREN/TRENToken.sol#L12


