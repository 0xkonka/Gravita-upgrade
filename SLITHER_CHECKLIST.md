Summary
 - [arbitrary-send-erc20](#arbitrary-send-erc20) (1 results) (High)
 - [unchecked-transfer](#unchecked-transfer) (9 results) (High)
 - [uninitialized-state](#uninitialized-state) (1 results) (High)
 - [divide-before-multiply](#divide-before-multiply) (9 results) (Medium)
 - [incorrect-equality](#incorrect-equality) (5 results) (Medium)
 - [reentrancy-no-eth](#reentrancy-no-eth) (5 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (12 results) (Medium)
 - [unused-return](#unused-return) (4 results) (Medium)
 - [events-access](#events-access) (11 results) (Low)
 - [events-maths](#events-maths) (3 results) (Low)
 - [missing-zero-check](#missing-zero-check) (1 results) (Low)
 - [calls-loop](#calls-loop) (26 results) (Low)
 - [reentrancy-benign](#reentrancy-benign) (8 results) (Low)
 - [reentrancy-events](#reentrancy-events) (15 results) (Low)
 - [timestamp](#timestamp) (27 results) (Low)
 - [assembly](#assembly) (2 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
 - [similar-names](#similar-names) (5 results) (Informational)
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
[FlashLoan.sendFeeToCollector()](contracts/FlashLoan.sol#L139-L143) ignores return value by [IDebtToken(debtToken).transfer(collector,feeAmount)](contracts/FlashLoan.sol#L142)

contracts/FlashLoan.sol#L139-L143


 - [ ] ID-2
[FlashLoan.flashLoan(uint256)](contracts/FlashLoan.sol#L63-L87) ignores return value by [IDebtToken(debtToken).transfer(msg.sender,_amount)](contracts/FlashLoan.sol#L75)

contracts/FlashLoan.sol#L63-L87


 - [ ] ID-3
[FlashLoanTester.executeOperation(uint256,uint256,address)](contracts/TestContracts/FlashLoanTester.sol#L20-L24) ignores return value by [IERC20(_tokenAddress).transfer(msg.sender,_amount + _fee)](contracts/TestContracts/FlashLoanTester.sol#L23)

contracts/TestContracts/FlashLoanTester.sol#L20-L24


 - [ ] ID-4
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) ignores return value by [IERC20(debtToken).transfer(params.recipient,params.amountOut)](contracts/TestContracts/MockUniswapRouterV3.sol#L39)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


 - [ ] ID-5
[MockBorrowerOperations.closeTrenBox(address)](contracts/TestContracts/MockBorrowerOperations.sol#L9-L11) ignores return value by [IERC20(_asset).transfer(msg.sender,IERC20(_asset).balanceOf(address(this)))](contracts/TestContracts/MockBorrowerOperations.sol#L10)

contracts/TestContracts/MockBorrowerOperations.sol#L9-L11


 - [ ] ID-6
[FlashLoan.flashLoanForRepay(address)](contracts/FlashLoan.sol#L89-L120) ignores return value by [IDebtToken(debtToken).transfer(msg.sender,netDebt)](contracts/FlashLoan.sol#L100)

contracts/FlashLoan.sol#L89-L120


 - [ ] ID-7
[FlashLoanTester.withdrawTokens(address,address)](contracts/TestContracts/FlashLoanTester.sol#L26-L29) ignores return value by [IERC20(_tokenAddress).transfer(_receiver,_amount)](contracts/TestContracts/FlashLoanTester.sol#L28)

contracts/TestContracts/FlashLoanTester.sol#L26-L29


 - [ ] ID-8
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) ignores return value by [IERC20(assetToken).transferFrom(params.recipient,address(this),assetTokensNeededPlusFee)](contracts/TestContracts/MockUniswapRouterV3.sol#L38)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


 - [ ] ID-9
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L153-L180) ignores return value by [IERC20(_tokenIn).transfer(msg.sender,_collAmountIn - amountIn)](contracts/FlashLoan.sol#L178)

contracts/FlashLoan.sol#L153-L180


## uninitialized-state
Impact: High
Confidence: High
 - [ ] ID-10
[TrenBoxManager.TrenBoxOwners](contracts/TrenBoxManager.sol#L94) is never initialized. It is used in:
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L337-L351)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L773-L793)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L795-L819)
	- [TrenBoxManager.getTrenBoxOwnersCount(address)](contracts/TrenBoxManager.sol#L921-L923)
	- [TrenBoxManager.getTrenBoxFromTrenBoxOwnersArray(address,uint256)](contracts/TrenBoxManager.sol#L925-L935)

contracts/TrenBoxManager.sol#L94


## divide-before-multiply
Impact: Medium
Confidence: Medium
 - [ ] ID-11
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L519-L575) performs a multiplication on the result of a division:
	- [collRewardPerUnitStaked = collNumerator / assetStakes](contracts/TrenBoxManager.sol#L557)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L560-L561)

contracts/TrenBoxManager.sol#L519-L575


 - [ ] ID-12
[StabilityPool._computeRewardsPerUnitStaked(address,uint256,uint256,uint256)](contracts/StabilityPool.sol#L523-L556) performs a multiplication on the result of a division:
	- [collGainPerUnitStaked = collateralNumerator / _totalDeposits](contracts/StabilityPool.sol#L553)
	- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L554-L555)

contracts/StabilityPool.sol#L523-L556


 - [ ] ID-13
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L313-L335) performs a multiplication on the result of a division:
	- [decayRate = (_amount * PRECISION) / lifeTime](contracts/FeeCollector.sol#L332)
	- [expiredAmount = (elapsedTime * decayRate) / PRECISION](contracts/FeeCollector.sol#L333)

contracts/FeeCollector.sol#L313-L335


 - [ ] ID-14
[StabilityPool._computeTRENPerUnitStaked(uint256,uint256)](contracts/StabilityPool.sol#L441-L466) performs a multiplication on the result of a division:
	- [TRENPerUnitStaked = TRENNumerator / _totalDeposits](contracts/StabilityPool.sol#L463)
	- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L464)

contracts/StabilityPool.sol#L441-L466


 - [ ] ID-15
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L519-L575) performs a multiplication on the result of a division:
	- [debtRewardPerUnitStaked = debtNumerator / assetStakes](contracts/TrenBoxManager.sol#L558)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L562-L563)

contracts/TrenBoxManager.sol#L519-L575


 - [ ] ID-16
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) performs a multiplication on the result of a division:
	- [collLot = (maxRedeemableDebt * DECIMAL_PRECISION) / vars.price](contracts/TrenBoxManagerOperations.sol#L391)
	- [collLot = (collLot * redemptionSofteningParam) / PERCENTAGE_PRECISION](contracts/TrenBoxManagerOperations.sol#L393)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-17
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L112-L127) performs a multiplication on the result of a division:
	- [claimable = ((entityRule.totalSupply / TWO_YEARS) * (block.timestamp - entityRule.createdDate)) - entityRule.claimed](contracts/TREN/LockedTREN.sol#L121-L123)

contracts/TREN/LockedTREN.sol#L112-L127


 - [ ] ID-18
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L135-L143) performs a multiplication on the result of a division:
	- [timePassed = (block.timestamp - lastUpdateTime) / SECONDS_IN_ONE_MINUTE](contracts/TREN/CommunityIssuance.sol#L139)
	- [totalDistribuedSinceBeginning = trenDistribution * timePassed](contracts/TREN/CommunityIssuance.sol#L140)

contracts/TREN/CommunityIssuance.sol#L135-L143


 - [ ] ID-19
[MockUniswapRouterV3.exactOutput(IUniswapRouterV3.ExactOutputParams)](contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42) performs a multiplication on the result of a division:
	- [assetTokensNeeded = (stableCoinsNeeded + fee_1) / ratioAssetToStable](contracts/TestContracts/MockUniswapRouterV3.sol#L34)
	- [fee_2 = (assetTokensNeeded * fee2) / FEE_DENOMINATOR](contracts/TestContracts/MockUniswapRouterV3.sol#L35)

contracts/TestContracts/MockUniswapRouterV3.sol#L28-L42


## incorrect-equality
Impact: Medium
Confidence: High
 - [ ] ID-20
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L93-L102) uses a dangerous strict equality:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L95)

contracts/TREN/LockedTREN.sol#L93-L102


 - [ ] ID-21
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L106-L113) uses a dangerous strict equality:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L107)

contracts/TREN/CommunityIssuance.sol#L106-L113


 - [ ] ID-22
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L135-L143) uses a dangerous strict equality:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L136)

contracts/TREN/CommunityIssuance.sol#L135-L143


 - [ ] ID-23
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L104-L110) uses a dangerous strict equality:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L107)

contracts/TREN/LockedTREN.sol#L104-L110


 - [ ] ID-24
[CommunityIssuance.sendTREN(address,uint256)](contracts/TREN/CommunityIssuance.sol#L145-L154) uses a dangerous strict equality:
	- [safeAmount == 0](contracts/TREN/CommunityIssuance.sol#L149)

contracts/TREN/CommunityIssuance.sol#L145-L154


## reentrancy-no-eth
Impact: Medium
Confidence: Medium
 - [ ] ID-25
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
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L207)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L814-L826)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L670-L691)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L769-L777)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L405)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L953)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L197) can be used in cross function reentrancies:
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
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L558-L628)
	- [StabilityPool.initialize()](contracts/StabilityPool.sol#L263-L270)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
		- [currentEpoch = currentEpochCached](contracts/StabilityPool.sol#L600)
	[StabilityPool.currentEpoch](contracts/StabilityPool.sol#L225) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L829-L880)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L558-L628)
	- [StabilityPool.currentEpoch](contracts/StabilityPool.sol#L225)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L498)
		- [currentScale = 0](contracts/StabilityPool.sol#L602)
		- [currentScale = currentScaleCached](contracts/StabilityPool.sol#L615)
	[StabilityPool.currentScale](contracts/StabilityPool.sol#L222) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L829-L880)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L420-L439)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L558-L628)
	- [StabilityPool.currentScale](contracts/StabilityPool.sol#L222)

contracts/StabilityPool.sol#L480-L501


 - [ ] ID-27
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
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L207)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L814-L826)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L670-L691)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L769-L777)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L355)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L953)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L197) can be used in cross function reentrancies:
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


 - [ ] ID-28
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


 - [ ] ID-29
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L375-L410):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L388-L390)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L395)
	State variables written after the call(s):
	- [trenBox.debt = _newDebt](contracts/TrenBoxManager.sol#L398)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L64) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L64)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L773-L793)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L668-L681)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L722-L726)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L795-L819)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L729-L744)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L337-L351)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L971-L984)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1001-L1023)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L375-L410)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L250-L264)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L197-L214)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L217-L233)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L909-L919)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L897-L907)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L885-L895)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L873-L883)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L956-L969)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L986-L999)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L944-L954)
	- [trenBox.coll = _newColl](contracts/TrenBoxManager.sol#L399)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L64) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L64)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L773-L793)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L668-L681)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L722-L726)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L795-L819)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L729-L744)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L337-L351)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L971-L984)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1001-L1023)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L375-L410)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L250-L264)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L197-L214)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L217-L233)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L909-L919)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L897-L907)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L885-L895)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L873-L883)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L956-L969)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L986-L999)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L944-L954)
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L400)
		- [trenBox.stake = newStake](contracts/TrenBoxManager.sol#L739)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L64) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L64)
	- [TrenBoxManager._closeTrenBox(address,address,ITrenBoxManager.Status)](contracts/TrenBoxManager.sol#L773-L793)
	- [TrenBoxManager._getCurrentTrenBoxAmounts(address,address)](contracts/TrenBoxManager.sol#L668-L681)
	- [TrenBoxManager._removeStake(address,address)](contracts/TrenBoxManager.sol#L722-L726)
	- [TrenBoxManager._removeTrenBoxOwner(address,address,uint256)](contracts/TrenBoxManager.sol#L795-L819)
	- [TrenBoxManager._updateStakeAndTotalStakes(address,address)](contracts/TrenBoxManager.sol#L729-L744)
	- [TrenBoxManager.addTrenBoxOwnerToArray(address,address)](contracts/TrenBoxManager.sol#L337-L351)
	- [TrenBoxManager.decreaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L971-L984)
	- [TrenBoxManager.decreaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L1001-L1023)
	- [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L375-L410)
	- [TrenBoxManager.getEntireDebtAndColl(address,address)](contracts/TrenBoxManager.sol#L250-L264)
	- [TrenBoxManager.getPendingAssetReward(address,address)](contracts/TrenBoxManager.sol#L197-L214)
	- [TrenBoxManager.getPendingDebtTokenReward(address,address)](contracts/TrenBoxManager.sol#L217-L233)
	- [TrenBoxManager.getTrenBoxColl(address,address)](contracts/TrenBoxManager.sol#L909-L919)
	- [TrenBoxManager.getTrenBoxDebt(address,address)](contracts/TrenBoxManager.sol#L897-L907)
	- [TrenBoxManager.getTrenBoxStake(address,address)](contracts/TrenBoxManager.sol#L885-L895)
	- [TrenBoxManager.getTrenBoxStatus(address,address)](contracts/TrenBoxManager.sol#L873-L883)
	- [TrenBoxManager.increaseTrenBoxColl(address,address,uint256)](contracts/TrenBoxManager.sol#L956-L969)
	- [TrenBoxManager.increaseTrenBoxDebt(address,address,uint256)](contracts/TrenBoxManager.sol#L986-L999)
	- [TrenBoxManager.setTrenBoxStatus(address,address,uint256)](contracts/TrenBoxManager.sol#L944-L954)

contracts/TrenBoxManager.sol#L375-L410


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-30
[TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L676) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L676


 - [ ] ID-31
[TrenBoxManagerOperations._getTotalsFromBatchLiquidate_NormalMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L580) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L580


 - [ ] ID-32
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(address,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L854) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L854


 - [ ] ID-33
[TrenBoxManagerOperations.batchLiquidateTrenBoxes(address,address[]).vars](contracts/TrenBoxManagerOperations.sol#L136) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L136


 - [ ] ID-34
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L727) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L727


 - [ ] ID-35
[TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L502) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L502


 - [ ] ID-36
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).vars](contracts/BorrowerOperations.sol#L64) is a local variable never initialized

contracts/BorrowerOperations.sol#L64


 - [ ] ID-37
[TrenBoxManagerOperations.liquidateTrenBoxes(address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L67) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L67


 - [ ] ID-38
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_NormalMode(address,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L641) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L641


 - [ ] ID-39
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256).totals](contracts/TrenBoxManagerOperations.sol#L209) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L209


 - [ ] ID-40
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256).zeroVals](contracts/TrenBoxManagerOperations.sol#L832) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L832


 - [ ] ID-41
[BorrowerOperations._adjustTrenBox(address,uint256,address,uint256,uint256,bool,address,address).vars](contracts/BorrowerOperations.sol#L246) is a local variable never initialized

contracts/BorrowerOperations.sol#L246


## unused-return
Impact: Medium
Confidence: Medium
 - [ ] ID-42
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L153-L180) ignores return value by [IERC20(_tokenIn).approve(address(swapRouter),_collAmountIn)](contracts/FlashLoan.sol#L155)

contracts/FlashLoan.sol#L153-L180


 - [ ] ID-43
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L71-L103) ignores return value by [(answer,updatedAt) = ChainlinkAggregatorV3Interface(sequencerUptimeFeedAddress).latestRoundData()](contracts/Pricing/PriceFeedL2.sol#L74-L82)

contracts/Pricing/PriceFeedL2.sol#L71-L103


 - [ ] ID-44
[PriceFeed._fetchChainlinkOracleResponse(address)](contracts/PriceFeed.sol#L157-L178) ignores return value by [(roundId,answer,updatedAt) = ChainlinkAggregatorV3Interface(_oracleAddress).latestRoundData()](contracts/PriceFeed.sol#L162-L177)

contracts/PriceFeed.sol#L157-L178


 - [ ] ID-45
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L153-L180) ignores return value by [IERC20(_tokenIn).approve(address(swapRouter),0)](contracts/FlashLoan.sol#L177)

contracts/FlashLoan.sol#L153-L180


## events-access
Impact: Low
Confidence: Medium
 - [ ] ID-46
[TRENStaking.setAddresses(address,address,address,address)](contracts/TREN/TRENStaking.sol#L76-L97) should emit an event for: 
	- [feeCollector = _feeCollector](contracts/TREN/TRENStaking.sol#L92) 

contracts/TREN/TRENStaking.sol#L76-L97


 - [ ] ID-47
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [defaultPool = _addresses[5]](contracts/Dependencies/ConfigurableAddresses.sol#L64) 
	- [stabilityPool = _addresses[11]](contracts/Dependencies/ConfigurableAddresses.sol#L70) 
	- [stabilityPool = _addresses[11]](contracts/Dependencies/ConfigurableAddresses.sol#L70) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 
	- [trenBoxManagerOperations = _addresses[15]](contracts/Dependencies/ConfigurableAddresses.sol#L74) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-48
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-49
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/ConfigurableAddresses.sol#L59) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-50
[CommunityIssuance.setAddresses(address,address,address)](contracts/TREN/CommunityIssuance.sol#L51-L71) should emit an event for: 
	- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L67) 

contracts/TREN/CommunityIssuance.sol#L51-L71


 - [ ] ID-51
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [trenBoxManagerOperations = _addresses[15]](contracts/Dependencies/ConfigurableAddresses.sol#L74) 
	- [trenBoxManagerOperations = _addresses[15]](contracts/Dependencies/ConfigurableAddresses.sol#L74) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-52
[CommunityIssuance.setAdminContract(address)](contracts/TREN/CommunityIssuance.sol#L73-L78) should emit an event for: 
	- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L77) 

contracts/TREN/CommunityIssuance.sol#L73-L78


 - [ ] ID-53
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/ConfigurableAddresses.sol#L59) 
	- [adminContract = _addresses[1]](contracts/Dependencies/ConfigurableAddresses.sol#L60) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-54
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [timelockAddress = _addresses[12]](contracts/Dependencies/ConfigurableAddresses.sol#L71) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-55
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/ConfigurableAddresses.sol#L59) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


 - [ ] ID-56
[ConfigurableAddresses.setAddresses(address[])](contracts/Dependencies/ConfigurableAddresses.sol#L46-L77) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/ConfigurableAddresses.sol#L61) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 
	- [trenBoxManager = _addresses[14]](contracts/Dependencies/ConfigurableAddresses.sol#L73) 

contracts/Dependencies/ConfigurableAddresses.sol#L46-L77


## events-maths
Impact: Low
Confidence: Medium
 - [ ] ID-57
[LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L43-L59) should emit an event for: 
	- [assignedTRENTokens += _totalSupply](contracts/TREN/LockedTREN.sol#L48) 

contracts/TREN/LockedTREN.sol#L43-L59


 - [ ] ID-58
[CommunityIssuance.setWeeklyTrenDistribution(uint256)](contracts/TREN/CommunityIssuance.sol#L156-L158) should emit an event for: 
	- [trenDistribution = _weeklyReward / DISTRIBUTION_DURATION](contracts/TREN/CommunityIssuance.sol#L157) 

contracts/TREN/CommunityIssuance.sol#L156-L158


 - [ ] ID-59
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L84-L93) should emit an event for: 
	- [TRENSupplyCap -= _fundToRemove](contracts/TREN/CommunityIssuance.sol#L90) 

contracts/TREN/CommunityIssuance.sol#L84-L93


## missing-zero-check
Impact: Low
Confidence: Medium
 - [ ] ID-60
[FlashLoanTester.setFlashLoanAddress(address)._flashLoan](contracts/TestContracts/FlashLoanTester.sol#L12) lacks a zero-check on :
		- [flashLoan = _flashLoan](contracts/TestContracts/FlashLoanTester.sol#L13)

contracts/TestContracts/FlashLoanTester.sol#L12


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-61
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [singleRedemption.debtLot = TrenMath._min(_maxDebtTokenAmount,trenBoxDebt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset))](contracts/TrenBoxManagerOperations.sol#L1062-L1065)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


 - [ ] ID-62
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [newDebt == IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/TrenBoxManagerOperations.sol#L1080)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


 - [ ] ID-63
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L195-L296) has external calls inside a loop: [currentBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(_asset,currentBorrower,totals.price) < IAdminContract(adminContract).getMcr(_asset)](contracts/TrenBoxManagerOperations.sol#L225-L228)

contracts/TrenBoxManagerOperations.sol#L195-L296


 - [ ] ID-64
[SafetyTransfer.decimalsCorrection(address,uint256)](contracts/Dependencies/SafetyTransfer.sol#L12-L31) has external calls inside a loop: [decimals = IERC20Decimals(_token).decimals()](contracts/Dependencies/SafetyTransfer.sol#L19)

contracts/Dependencies/SafetyTransfer.sol#L12-L31


 - [ ] ID-65
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L195-L296) has external calls inside a loop: [nextUserToCheck = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L243-L244)

contracts/TrenBoxManagerOperations.sol#L195-L296


 - [ ] ID-66
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [trenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1058)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


 - [ ] ID-67
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L353-L354)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-68
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L356-L365) has external calls inside a loop: [IAdminContract(adminContract).getRouteToTRENStaking()](contracts/FeeCollector.sol#L360)

contracts/FeeCollector.sol#L356-L365


 - [ ] ID-69
[TrenBase._getNetDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L35-L37) has external calls inside a loop: [_debt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L36)

contracts/Dependencies/TrenBase.sol#L35-L37


 - [ ] ID-70
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executePartialRedemption(_asset,_borrower,newDebt,newColl,newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManagerOperations.sol#L1100-L1108)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


 - [ ] ID-71
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L195-L296) has external calls inside a loop: [currentBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L230)

contracts/TrenBoxManagerOperations.sol#L195-L296


 - [ ] ID-72
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executeFullRedemption(_asset,_borrower,newColl)](contracts/TrenBoxManagerOperations.sol#L1081)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


 - [ ] ID-73
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [trenBoxDebt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1057)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


 - [ ] ID-74
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [currentTrenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingAssetReward(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L384-L389)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-75
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L405-L406)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-76
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L356-L365) has external calls inside a loop: [ITRENStaking(trenStaking).increaseFeeDebtToken(_feeAmount)](contracts/FeeCollector.sol#L361)

contracts/FeeCollector.sol#L356-L365


 - [ ] ID-77
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L426-L470) has external calls inside a loop: [currentNICR = ITrenBoxManager(trenBoxManager).getNominalICR(_asset,currentAddress)](contracts/TrenBoxManagerOperations.sol#L457-L458)

contracts/TrenBoxManagerOperations.sol#L426-L470


 - [ ] ID-78
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [currentTrenBoxBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(vars.asset,currentTrenBoxBorrower,vars.price) < IAdminContract(adminContract).getMcr(vars.asset)](contracts/TrenBoxManagerOperations.sol#L348-L351)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-79
[TrenBase._getCompositeDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L31-L33) has external calls inside a loop: [_debt + IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L32)

contracts/Dependencies/TrenBase.sol#L31-L33


 - [ ] ID-80
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L195-L296) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L246)

contracts/TrenBoxManagerOperations.sol#L195-L296


 - [ ] ID-81
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L426-L470) has external calls inside a loop: [currentAddress = ITrenBoxManager(trenBoxManager).getTrenBoxFromTrenBoxOwnersArray(_asset,arrayIndex)](contracts/TrenBoxManagerOperations.sol#L455-L456)

contracts/TrenBoxManagerOperations.sol#L426-L470


 - [ ] ID-82
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [maxRedeemableDebt = TrenMath._min(remainingDebt,currentTrenBoxNetDebt - IAdminContract(adminContract).getMinNetDebt(vars.asset))](contracts/TrenBoxManagerOperations.sol#L379-L383)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-83
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [currentTrenBoxNetDebt > IAdminContract(adminContract).getMinNetDebt(vars.asset)](contracts/TrenBoxManagerOperations.sol#L377)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-84
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L322-L410) has external calls inside a loop: [currentTrenBoxNetDebt = _getNetDebt(vars.asset,ITrenBoxManager(trenBoxManager).getTrenBoxDebt(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingDebtTokenReward(vars.asset,currentTrenBoxBorrower))](contracts/TrenBoxManagerOperations.sol#L366-L372)

contracts/TrenBoxManagerOperations.sol#L322-L410


 - [ ] ID-85
[FeeCollector.getProtocolRevenueDestination()](contracts/FeeCollector.sol#L197-L199) has external calls inside a loop: [IAdminContract(adminContract).getRouteToTRENStaking()](contracts/FeeCollector.sol#L198)

contracts/FeeCollector.sol#L197-L199


 - [ ] ID-86
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1045-L1112) has external calls inside a loop: [newNICR != _partialRedemptionHintNICR || _getNetDebt(_asset,newDebt) < IAdminContract(adminContract).getMinNetDebt(_asset)](contracts/TrenBoxManagerOperations.sol#L1092-L1094)

contracts/TrenBoxManagerOperations.sol#L1045-L1112


## reentrancy-benign
Impact: Low
Confidence: Medium
 - [ ] ID-87
Reentrancy in [StabilityPool._sendToStabilityPool(address,uint256)](contracts/StabilityPool.sol#L886-L891):
	External calls:
	- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L887)
	State variables written after the call(s):
	- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L889)

contracts/StabilityPool.sol#L886-L891


 - [ ] ID-88
Reentrancy in [StabilityPool._sendToDepositor(address,uint256)](contracts/StabilityPool.sol#L934-L940):
	External calls:
	- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L938)
	State variables written after the call(s):
	- [_decreaseDebtTokens(debtTokenWithdrawal)](contracts/StabilityPool.sol#L939)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L654)

contracts/StabilityPool.sol#L934-L940


 - [ ] ID-89
Reentrancy in [StabilityPool._sendGainsToDepositor(address,address[],uint256[])](contracts/StabilityPool.sol#L902-L931):
	External calls:
	- [IERC20(asset).safeTransfer(_to,amount)](contracts/StabilityPool.sol#L925)
	State variables written after the call(s):
	- [totalColl.amounts = _leftSubColls(totalColl,assets,amounts)](contracts/StabilityPool.sol#L930)

contracts/StabilityPool.sol#L902-L931


 - [ ] ID-90
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L413-L418):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	State variables written after the call(s):
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L416)
		- [epochToScaleToG[currentEpoch][currentScale] = newEpochToScaleToG](contracts/StabilityPool.sol#L437)
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L416)
		- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L464)

contracts/StabilityPool.sol#L413-L418


 - [ ] ID-91
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L639-L650):
	External calls:
	- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L646)
	State variables written after the call(s):
	- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L647)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L654)

contracts/StabilityPool.sol#L639-L650


 - [ ] ID-92
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L375-L410):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L388-L390)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L395)
	State variables written after the call(s):
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L400)
		- [totalStakes[_asset] = newTotal](contracts/TrenBoxManager.sol#L741)

contracts/TrenBoxManager.sol#L375-L410


 - [ ] ID-93
Reentrancy in [TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L519-L575):
	External calls:
	- [IStabilityPool(stabilityPool).offset(_debtToOffset,_asset,_collToSendToStabilityPool)](contracts/TrenBoxManager.sol#L531)
	State variables written after the call(s):
	- [L_Colls[_asset] = liquidatedColl](contracts/TrenBoxManager.sol#L568)
	- [L_Debts[_asset] = liquidatedDebt](contracts/TrenBoxManager.sol#L569)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L560-L561)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L562-L563)

contracts/TrenBoxManager.sol#L519-L575


 - [ ] ID-94
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
 - [ ] ID-95
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L375-L410):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L388-L390)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L395)
	Event emitted after the call(s):
	- [TotalStakesUpdated(_asset,newTotal)](contracts/TrenBoxManager.sol#L742)
		- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L400)
	- [TrenBoxUpdated(_asset,_borrower,_newDebt,_newColl,trenBox.stake,TrenBoxManagerOperation.redeemCollateral)](contracts/TrenBoxManager.sol#L402-L409)

contracts/TrenBoxManager.sol#L375-L410


 - [ ] ID-96
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L413-L418):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L415)
	Event emitted after the call(s):
	- [GainsUpdated(newEpochToScaleToG,currentEpoch,currentScale)](contracts/StabilityPool.sol#L438)
		- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L416)

contracts/StabilityPool.sol#L413-L418


 - [ ] ID-97
Reentrancy in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L167-L211):
	External calls:
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L203)
	Event emitted after the call(s):
	- [ExecuteTransaction(txHash,target,value,signature,data,eta)](contracts/Timelock.sol#L208)

contracts/Timelock.sol#L167-L211


 - [ ] ID-98
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L716-L837):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L805-L807)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L810)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L818)
	- [ICollSurplusPool(collSurplusPool).accountSurplus(_asset,_borrower,singleLiquidation.collSurplus)](contracts/TrenBoxManagerOperations.sol#L820-L822)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L824-L830)

contracts/TrenBoxManagerOperations.sol#L716-L837


 - [ ] ID-99
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L716-L837):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L747-L749)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L750)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L757)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L758-L764)

contracts/TrenBoxManagerOperations.sol#L716-L837


 - [ ] ID-100
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


 - [ ] ID-101
Reentrancy in [FeeCollector.handleRedemptionFee(address,uint256)](contracts/FeeCollector.sol#L190-L195):
	External calls:
	- [ITRENStaking(trenStaking).increaseFeeAsset(_asset,_amount)](contracts/FeeCollector.sol#L192)
	Event emitted after the call(s):
	- [RedemptionFeeCollected(_asset,_amount)](contracts/FeeCollector.sol#L194)

contracts/FeeCollector.sol#L190-L195


 - [ ] ID-102
Reentrancy in [FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L356-L365):
	External calls:
	- [IERC20(debtToken).safeTransfer(destination,_feeAmount)](contracts/FeeCollector.sol#L359)
	- [ITRENStaking(trenStaking).increaseFeeDebtToken(_feeAmount)](contracts/FeeCollector.sol#L361)
	Event emitted after the call(s):
	- [FeeCollected(_borrower,_asset,destination,_feeAmount)](contracts/FeeCollector.sol#L363)

contracts/FeeCollector.sol#L356-L365


 - [ ] ID-103
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


 - [ ] ID-104
Reentrancy in [TrenBoxManager.closeTrenBoxLiquidation(address,address)](contracts/TrenBoxManager.sol#L604-L617):
	External calls:
	- [_closeTrenBox(_asset,_borrower,Status.closedByLiquidation)](contracts/TrenBoxManager.sol#L612)
		- [ISortedTrenBoxes(sortedTrenBoxes).remove(_asset,_borrower)](contracts/TrenBoxManager.sol#L792)
	- [IFeeCollector(feeCollector).liquidateDebt(_borrower,_asset)](contracts/TrenBoxManager.sol#L613)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,_borrower,0,0,0,TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManager.sol#L614-L616)

contracts/TrenBoxManager.sol#L604-L617


 - [ ] ID-105
Reentrancy in [TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[])](contracts/TrenBoxManagerOperations.sol#L493-L569):
	External calls:
	- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L537-L539)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L747-L749)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L750)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L757)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L771-L773)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L774)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L785)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L805-L807)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L810)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L818)
		- [ICollSurplusPool(collSurplusPool).accountSurplus(_asset,_borrower,singleLiquidation.collSurplus)](contracts/TrenBoxManagerOperations.sol#L820-L822)
	- [singleLiquidation = _liquidateNormalMode(_asset,vars.user,vars.remainingDebtTokenInStabPool)](contracts/TrenBoxManagerOperations.sol#L557-L558)
		- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L684-L686)
		- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L687)
		- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L705)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L706-L712)
		- [singleLiquidation = _liquidateNormalMode(_asset,vars.user,vars.remainingDebtTokenInStabPool)](contracts/TrenBoxManagerOperations.sol#L557-L558)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L758-L764)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L537-L539)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L786-L792)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L537-L539)
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L824-L830)
		- [singleLiquidation = _liquidateRecoveryMode(_asset,vars.user,vars.ICR,vars.remainingDebtTokenInStabPool,TCR,_price)](contracts/TrenBoxManagerOperations.sol#L537-L539)

contracts/TrenBoxManagerOperations.sol#L493-L569


 - [ ] ID-106
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L639-L650):
	External calls:
	- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L646)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L655)
		- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L647)

contracts/StabilityPool.sol#L639-L650


 - [ ] ID-107
Reentrancy in [TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L668-L714):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L684-L686)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L687)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L705)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L706-L712)

contracts/TrenBoxManagerOperations.sol#L668-L714


 - [ ] ID-108
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L716-L837):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L771-L773)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L774)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L785)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L786-L792)

contracts/TrenBoxManagerOperations.sol#L716-L837


 - [ ] ID-109
Reentrancy in [FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L367-L372):
	External calls:
	- [IERC20(debtToken).safeTransfer(_borrower,_refundAmount)](contracts/FeeCollector.sol#L369)
	Event emitted after the call(s):
	- [FeeRefunded(_borrower,_asset,_refundAmount)](contracts/FeeCollector.sol#L370)

contracts/FeeCollector.sol#L367-L372


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-110
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L356-L365) uses timestamp for comparisons
	Dangerous comparisons:
	- [_feeAmount != 0](contracts/FeeCollector.sol#L357)

contracts/FeeCollector.sol#L356-L365


 - [ ] ID-111
[TrenBoxManagerOperations._validateRedemptionRequirements(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L1009-L1041) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionBlockTimestamp > block.timestamp](contracts/TrenBoxManagerOperations.sol#L1020)

contracts/TrenBoxManagerOperations.sol#L1009-L1041


 - [ ] ID-112
[LockedTREN.isEntityExits(address)](contracts/TREN/LockedTREN.sol#L133-L135) uses timestamp for comparisons
	Dangerous comparisons:
	- [entitiesVesting[_entity].createdDate != 0](contracts/TREN/LockedTREN.sol#L134)

contracts/TREN/LockedTREN.sol#L133-L135


 - [ ] ID-113
[LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L43-L59) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(entitiesVesting[_entity].createdDate == 0,Entity already has a Vesting Rule)](contracts/TREN/LockedTREN.sol#L46)

contracts/TREN/LockedTREN.sol#L43-L59


 - [ ] ID-114
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L93-L102) uses timestamp for comparisons
	Dangerous comparisons:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L95)

contracts/TREN/LockedTREN.sol#L93-L102


 - [ ] ID-115
[FeeCollector.simulateRefund(address,address,uint256)](contracts/FeeCollector.sol#L112-L136) uses timestamp for comparisons
	Dangerous comparisons:
	- [record.amount == 0 || record.to < block.timestamp](contracts/FeeCollector.sol#L125)

contracts/FeeCollector.sol#L112-L136


 - [ ] ID-116
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L84-L93) uses timestamp for comparisons
	Dangerous comparisons:
	- [totalTRENIssued > newCap](contracts/TREN/CommunityIssuance.sol#L86)

contracts/TREN/CommunityIssuance.sol#L84-L93


 - [ ] ID-117
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L313-L335) uses timestamp for comparisons
	Dangerous comparisons:
	- [_from > NOW](contracts/FeeCollector.sol#L323)
	- [NOW >= _to](contracts/FeeCollector.sol#L326)

contracts/FeeCollector.sol#L313-L335


 - [ ] ID-118
[FlashLoan.swapTokens(address,uint256,uint256)](contracts/FlashLoan.sol#L153-L180) uses timestamp for comparisons
	Dangerous comparisons:
	- [amountIn < _collAmountIn](contracts/FlashLoan.sol#L176)

contracts/FlashLoan.sol#L153-L180


 - [ ] ID-119
[FeeCollector._decreaseDebt(address,address,uint256)](contracts/FeeCollector.sol#L204-L236) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= NOW](contracts/FeeCollector.sol#L212)

contracts/FeeCollector.sol#L204-L236


 - [ ] ID-120
[CommunityIssuance.issueTREN()](contracts/TREN/CommunityIssuance.sol#L115-L133) uses timestamp for comparisons
	Dangerous comparisons:
	- [totalTRENIssued >= maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L118)
	- [totalIssuance > maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L123)

contracts/TREN/CommunityIssuance.sol#L115-L133


 - [ ] ID-121
[PriceFeed._fetchOracleScaledPrice(IPriceFeed.OracleRecord)](contracts/PriceFeed.sol#L129-L144) uses timestamp for comparisons
	Dangerous comparisons:
	- [oraclePrice != 0 && ! _isStalePrice(priceTimestamp,oracle.timeoutSeconds)](contracts/PriceFeed.sol#L140)

contracts/PriceFeed.sol#L129-L144


 - [ ] ID-122
[PriceFeed._isStalePrice(uint256,uint256)](contracts/PriceFeed.sol#L146-L155) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp - _priceTimestamp > _oracleTimeoutSeconds](contracts/PriceFeed.sol#L154)

contracts/PriceFeed.sol#L146-L155


 - [ ] ID-123
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L135-L143) uses timestamp for comparisons
	Dangerous comparisons:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L136)

contracts/TREN/CommunityIssuance.sol#L135-L143


 - [ ] ID-124
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L112-L127) uses timestamp for comparisons
	Dangerous comparisons:
	- [entityRule.startVestingDate > block.timestamp](contracts/TREN/LockedTREN.sol#L116)
	- [block.timestamp >= entityRule.endVestingDate](contracts/TREN/LockedTREN.sol#L118)

contracts/TREN/LockedTREN.sol#L112-L127


 - [ ] ID-125
[FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L367-L372) uses timestamp for comparisons
	Dangerous comparisons:
	- [_refundAmount != 0](contracts/FeeCollector.sol#L368)

contracts/FeeCollector.sol#L367-L372


 - [ ] ID-126
[FeeCollector.collectFees(address[],address[])](contracts/FeeCollector.sol#L160-L188) uses timestamp for comparisons
	Dangerous comparisons:
	- [expiredAmount > 0](contracts/FeeCollector.sol#L177)

contracts/FeeCollector.sol#L160-L188


 - [ ] ID-127
[FeeCollector._updateFeeRecord(address,address,uint256,IFeeCollector.FeeRecord)](contracts/FeeCollector.sol#L275-L299) uses timestamp for comparisons
	Dangerous comparisons:
	- [NOW < _sRecord.from](contracts/FeeCollector.sol#L285)

contracts/FeeCollector.sol#L275-L299


 - [ ] ID-128
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L71-L103) uses timestamp for comparisons
	Dangerous comparisons:
	- [timeSinceSequencerUp <= delay](contracts/Pricing/PriceFeedL2.sol#L99)

contracts/Pricing/PriceFeedL2.sol#L71-L103


 - [ ] ID-129
[TrenBoxManager._updateLastFeeOpTime(address)](contracts/TrenBoxManager.sol#L850-L858) uses timestamp for comparisons
	Dangerous comparisons:
	- [timePassed >= SECONDS_IN_ONE_MINUTE](contracts/TrenBoxManager.sol#L852)

contracts/TrenBoxManager.sol#L850-L858


 - [ ] ID-130
[Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L167-L211) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < eta](contracts/Timelock.sol#L186)
	- [block.timestamp > eta + GRACE_PERIOD](contracts/Timelock.sol#L189)

contracts/Timelock.sol#L167-L211


 - [ ] ID-131
[TrenBoxManager._calcRedemptionFee(uint256,uint256)](contracts/TrenBoxManager.sol#L835-L848) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionFee >= _assetDraw](contracts/TrenBoxManager.sol#L844)

contracts/TrenBoxManager.sol#L835-L848


 - [ ] ID-132
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L106-L113) uses timestamp for comparisons
	Dangerous comparisons:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L107)

contracts/TREN/CommunityIssuance.sol#L106-L113


 - [ ] ID-133
[FeeCollector._createOrUpdateFeeRecord(address,address,uint256)](contracts/FeeCollector.sol#L238-L257) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= block.timestamp](contracts/FeeCollector.sol#L250)

contracts/FeeCollector.sol#L238-L257


 - [ ] ID-134
[Timelock.queueTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L123-L146) uses timestamp for comparisons
	Dangerous comparisons:
	- [eta < block.timestamp + delay || eta > block.timestamp + delay + GRACE_PERIOD](contracts/Timelock.sol#L134)

contracts/Timelock.sol#L123-L146


 - [ ] ID-135
[TrenBoxManager.updateBaseRateFromRedemption(address,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L438-L455) uses timestamp for comparisons
	Dangerous comparisons:
	- [assert(bool)(newBaseRate != 0)](contracts/TrenBoxManager.sol#L451)

contracts/TrenBoxManager.sol#L438-L455


 - [ ] ID-136
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L104-L110) uses timestamp for comparisons
	Dangerous comparisons:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L107)

contracts/TREN/LockedTREN.sol#L104-L110


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
Variable [IBorrowerOperations.withdrawColl(address,uint256,address,address)._assetAmount](contracts/Interfaces/IBorrowerOperations.sol#L97) is too similar to [BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).assetAmount_](contracts/BorrowerOperations.sol#L109-L111)

contracts/Interfaces/IBorrowerOperations.sol#L97


 - [ ] ID-141
Variable [IBorrowerOperations.openTrenBox(address,uint256,uint256,address,address)._assetAmount](contracts/Interfaces/IBorrowerOperations.sol#L80) is too similar to [BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).assetAmount_](contracts/BorrowerOperations.sol#L109-L111)

contracts/Interfaces/IBorrowerOperations.sol#L80


 - [ ] ID-142
Variable [BorrowerOperations.openTrenBox(address,uint256,uint256,address,address)._assetAmount](contracts/BorrowerOperations.sol#L51) is too similar to [BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).assetAmount_](contracts/BorrowerOperations.sol#L109-L111)

contracts/BorrowerOperations.sol#L51


 - [ ] ID-143
Variable [AdminContract.CCR_DEFAULT](contracts/AdminContract.sol#L30) is too similar to [AdminContract.MCR_DEFAULT](contracts/AdminContract.sol#L31)

contracts/AdminContract.sol#L30


 - [ ] ID-144
Variable [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound1](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L71) is too similar to [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound2](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L83)

contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L71


## too-many-digits
Impact: Informational
Confidence: Medium
 - [ ] ID-145
[BytesLib.toAddress(bytes,uint256)](contracts/TestContracts/MockUniswapRouterV3.sol#L58-L68) uses literals with too many digits:
	- [tempAddress = mload(uint256)(_bytes + 0x20 + _start) / 0x1000000000000000000000000](contracts/TestContracts/MockUniswapRouterV3.sol#L64)

contracts/TestContracts/MockUniswapRouterV3.sol#L58-L68


