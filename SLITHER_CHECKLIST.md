Summary
 - [arbitrary-send-erc20](#arbitrary-send-erc20) (1 results) (High)
 - [unchecked-transfer](#unchecked-transfer) (9 results) (High)
 - [uninitialized-state](#uninitialized-state) (1 results) (High)
 - [divide-before-multiply](#divide-before-multiply) (8 results) (Medium)
 - [incorrect-equality](#incorrect-equality) (6 results) (Medium)
 - [reentrancy-no-eth](#reentrancy-no-eth) (5 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (13 results) (Medium)
 - [unused-return](#unused-return) (4 results) (Medium)
 - [events-access](#events-access) (9 results) (Low)
 - [events-maths](#events-maths) (2 results) (Low)
 - [missing-zero-check](#missing-zero-check) (1 results) (Low)
 - [calls-loop](#calls-loop) (26 results) (Low)
 - [reentrancy-benign](#reentrancy-benign) (8 results) (Low)
 - [reentrancy-events](#reentrancy-events) (18 results) (Low)
 - [timestamp](#timestamp) (26 results) (Low)
 - [assembly](#assembly) (2 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
 - [similar-names](#similar-names) (2 results) (Informational)
 - [too-many-digits](#too-many-digits) (1 results) (Informational)
## arbitrary-send-erc20
Impact: High
Confidence: High
 - [ ] ID-0
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) uses arbitrary from in transferFrom: [IERC20(assetToken).transferFrom(params.recipient,address(this),assetTokensNeededPlusFee)](contracts/TestContracts/MockUniswapRouterV3.sol#L38)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


## unchecked-transfer
Impact: High
Confidence: Medium
 - [ ] ID-1
[MockBorrowerOperations.repayDebtTokens(address,uint256,address,address)](contracts/TestContracts/MockBorrowerOperations.sol#L9-L18) ignores return value by [IERC20(_asset).transfer(msg.sender,IERC20(_asset).balanceOf(address(this)))](contracts/TestContracts/MockBorrowerOperations.sol#L17)

contracts/TestContracts/MockBorrowerOperations.sol#L9-L18


 - [ ] ID-2
[FlashLoan.flashLoan(uint256)](contracts/FlashLoan.sol#L62-L86) ignores return value by [IDebtToken(debtToken).transfer(msg.sender,_amount)](contracts/FlashLoan.sol#L74)

contracts/FlashLoan.sol#L62-L86


 - [ ] ID-3
[FlashLoanTester.executeOperation(uint256,uint256,address)](contracts/TestContracts/FlashLoanTester.sol#L20-L24) ignores return value by [IERC20(_tokenAddress).transfer(msg.sender,_amount + _fee)](contracts/TestContracts/FlashLoanTester.sol#L23)

contracts/TestContracts/FlashLoanTester.sol#L20-L24


 - [ ] ID-4
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) ignores return value by [IERC20(debtToken).transfer(params.recipient,params.amountOut)](contracts/TestContracts/MockUniswapRouterV3.sol#L39)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


 - [ ] ID-5
[FlashLoan.flashLoanForRepay(address)](contracts/FlashLoan.sol#L88-L121) ignores return value by [IDebtToken(debtToken).transfer(msg.sender,netDebt)](contracts/FlashLoan.sol#L99)

contracts/FlashLoan.sol#L88-L121


 - [ ] ID-6
[FlashLoanTester.withdrawTokens(address,address)](contracts/TestContracts/FlashLoanTester.sol#L26-L29) ignores return value by [IERC20(_tokenAddress).transfer(_receiver,_amount)](contracts/TestContracts/FlashLoanTester.sol#L28)

contracts/TestContracts/FlashLoanTester.sol#L26-L29


 - [ ] ID-7
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) ignores return value by [IERC20(assetToken).transferFrom(params.recipient,address(this),assetTokensNeededPlusFee)](contracts/TestContracts/MockUniswapRouterV3.sol#L38)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


 - [ ] ID-8
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L154-L181) ignores return value by [IERC20(_tokenIn).transfer(msg.sender,_collAmountIn - amountIn)](contracts/FlashLoan.sol#L179)

contracts/FlashLoan.sol#L154-L181


 - [ ] ID-9
[FlashLoan.sendFeeToCollector()](contracts/FlashLoan.sol#L140-L144) ignores return value by [IDebtToken(debtToken).transfer(collector,feeAmount)](contracts/FlashLoan.sol#L143)

contracts/FlashLoan.sol#L140-L144


## uninitialized-state
Impact: High
Confidence: High
 - [ ] ID-10
[TrenBoxManager.trenBoxOwners](contracts/TrenBoxManager.sol#L92) is never initialized. It is used in:
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L332-L346)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L786-L806)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L808-L832)
	- [TrenBoxManager.getTrenBoxOwnersCount(address)](contracts/TrenBoxManager.sol#L934-L936)
	- [TrenBoxManager.getTrenBoxFromTrenBoxOwnersArray(address,uint256)](contracts/TrenBoxManager.sol#L938-L948)

contracts/TrenBoxManager.sol#L92


## divide-before-multiply
Impact: Medium
Confidence: Medium
 - [ ] ID-11
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L514-L568) performs a multiplication on the result of a division:
	- [debtRewardPerUnitStaked = debtNumerator / assetStakes](contracts/TrenBoxManager.sol#L553)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L557-L558)

contracts/TrenBoxManager.sol#L514-L568


 - [ ] ID-12
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L381-L403) performs a multiplication on the result of a division:
	- [decayRate = (_amount * PRECISION) / lifeTime](contracts/FeeCollector.sol#L400)
	- [expiredAmount = (elapsedTime * decayRate) / PRECISION](contracts/FeeCollector.sol#L401)

contracts/FeeCollector.sol#L381-L403


 - [ ] ID-13
[StabilityPool._computeTRENPerUnitStaked(uint256,uint256)](contracts/StabilityPool.sol#L544-L555) performs a multiplication on the result of a division:
	- [TRENPerUnitStaked = TRENNumerator / _totalDeposits](contracts/StabilityPool.sol#L552)
	- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L553)

contracts/StabilityPool.sol#L544-L555


 - [ ] ID-14
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L136-L144) performs a multiplication on the result of a division:
	- [timePassed = (block.timestamp - lastUpdateTime) / SECONDS_IN_ONE_MINUTE](contracts/TREN/CommunityIssuance.sol#L140)
	- [totalDistribuedSinceBeginning = trenDistribution * timePassed](contracts/TREN/CommunityIssuance.sol#L141)

contracts/TREN/CommunityIssuance.sol#L136-L144


 - [ ] ID-15
[StabilityPool._computeRewardsPerUnitStaked(address,uint256,uint256,uint256)](contracts/StabilityPool.sol#L576-L609) performs a multiplication on the result of a division:
	- [collGainPerUnitStaked = collateralNumerator / _totalDeposits](contracts/StabilityPool.sol#L606)
	- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L607-L608)

contracts/StabilityPool.sol#L576-L609


 - [ ] ID-16
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) performs a multiplication on the result of a division:
	- [collLot = (maxRedeemableDebt * DECIMAL_PRECISION) / vars.price](contracts/TrenBoxManagerOperations.sol#L448)
	- [collLot = (collLot * redemptionSofteningParam) / PERCENTAGE_PRECISION](contracts/TrenBoxManagerOperations.sol#L450)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-17
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L514-L568) performs a multiplication on the result of a division:
	- [collRewardPerUnitStaked = collNumerator / assetStakes](contracts/TrenBoxManager.sol#L552)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L555-L556)

contracts/TrenBoxManager.sol#L514-L568


 - [ ] ID-18
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) performs a multiplication on the result of a division:
	- [assetTokensNeeded = (stableCoinsNeeded + fee_1) / ratioAssetToStable](contracts/TestContracts/MockUniswapRouterV3.sol#L34)
	- [fee_2 = (assetTokensNeeded * fee2) / FEE_DENOMINATOR](contracts/TestContracts/MockUniswapRouterV3.sol#L35)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


## incorrect-equality
Impact: Medium
Confidence: High
 - [ ] ID-19
[LockedTREN.entityRuleExists(address)](contracts/TREN/LockedTREN.sol#L24-L29) uses a dangerous strict equality:
	- [entitiesVesting[_entity].createdDate == 0](contracts/TREN/LockedTREN.sol#L25)

contracts/TREN/LockedTREN.sol#L24-L29


 - [ ] ID-20
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L112-L118) uses a dangerous strict equality:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L115)

contracts/TREN/LockedTREN.sol#L112-L118


 - [ ] ID-21
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L136-L144) uses a dangerous strict equality:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L137)

contracts/TREN/CommunityIssuance.sol#L136-L144


 - [ ] ID-22
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L101-L110) uses a dangerous strict equality:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L103)

contracts/TREN/LockedTREN.sol#L101-L110


 - [ ] ID-23
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L107-L114) uses a dangerous strict equality:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L108)

contracts/TREN/CommunityIssuance.sol#L107-L114


 - [ ] ID-24
[CommunityIssuance.sendTREN(address,uint256)](contracts/TREN/CommunityIssuance.sol#L146-L155) uses a dangerous strict equality:
	- [safeAmount == 0](contracts/TREN/CommunityIssuance.sol#L150)

contracts/TREN/CommunityIssuance.sol#L146-L155


## reentrancy-no-eth
Impact: Medium
Confidence: Medium
 - [ ] ID-25
Reentrancy in [StabilityPool.provideToSP(uint256,address[])](contracts/StabilityPool.sol#L387-L422):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L399)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L407)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1013)
	- [_sendToStabilityPool(msg.sender,_amount)](contracts/StabilityPool.sol#L411)
		- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L897)
	State variables written after the call(s):
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L414)
		- [depositSnapshots[_depositor].S[colls[i]] = 0](contracts/StabilityPool.sol#L972)
		- [depositorSnapshots.P = 0](contracts/StabilityPool.sol#L977)
		- [depositorSnapshots.G = 0](contracts/StabilityPool.sol#L978)
		- [depositorSnapshots.epoch = 0](contracts/StabilityPool.sol#L979)
		- [depositorSnapshots.scale = 0](contracts/StabilityPool.sol#L980)
		- [depositSnapshots[_depositor].S[asset] = currentS](contracts/StabilityPool.sol#L991)
		- [depositorSnapshots.P = currentP](contracts/StabilityPool.sol#L998)
		- [depositorSnapshots.G = currentG](contracts/StabilityPool.sol#L999)
		- [depositorSnapshots.scale = currentScaleCached](contracts/StabilityPool.sol#L1000)
		- [depositorSnapshots.epoch = currentEpochCached](contracts/StabilityPool.sol#L1001)
	[StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L202) can be used in cross function reentrancies:
	- [StabilityPool.S(address,address)](contracts/StabilityPool.sol#L373-L375)
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L202)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L354-L366)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L319-L340)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L343-L351)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L414)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L965)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L193) can be used in cross function reentrancies:
	- [StabilityPool.deposits](contracts/StabilityPool.sol#L193)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L354-L366)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L319-L340)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L343-L351)
	- [_sendToStabilityPool(msg.sender,_amount)](contracts/StabilityPool.sol#L411)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L899)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L185) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L711-L715)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L509-L528)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L314-L316)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455)

contracts/StabilityPool.sol#L387-L422


 - [ ] ID-26
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L462-L491):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L472)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L482)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L1013)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L483)
		- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,_debtTokenWithdrawal)](contracts/StabilityPool.sol#L950)
	State variables written after the call(s):
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L487)
		- [depositSnapshots[_depositor].S[colls[i]] = 0](contracts/StabilityPool.sol#L972)
		- [depositorSnapshots.P = 0](contracts/StabilityPool.sol#L977)
		- [depositorSnapshots.G = 0](contracts/StabilityPool.sol#L978)
		- [depositorSnapshots.epoch = 0](contracts/StabilityPool.sol#L979)
		- [depositorSnapshots.scale = 0](contracts/StabilityPool.sol#L980)
		- [depositSnapshots[_depositor].S[asset] = currentS](contracts/StabilityPool.sol#L991)
		- [depositorSnapshots.P = currentP](contracts/StabilityPool.sol#L998)
		- [depositorSnapshots.G = currentG](contracts/StabilityPool.sol#L999)
		- [depositorSnapshots.scale = currentScaleCached](contracts/StabilityPool.sol#L1000)
		- [depositorSnapshots.epoch = currentEpochCached](contracts/StabilityPool.sol#L1001)
	[StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L202) can be used in cross function reentrancies:
	- [StabilityPool.S(address,address)](contracts/StabilityPool.sol#L373-L375)
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L202)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L354-L366)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L319-L340)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L343-L351)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L487)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L965)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L193) can be used in cross function reentrancies:
	- [StabilityPool.deposits](contracts/StabilityPool.sol#L193)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L354-L366)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L319-L340)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L343-L351)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L483)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L713)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L185) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L711-L715)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L509-L528)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L314-L316)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455)

contracts/StabilityPool.sol#L462-L491


 - [ ] ID-27
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L370-L405):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L383-L385)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L390)
	State variables written after the call(s):
	- [trenBox.debt = _newDebt](contracts/TrenBoxManager.sol#L393)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L62) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L62)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L786-L806)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L679-L692)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L735-L739)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L808-L832)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L742-L757)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L332-L346)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L984-L997)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1014-L1036)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L370-L405)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L246-L260)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L193-L210)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L213-L229)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L922-L932)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L910-L920)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L898-L908)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L886-L896)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L969-L982)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L999-L1012)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L957-L967)
	- [trenBox.coll = _newColl](contracts/TrenBoxManager.sol#L394)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L62) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L62)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L786-L806)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L679-L692)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L735-L739)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L808-L832)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L742-L757)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L332-L346)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L984-L997)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1014-L1036)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L370-L405)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L246-L260)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L193-L210)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L213-L229)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L922-L932)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L910-L920)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L898-L908)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L886-L896)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L969-L982)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L999-L1012)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L957-L967)
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L395)
		- [trenBox.stake = newStake](contracts/TrenBoxManager.sol#L752)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L62) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L62)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L786-L806)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L679-L692)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L735-L739)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L808-L832)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L742-L757)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L332-L346)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L984-L997)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1014-L1036)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L370-L405)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L246-L260)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L193-L210)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L213-L229)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L922-L932)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L910-L920)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L898-L908)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L886-L896)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L969-L982)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L999-L1012)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L957-L967)

contracts/TrenBoxManager.sol#L370-L405


 - [ ] ID-28
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L446)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L454)
		- [ITrenBoxStorage(trenBoxStorage).decreaseActiveDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L705)
		- [IDebtToken(debtToken).burn(address(this),_debtToOffset)](contracts/StabilityPool.sol#L707)
		- [ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset,address(this),_amount)](contracts/StabilityPool.sol#L708)
	State variables written after the call(s):
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L454)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L713)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L185) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L711-L715)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L509-L528)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L314-L316)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455)

contracts/StabilityPool.sol#L433-L455


 - [ ] ID-29
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L446)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	State variables written after the call(s):
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
		- [P = newP](contracts/StabilityPool.sol#L685)
	[StabilityPool.P](contracts/StabilityPool.sol#L213) can be used in cross function reentrancies:
	- [StabilityPool.P](contracts/StabilityPool.sol#L213)
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L835-L886)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L509-L528)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L617-L687)
	- [StabilityPool.initialize(address)](contracts/StabilityPool.sol#L290-L295)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
		- [currentEpoch = currentEpochCached](contracts/StabilityPool.sol#L659)
	[StabilityPool.currentEpoch](contracts/StabilityPool.sol#L222) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L835-L886)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L509-L528)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L617-L687)
	- [StabilityPool.currentEpoch](contracts/StabilityPool.sol#L222)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
		- [currentScale = 0](contracts/StabilityPool.sol#L661)
		- [currentScale = currentScaleCached](contracts/StabilityPool.sol#L674)
	[StabilityPool.currentScale](contracts/StabilityPool.sol#L219) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L835-L886)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L509-L528)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L617-L687)
	- [StabilityPool.currentScale](contracts/StabilityPool.sol#L219)

contracts/StabilityPool.sol#L433-L455


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-30
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(address,uint256,uint256,uint256,bool).vars](contracts/TrenBoxManagerOperations.sol#L962) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L962


 - [ ] ID-31
[TrenBoxManagerOperations._getTotalsFromBatchLiquidate_NormalMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L645) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L645


 - [ ] ID-32
[TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256,bool).vars](contracts/TrenBoxManagerOperations.sol#L752) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L752


 - [ ] ID-33
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_NormalMode(address,uint256,uint256,uint256,bool).vars](contracts/TrenBoxManagerOperations.sol#L709) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L709


 - [ ] ID-34
[TrenBoxManagerOperations.batchLiquidateTrenBoxes(address,address[]).vars](contracts/TrenBoxManagerOperations.sol#L138) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L138


 - [ ] ID-35
[TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L559) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L559


 - [ ] ID-36
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).vars](contracts/BorrowerOperations.sol#L68) is a local variable never initialized

contracts/BorrowerOperations.sol#L68


 - [ ] ID-37
[TrenBoxManagerOperations.liquidateTrenBoxes(address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L64) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L64


 - [ ] ID-38
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256).totals](contracts/TrenBoxManagerOperations.sol#L266) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L266


 - [ ] ID-39
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256,bool).zeroVals](contracts/TrenBoxManagerOperations.sol#L939) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L939


 - [ ] ID-40
[TrenBoxManagerOperations.redistributeTrenBoxes(address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L212) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L212


 - [ ] ID-41
[BorrowerOperations._adjustTrenBox(address,uint256,address,uint256,uint256,bool,address,address).vars](contracts/BorrowerOperations.sol#L286) is a local variable never initialized

contracts/BorrowerOperations.sol#L286


 - [ ] ID-42
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256,bool).vars](contracts/TrenBoxManagerOperations.sol#L816) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L816


## unused-return
Impact: Medium
Confidence: Medium
 - [ ] ID-43
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L71-L103) ignores return value by [(answer,updatedAt) = ChainlinkAggregatorV3Interface(sequencerUptimeFeedAddress).latestRoundData()](contracts/Pricing/PriceFeedL2.sol#L74-L82)

contracts/Pricing/PriceFeedL2.sol#L71-L103


 - [ ] ID-44
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L154-L181) ignores return value by [IERC20(_tokenIn).approve(address(swapRouter),_collAmountIn)](contracts/FlashLoan.sol#L156)

contracts/FlashLoan.sol#L154-L181


 - [ ] ID-45
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L154-L181) ignores return value by [IERC20(_tokenIn).approve(address(swapRouter),0)](contracts/FlashLoan.sol#L178)

contracts/FlashLoan.sol#L154-L181


 - [ ] ID-46
[PriceFeed._fetchChainlinkOracleResponse(address)](contracts/PriceFeed.sol#L185-L206) ignores return value by [(roundId,answer,updatedAt) = ChainlinkAggregatorV3Interface(_oracleAddress).latestRoundData()](contracts/PriceFeed.sol#L190-L205)

contracts/PriceFeed.sol#L185-L206


## events-access
Impact: Low
Confidence: Medium
 - [ ] ID-47
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L43-L76) should emit an event for: 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 

contracts/Dependencies/ConfigurableAddresses.sol#L43-L76


 - [ ] ID-48
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L43-L76) should emit an event for: 
	- [timelockAddress = _addresses[8]](contracts/Dependencies/ConfigurableAddresses.sol#L69) 

contracts/Dependencies/ConfigurableAddresses.sol#L43-L76


 - [ ] ID-49
[TRENStaking.setAddresses(address,address,address,address)](contracts/TREN/TRENStaking.sol#L76-L97) should emit an event for: 
	- [feeCollector = _feeCollector](contracts/TREN/TRENStaking.sol#L92) 

contracts/TREN/TRENStaking.sol#L76-L97


 - [ ] ID-50
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L43-L76) should emit an event for: 
	- [adminContract = _addresses[0]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 
	- [trenBoxStorage = _addresses[12]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 

contracts/Dependencies/ConfigurableAddresses.sol#L43-L76


 - [ ] ID-51
[CommunityIssuance.setAddresses(address,address,address)](contracts/TREN/CommunityIssuance.sol#L52-L72) should emit an event for: 
	- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L68) 

contracts/TREN/CommunityIssuance.sol#L52-L72


 - [ ] ID-52
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L43-L76) should emit an event for: 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [stabilityPool = _addresses[7]](contracts/Dependencies/ConfigurableAddresses.sol#L68) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 
	- [trenBoxManagerOperations = _addresses[11]](contracts/Dependencies/ConfigurableAddresses.sol#L72) 

contracts/Dependencies/ConfigurableAddresses.sol#L43-L76


 - [ ] ID-53
[CommunityIssuance.setAdminContract(address)](contracts/TREN/CommunityIssuance.sol#L74-L79) should emit an event for: 
	- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L78) 

contracts/TREN/CommunityIssuance.sol#L74-L79


 - [ ] ID-54
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L43-L76) should emit an event for: 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 
	- [trenBoxManager = _addresses[10]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 

contracts/Dependencies/ConfigurableAddresses.sol#L43-L76


 - [ ] ID-55
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L43-L76) should emit an event for: 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [borrowerOperations = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L62) 
	- [trenBoxManagerOperations = _addresses[11]](contracts/Dependencies/ConfigurableAddresses.sol#L72) 
	- [trenBoxManagerOperations = _addresses[11]](contracts/Dependencies/ConfigurableAddresses.sol#L72) 

contracts/Dependencies/ConfigurableAddresses.sol#L43-L76


## events-maths
Impact: Low
Confidence: Medium
 - [ ] ID-56
[CommunityIssuance.setWeeklyTrenDistribution(uint256)](contracts/TREN/CommunityIssuance.sol#L157-L159) should emit an event for: 
	- [trenDistribution = _weeklyReward / DISTRIBUTION_DURATION](contracts/TREN/CommunityIssuance.sol#L158) 

contracts/TREN/CommunityIssuance.sol#L157-L159


 - [ ] ID-57
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L85-L94) should emit an event for: 
	- [TRENSupplyCap -= _fundToRemove](contracts/TREN/CommunityIssuance.sol#L91) 

contracts/TREN/CommunityIssuance.sol#L85-L94


## missing-zero-check
Impact: Low
Confidence: Medium
 - [ ] ID-58
[FlashLoanTester.setFlashLoanAddress(address)._flashLoan](contracts/TestContracts/FlashLoanTester.sol#L12) lacks a zero-check on :
		- [flashLoan = _flashLoan](contracts/TestContracts/FlashLoanTester.sol#L13)

contracts/TestContracts/FlashLoanTester.sol#L12


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-59
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L462-L463)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-60
[FeeCollector.getProtocolRevenueDestination()](contracts/FeeCollector.sol#L221-L223) has external calls inside a loop: [IAdminContract(adminContract).getRouteToTRENStaking()](contracts/FeeCollector.sol#L222)

contracts/FeeCollector.sol#L221-L223


 - [ ] ID-61
[SafetyTransfer.decimalsCorrection(address,uint256)](contracts/Dependencies/SafetyTransfer.sol#L12-L31) has external calls inside a loop: [decimals = IERC20Decimals(_token).decimals()](contracts/Dependencies/SafetyTransfer.sol#L19)

contracts/Dependencies/SafetyTransfer.sol#L12-L31


 - [ ] ID-62
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L432-L441) has external calls inside a loop: [IAdminContract(adminContract).getRouteToTRENStaking()](contracts/FeeCollector.sol#L436)

contracts/FeeCollector.sol#L432-L441


 - [ ] ID-63
[TrenBase._getNetDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L35-L37) has external calls inside a loop: [_debt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L36)

contracts/Dependencies/TrenBase.sol#L35-L37


 - [ ] ID-64
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [currentTrenBoxNetDebt = _getNetDebt(vars.asset,ITrenBoxManager(trenBoxManager).getTrenBoxDebt(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingDebtTokenReward(vars.asset,currentTrenBoxBorrower))](contracts/TrenBoxManagerOperations.sol#L423-L429)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-65
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [currentTrenBoxBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(vars.asset,currentTrenBoxBorrower,vars.price) < IAdminContract(adminContract).getMcr(vars.asset)](contracts/TrenBoxManagerOperations.sol#L405-L408)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-66
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [trenBoxDebt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1191)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-67
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L483-L527) has external calls inside a loop: [currentAddress = ITrenBoxManager(trenBoxManager).getTrenBoxFromTrenBoxOwnersArray(_asset,arrayIndex)](contracts/TrenBoxManagerOperations.sol#L512-L513)

contracts/TrenBoxManagerOperations.sol#L483-L527


 - [ ] ID-68
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L252-L353) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L303)

contracts/TrenBoxManagerOperations.sol#L252-L353


 - [ ] ID-69
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executeFullRedemption(_asset,_borrower,newColl)](contracts/TrenBoxManagerOperations.sol#L1215)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-70
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [singleRedemption.debtLot = TrenMath._min(_maxDebtTokenAmount,trenBoxDebt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset))](contracts/TrenBoxManagerOperations.sol#L1196-L1199)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-71
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [currentTrenBoxNetDebt > IAdminContract(adminContract).getMinNetDebt(vars.asset)](contracts/TrenBoxManagerOperations.sol#L434)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-72
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L252-L353) has external calls inside a loop: [currentBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L287)

contracts/TrenBoxManagerOperations.sol#L252-L353


 - [ ] ID-73
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L432-L441) has external calls inside a loop: [ITRENStaking(trenStaking).increaseFeeDebtToken(_feeAmount)](contracts/FeeCollector.sol#L437)

contracts/FeeCollector.sol#L432-L441


 - [ ] ID-74
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L252-L353) has external calls inside a loop: [currentBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(_asset,currentBorrower,totals.price) < IAdminContract(adminContract).getMcr(_asset)](contracts/TrenBoxManagerOperations.sol#L282-L285)

contracts/TrenBoxManagerOperations.sol#L252-L353


 - [ ] ID-75
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [maxRedeemableDebt = TrenMath._min(remainingDebt,currentTrenBoxNetDebt - IAdminContract(adminContract).getMinNetDebt(vars.asset))](contracts/TrenBoxManagerOperations.sol#L436-L440)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-76
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executePartialRedemption(_asset,_borrower,newDebt,newColl,newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManagerOperations.sol#L1234-L1242)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-77
[TrenBase._getCompositeDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L31-L33) has external calls inside a loop: [_debt + IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L32)

contracts/Dependencies/TrenBase.sol#L31-L33


 - [ ] ID-78
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [newDebt == IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/TrenBoxManagerOperations.sol#L1214)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-79
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L483-L527) has external calls inside a loop: [currentNICR = ITrenBoxManager(trenBoxManager).getNominalICR(_asset,currentAddress)](contracts/TrenBoxManagerOperations.sol#L514-L515)

contracts/TrenBoxManagerOperations.sol#L483-L527


 - [ ] ID-80
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [newNICR != _partialRedemptionHintNICR || _getNetDebt(_asset,newDebt) < IAdminContract(adminContract).getMinNetDebt(_asset)](contracts/TrenBoxManagerOperations.sol#L1226-L1228)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-81
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [currentTrenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingAssetReward(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L441-L446)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-82
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1179-L1246) has external calls inside a loop: [trenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1192)

contracts/TrenBoxManagerOperations.sol#L1179-L1246


 - [ ] ID-83
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L379-L467) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L410-L411)

contracts/TrenBoxManagerOperations.sol#L379-L467


 - [ ] ID-84
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L252-L353) has external calls inside a loop: [nextUserToCheck = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L300-L301)

contracts/TrenBoxManagerOperations.sol#L252-L353


## reentrancy-benign
Impact: Low
Confidence: Medium
 - [ ] ID-85
Reentrancy in [TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L514-L568):
	External calls:
	- [IStabilityPool(stabilityPool).offset(_debtToOffset,_asset,_collToSendToStabilityPool)](contracts/TrenBoxManager.sol#L526)
	State variables written after the call(s):
	- [L_Colls[_asset] = liquidatedColl](contracts/TrenBoxManager.sol#L563)
	- [L_Debts[_asset] = liquidatedDebt](contracts/TrenBoxManager.sol#L564)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L555-L556)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L557-L558)

contracts/TrenBoxManager.sol#L514-L568


 - [ ] ID-86
Reentrancy in [StabilityPool._sendToDepositor(address,uint256)](contracts/StabilityPool.sol#L946-L952):
	External calls:
	- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,_debtTokenWithdrawal)](contracts/StabilityPool.sol#L950)
	State variables written after the call(s):
	- [_decreaseDebtTokens(_debtTokenWithdrawal)](contracts/StabilityPool.sol#L951)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L713)

contracts/StabilityPool.sol#L946-L952


 - [ ] ID-87
Reentrancy in [StabilityPool._sendGainsToDepositor(address,address[],uint256[])](contracts/StabilityPool.sol#L910-L939):
	External calls:
	- [IERC20(asset).safeTransfer(_to,amount)](contracts/StabilityPool.sol#L933)
	State variables written after the call(s):
	- [totalColl.amounts = _leftSubColls(totalColl,_assets,_amounts)](contracts/StabilityPool.sol#L938)

contracts/StabilityPool.sol#L910-L939


 - [ ] ID-88
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L698-L709):
	External calls:
	- [ITrenBoxStorage(trenBoxStorage).decreaseActiveDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L705)
	State variables written after the call(s):
	- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L706)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L713)

contracts/StabilityPool.sol#L698-L709


 - [ ] ID-89
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L446)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	State variables written after the call(s):
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
		- [epochToScaleToSum[_asset][currentEpochCached][currentScaleCached] = newS](contracts/StabilityPool.sol#L653)
	- [(collGainPerUnitStaked,debtLossPerUnitStaked) = _computeRewardsPerUnitStaked(_asset,_amountAdded,_debtToOffset,cachedTotalDebtTokenDeposits)](contracts/StabilityPool.sol#L447-L450)
		- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L607-L608)
	- [(collGainPerUnitStaked,debtLossPerUnitStaked) = _computeRewardsPerUnitStaked(_asset,_amountAdded,_debtToOffset,cachedTotalDebtTokenDeposits)](contracts/StabilityPool.sol#L447-L450)
		- [lastDebtTokenLossError_Offset = 0](contracts/StabilityPool.sol#L595)
		- [lastDebtTokenLossError_Offset = (debtLossPerUnitStaked * _totalDeposits) - lossNumerator](contracts/StabilityPool.sol#L604)

contracts/StabilityPool.sol#L433-L455


 - [ ] ID-90
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L498-L503):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	State variables written after the call(s):
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L501)
		- [epochToScaleToG[currentEpoch][currentScale] = newEpochToScaleToG](contracts/StabilityPool.sol#L526)
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L501)
		- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L553)

contracts/StabilityPool.sol#L498-L503


 - [ ] ID-91
Reentrancy in [StabilityPool._sendToStabilityPool(address,uint256)](contracts/StabilityPool.sol#L896-L901):
	External calls:
	- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L897)
	State variables written after the call(s):
	- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L899)

contracts/StabilityPool.sol#L896-L901


 - [ ] ID-92
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L370-L405):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L383-L385)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L390)
	State variables written after the call(s):
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L395)
		- [totalStakes[_asset] = newTotal](contracts/TrenBoxManager.sol#L754)

contracts/TrenBoxManager.sol#L370-L405


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-93
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L446)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L454)
		- [ITrenBoxStorage(trenBoxStorage).decreaseActiveDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L705)
		- [IDebtToken(debtToken).burn(address(this),_debtToOffset)](contracts/StabilityPool.sol#L707)
		- [ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset,address(this),_amount)](contracts/StabilityPool.sol#L708)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L714)
		- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L454)

contracts/StabilityPool.sol#L433-L455


 - [ ] ID-94
Reentrancy in [TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[])](contracts/TrenBoxManagerOperations.sol#L550-L634):
	External calls:
	- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price,false)](contracts/TrenBoxManagerOperations.sol#L594-L602)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L841-L843)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L844)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxRedistribution(_asset,_borrower,singleLiquidation.debtTokenGasCompensation)](contracts/TrenBoxManagerOperations.sol#L852-L854)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L863)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L878-L880)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L881)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L892)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L912-L914)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L917)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L925)
		- [ITrenBoxStorage(trenBoxStorage).updateUserClaimableBalance(_asset,_borrower,singleLiquidation.collToClaim)](contracts/TrenBoxManagerOperations.sol#L927-L929)
	- [singleLiquidation = _liquidateNormalMode(_asset,vars.user,vars.remainingDebtTokenInStabPool,false)](contracts/TrenBoxManagerOperations.sol#L620-L622)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L760-L762)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L763)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxRedistribution(_asset,_borrower,singleLiquidation.debtTokenGasCompensation)](contracts/TrenBoxManagerOperations.sol#L788-L790)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L792)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L794-L800)
		- [singleLiquidation = _liquidateNormalMode(_asset,vars.user,vars.remainingDebtTokenInStabPool,false)](contracts/TrenBoxManagerOperations.sol#L620-L622)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.redistributeCollateral)](contracts/TrenBoxManagerOperations.sol#L855-L861)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price,false)](contracts/TrenBoxManagerOperations.sol#L594-L602)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L864-L870)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price,false)](contracts/TrenBoxManagerOperations.sol#L594-L602)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L893-L899)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price,false)](contracts/TrenBoxManagerOperations.sol#L594-L602)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L931-L937)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price,false)](contracts/TrenBoxManagerOperations.sol#L594-L602)

contracts/TrenBoxManagerOperations.sol#L550-L634


 - [ ] ID-95
Reentrancy in [FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L449-L454):
	External calls:
	- [IERC20(debtToken).safeTransfer(_borrower,_refundAmount)](contracts/FeeCollector.sol#L451)
	Event emitted after the call(s):
	- [FeeRefunded(_borrower,_asset,_refundAmount)](contracts/FeeCollector.sol#L452)

contracts/FeeCollector.sol#L449-L454


 - [ ] ID-96
Reentrancy in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L167-L211):
	External calls:
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L203)
	Event emitted after the call(s):
	- [ExecuteTransaction(txHash,target,value,signature,data,eta)](contracts/Timelock.sol#L208)

contracts/Timelock.sol#L167-L211


 - [ ] ID-97
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L370-L405):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L383-L385)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L390)
	Event emitted after the call(s):
	- [TotalStakesUpdated(_asset,newTotal)](contracts/TrenBoxManager.sol#L755)
		- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L395)
	- [TrenBoxUpdated(_asset,_borrower,_newDebt,_newColl,trenBox.stake,TrenBoxManagerOperation.redeemCollateral)](contracts/TrenBoxManager.sol#L397-L404)

contracts/TrenBoxManager.sol#L370-L405


 - [ ] ID-98
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L698-L709):
	External calls:
	- [ITrenBoxStorage(trenBoxStorage).decreaseActiveDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L705)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L714)
		- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L706)

contracts/StabilityPool.sol#L698-L709


 - [ ] ID-99
Reentrancy in [FeeCollector.handleRedemptionFee(address,uint256)](contracts/FeeCollector.sol#L207-L212):
	External calls:
	- [ITRENStaking(trenStaking).increaseFeeAsset(_asset,_amount)](contracts/FeeCollector.sol#L209)
	Event emitted after the call(s):
	- [RedemptionFeeCollected(_asset,_amount)](contracts/FeeCollector.sol#L211)

contracts/FeeCollector.sol#L207-L212


 - [ ] ID-100
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256,bool)](contracts/TrenBoxManagerOperations.sol#L804-L944):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L912-L914)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L917)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L925)
	- [ITrenBoxStorage(trenBoxStorage).updateUserClaimableBalance(_asset,_borrower,singleLiquidation.collToClaim)](contracts/TrenBoxManagerOperations.sol#L927-L929)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L931-L937)

contracts/TrenBoxManagerOperations.sol#L804-L944


 - [ ] ID-101
Reentrancy in [LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L41-L68):
	External calls:
	- [trenToken.safeTransferFrom(msg.sender,address(this),_totalSupply)](contracts/TREN/LockedTREN.sol#L60)
	Event emitted after the call(s):
	- [AddEntityVesting(_entity,_totalSupply,entitiesVesting[_entity].startVestingDate,entitiesVesting[_entity].endVestingDate)](contracts/TREN/LockedTREN.sol#L62-L67)

contracts/TREN/LockedTREN.sol#L41-L68


 - [ ] ID-102
Reentrancy in [TrenBoxManager.closeTrenBoxLiquidation(address,address)](contracts/TrenBoxManager.sol#L596-L609):
	External calls:
	- [_closeTrenBox(_asset,_borrower,Status.closedByLiquidation)](contracts/TrenBoxManager.sol#L604)
		- [ISortedTrenBoxes(sortedTrenBoxes).remove(_asset,_borrower)](contracts/TrenBoxManager.sol#L805)
	- [IFeeCollector(feeCollector).liquidateDebt(_borrower,_asset)](contracts/TrenBoxManager.sol#L605)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,_borrower,0,0,0,TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManager.sol#L606-L608)

contracts/TrenBoxManager.sol#L596-L609


 - [ ] ID-103
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L433-L455):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L446)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	Event emitted after the call(s):
	- [EpochUpdated(currentEpochCached)](contracts/StabilityPool.sol#L660)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
	- [ProductUpdated(newP)](contracts/StabilityPool.sol#L686)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
	- [ScaleUpdated(0)](contracts/StabilityPool.sol#L662)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
	- [ScaleUpdated(currentScaleCached)](contracts/StabilityPool.sol#L675)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)
	- [SumUpdated(_asset,newS,currentEpochCached,currentScaleCached)](contracts/StabilityPool.sol#L654)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L453)

contracts/StabilityPool.sol#L433-L455


 - [ ] ID-104
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256,bool)](contracts/TrenBoxManagerOperations.sol#L804-L944):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L878-L880)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L881)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L892)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L893-L899)

contracts/TrenBoxManagerOperations.sol#L804-L944


 - [ ] ID-105
Reentrancy in [TrenBoxManager.closeTrenBoxRedistribution(address,address,uint256)](contracts/TrenBoxManager.sol#L611-L625):
	External calls:
	- [_closeTrenBox(_asset,_borrower,Status.closedByRedistribution)](contracts/TrenBoxManager.sol#L619)
		- [ISortedTrenBoxes(sortedTrenBoxes).remove(_asset,_borrower)](contracts/TrenBoxManager.sol#L805)
	- [IFeeCollector(feeCollector).liquidateDebt(_borrower,_asset)](contracts/TrenBoxManager.sol#L620)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,_borrower,0,0,0,TrenBoxManagerOperation.redistributeCollateral)](contracts/TrenBoxManager.sol#L621-L623)

contracts/TrenBoxManager.sol#L611-L625


 - [ ] ID-106
Reentrancy in [FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L432-L441):
	External calls:
	- [IERC20(debtToken).safeTransfer(destination,_feeAmount)](contracts/FeeCollector.sol#L435)
	- [ITRENStaking(trenStaking).increaseFeeDebtToken(_feeAmount)](contracts/FeeCollector.sol#L437)
	Event emitted after the call(s):
	- [FeeCollected(_borrower,_asset,destination,_feeAmount)](contracts/FeeCollector.sol#L439)

contracts/FeeCollector.sol#L432-L441


 - [ ] ID-107
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256,bool)](contracts/TrenBoxManagerOperations.sol#L804-L944):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L841-L843)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L844)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L863)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L864-L870)

contracts/TrenBoxManagerOperations.sol#L804-L944


 - [ ] ID-108
Reentrancy in [TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256,bool)](contracts/TrenBoxManagerOperations.sol#L743-L802):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L760-L762)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L763)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxRedistribution(_asset,_borrower,singleLiquidation.debtTokenGasCompensation)](contracts/TrenBoxManagerOperations.sol#L788-L790)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L792)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L794-L800)

contracts/TrenBoxManagerOperations.sol#L743-L802


 - [ ] ID-109
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L498-L503):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L500)
	Event emitted after the call(s):
	- [GainsUpdated(newEpochToScaleToG,currentEpoch,currentScale)](contracts/StabilityPool.sol#L527)
		- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L501)

contracts/StabilityPool.sol#L498-L503


 - [ ] ID-110
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256,bool)](contracts/TrenBoxManagerOperations.sol#L804-L944):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L841-L843)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L844)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxRedistribution(_asset,_borrower,singleLiquidation.debtTokenGasCompensation)](contracts/TrenBoxManagerOperations.sol#L852-L854)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.redistributeCollateral)](contracts/TrenBoxManagerOperations.sol#L855-L861)

contracts/TrenBoxManagerOperations.sol#L804-L944


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-111
[PriceFeed._fetchOracleScaledPrice(IPriceFeed.OracleRecord)](contracts/PriceFeed.sol#L141-L163) uses timestamp for comparisons
	Dangerous comparisons:
	- [oraclePrice != 0 && ! _isStalePrice(priceTimestamp,oracle.timeoutSeconds)](contracts/PriceFeed.sol#L158)

contracts/PriceFeed.sol#L141-L163


 - [ ] ID-112
[FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L449-L454) uses timestamp for comparisons
	Dangerous comparisons:
	- [_refundAmount != 0](contracts/FeeCollector.sol#L450)

contracts/FeeCollector.sol#L449-L454


 - [ ] ID-113
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L432-L441) uses timestamp for comparisons
	Dangerous comparisons:
	- [_feeAmount != 0](contracts/FeeCollector.sol#L433)

contracts/FeeCollector.sol#L432-L441


 - [ ] ID-114
[TrenBoxManager._updateLastFeeOpTime(address)](contracts/TrenBoxManager.sol#L863-L871) uses timestamp for comparisons
	Dangerous comparisons:
	- [timePassed >= SECONDS_IN_ONE_MINUTE](contracts/TrenBoxManager.sol#L865)

contracts/TrenBoxManager.sol#L863-L871


 - [ ] ID-115
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L154-L181) uses timestamp for comparisons
	Dangerous comparisons:
	- [amountIn < _collAmountIn](contracts/FlashLoan.sol#L177)

contracts/FlashLoan.sol#L154-L181


 - [ ] ID-116
[TrenBoxManagerOperations._validateRedemptionRequirements(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L1143-L1175) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionBlockTimestamp > block.timestamp](contracts/TrenBoxManagerOperations.sol#L1154)

contracts/TrenBoxManagerOperations.sol#L1143-L1175


 - [ ] ID-117
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L101-L110) uses timestamp for comparisons
	Dangerous comparisons:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L103)

contracts/TREN/LockedTREN.sol#L101-L110


 - [ ] ID-118
[FeeCollector.collectFees(address[],address[])](contracts/FeeCollector.sol#L176-L204) uses timestamp for comparisons
	Dangerous comparisons:
	- [expiredAmount > 0](contracts/FeeCollector.sol#L193)

contracts/FeeCollector.sol#L176-L204


 - [ ] ID-119
[FeeCollector._createOrUpdateFeeRecord(address,address,uint256)](contracts/FeeCollector.sol#L280-L299) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= block.timestamp](contracts/FeeCollector.sol#L292)

contracts/FeeCollector.sol#L280-L299


 - [ ] ID-120
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L136-L144) uses timestamp for comparisons
	Dangerous comparisons:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L137)

contracts/TREN/CommunityIssuance.sol#L136-L144


 - [ ] ID-121
[FeeCollector._updateFeeRecord(address,address,uint256,IFeeCollector.FeeRecord)](contracts/FeeCollector.sol#L331-L355) uses timestamp for comparisons
	Dangerous comparisons:
	- [NOW < _sRecord.from](contracts/FeeCollector.sol#L341)

contracts/FeeCollector.sol#L331-L355


 - [ ] ID-122
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L107-L114) uses timestamp for comparisons
	Dangerous comparisons:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L108)

contracts/TREN/CommunityIssuance.sol#L107-L114


 - [ ] ID-123
[FeeCollector.simulateRefund(address,address,uint256)](contracts/FeeCollector.sol#L129-L158) uses timestamp for comparisons
	Dangerous comparisons:
	- [record.amount == 0 || record.to < block.timestamp](contracts/FeeCollector.sol#L147)

contracts/FeeCollector.sol#L129-L158


 - [ ] ID-124
[CommunityIssuance.issueTREN()](contracts/TREN/CommunityIssuance.sol#L116-L134) uses timestamp for comparisons
	Dangerous comparisons:
	- [totalTRENIssued >= maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L119)
	- [totalIssuance > maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L124)

contracts/TREN/CommunityIssuance.sol#L116-L134


 - [ ] ID-125
[FeeCollector._decreaseDebt(address,address,uint256)](contracts/FeeCollector.sol#L234-L272) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= NOW](contracts/FeeCollector.sol#L248)

contracts/FeeCollector.sol#L234-L272


 - [ ] ID-126
[TrenBoxManager._calcRedemptionFee(uint256,uint256)](contracts/TrenBoxManager.sol#L848-L861) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionFee >= _assetDraw](contracts/TrenBoxManager.sol#L857)

contracts/TrenBoxManager.sol#L848-L861


 - [ ] ID-127
[TrenBoxManager.updateBaseRateFromRedemption(address,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L433-L451) uses timestamp for comparisons
	Dangerous comparisons:
	- [assert(bool)(newBaseRate > 0)](contracts/TrenBoxManager.sol#L446)

contracts/TrenBoxManager.sol#L433-L451


 - [ ] ID-128
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L85-L94) uses timestamp for comparisons
	Dangerous comparisons:
	- [totalTRENIssued > newCap](contracts/TREN/CommunityIssuance.sol#L87)

contracts/TREN/CommunityIssuance.sol#L85-L94


 - [ ] ID-129
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L71-L103) uses timestamp for comparisons
	Dangerous comparisons:
	- [timeSinceSequencerUp <= delay](contracts/Pricing/PriceFeedL2.sol#L99)

contracts/Pricing/PriceFeedL2.sol#L71-L103


 - [ ] ID-130
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L120-L135) uses timestamp for comparisons
	Dangerous comparisons:
	- [entityRule.startVestingDate > block.timestamp](contracts/TREN/LockedTREN.sol#L124)
	- [block.timestamp >= entityRule.endVestingDate](contracts/TREN/LockedTREN.sol#L126)

contracts/TREN/LockedTREN.sol#L120-L135


 - [ ] ID-131
[Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L167-L211) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < eta](contracts/Timelock.sol#L186)
	- [block.timestamp > eta + GRACE_PERIOD](contracts/Timelock.sol#L189)

contracts/Timelock.sol#L167-L211


 - [ ] ID-132
[LockedTREN.isEntityExits(address)](contracts/TREN/LockedTREN.sol#L141-L143) uses timestamp for comparisons
	Dangerous comparisons:
	- [entitiesVesting[_entity].createdDate != 0](contracts/TREN/LockedTREN.sol#L142)

contracts/TREN/LockedTREN.sol#L141-L143


 - [ ] ID-133
[PriceFeed._isStalePrice(uint256,uint256)](contracts/PriceFeed.sol#L170-L179) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp - _priceTimestamp > _oracleTimeoutSeconds](contracts/PriceFeed.sol#L178)

contracts/PriceFeed.sol#L170-L179


 - [ ] ID-134
[Timelock.queueTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L123-L146) uses timestamp for comparisons
	Dangerous comparisons:
	- [eta < block.timestamp + delay || eta > block.timestamp + delay + GRACE_PERIOD](contracts/Timelock.sol#L134)

contracts/Timelock.sol#L123-L146


 - [ ] ID-135
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L112-L118) uses timestamp for comparisons
	Dangerous comparisons:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L115)

contracts/TREN/LockedTREN.sol#L112-L118


 - [ ] ID-136
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L381-L403) uses timestamp for comparisons
	Dangerous comparisons:
	- [_from > NOW](contracts/FeeCollector.sol#L391)
	- [NOW >= _to](contracts/FeeCollector.sol#L394)

contracts/FeeCollector.sol#L381-L403


## assembly
Impact: Informational
Confidence: High
 - [ ] ID-137
[BytesLib.toUint24(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L70-L80) uses assembly
	- [INLINE ASM](contracts/TestContracts/MockUniswapRouterV3.sol#L75-L77)

contracts/TestContracts/MockUniswapRouterV3.sol#L70-L80


 - [ ] ID-138
[BytesLib.toAddress(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L58-L68) uses assembly
	- [INLINE ASM](contracts/TestContracts/MockUniswapRouterV3.sol#L63-L65)

contracts/TestContracts/MockUniswapRouterV3.sol#L58-L68


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-139
Low level call in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L167-L211):
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L203)

contracts/Timelock.sol#L167-L211


## similar-names
Impact: Informational
Confidence: Medium
 - [ ] ID-140
Variable [AdminContract.CCR_DEFAULT](contracts/AdminContract.sol#L40) is too similar to [AdminContract.MCR_DEFAULT](contracts/AdminContract.sol#L43)

contracts/AdminContract.sol#L40


 - [ ] ID-141
Variable [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound1](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L71) is too similar to [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound2](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L83)

contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L71


## too-many-digits
Impact: Informational
Confidence: Medium
 - [ ] ID-142
[BytesLib.toAddress(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L58-L68) uses literals with too many digits:
	- [tempAddress = mload(uint256)(_bytes + 0x20 + _start) / 0x1000000000000000000000000](contracts/TestContracts/MockUniswapRouterV3.sol#L64)

contracts/TestContracts/MockUniswapRouterV3.sol#L58-L68


