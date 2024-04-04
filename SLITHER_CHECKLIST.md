Summary
 - [unchecked-transfer](#unchecked-transfer) (1 results) (High)
 - [uninitialized-state](#uninitialized-state) (1 results) (High)
 - [divide-before-multiply](#divide-before-multiply) (8 results) (Medium)
 - [incorrect-equality](#incorrect-equality) (4 results) (Medium)
 - [reentrancy-no-eth](#reentrancy-no-eth) (5 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (16 results) (Medium)
 - [unused-return](#unused-return) (5 results) (Medium)
 - [events-access](#events-access) (9 results) (Low)
 - [events-maths](#events-maths) (3 results) (Low)
 - [missing-zero-check](#missing-zero-check) (10 results) (Low)
 - [calls-loop](#calls-loop) (24 results) (Low)
 - [reentrancy-benign](#reentrancy-benign) (8 results) (Low)
 - [reentrancy-events](#reentrancy-events) (24 results) (Low)
 - [timestamp](#timestamp) (26 results) (Low)
 - [dead-code](#dead-code) (2 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
 - [similar-names](#similar-names) (6 results) (Informational)
 - [constable-states](#constable-states) (2 results) (Optimization)
## unchecked-transfer
Impact: High
Confidence: Medium
 - [ ] ID-0
[TRENStaking.stake(uint256)](contracts/TREN/TRENStaking.sol#L98-L137) ignores return value by [trenToken.transferFrom(msg.sender,address(this),_TRENamount)](contracts/TREN/TRENStaking.sol#L134)

contracts/TREN/TRENStaking.sol#L98-L137


## uninitialized-state
Impact: High
Confidence: High
 - [ ] ID-1
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
 - [ ] ID-2
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L319-L341) performs a multiplication on the result of a division:
	- [decayRate = (_amount * PRECISION) / lifeTime](contracts/FeeCollector.sol#L338)
	- [expiredAmount = (elapsedTime * decayRate) / PRECISION](contracts/FeeCollector.sol#L339)

contracts/FeeCollector.sol#L319-L341


 - [ ] ID-3
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) performs a multiplication on the result of a division:
	- [collLot = (maxRedeemableDebt * DECIMAL_PRECISION) / vars.price](contracts/TrenBoxManagerOperations.sol#L406)
	- [collLot = (collLot * redemptionSofteningParam) / PERCENTAGE_PRECISION](contracts/TrenBoxManagerOperations.sol#L408)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-4
[StabilityPool._computeRewardsPerUnitStaked(address,uint256,uint256,uint256)](contracts/StabilityPool.sol#L522-L552) performs a multiplication on the result of a division:
	- [collGainPerUnitStaked = collateralNumerator / _totalDeposits](contracts/StabilityPool.sol#L549)
	- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L550-L551)

contracts/StabilityPool.sol#L522-L552


 - [ ] ID-5
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L525-L581) performs a multiplication on the result of a division:
	- [debtRewardPerUnitStaked = debtNumerator / assetStakes](contracts/TrenBoxManager.sol#L564)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L568-L569)

contracts/TrenBoxManager.sol#L525-L581


 - [ ] ID-6
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L133-L139) performs a multiplication on the result of a division:
	- [timePassed = (block.timestamp - lastUpdateTime) / SECONDS_IN_ONE_MINUTE](contracts/TREN/CommunityIssuance.sol#L135)
	- [totalDistribuedSinceBeginning = trenDistribution * timePassed](contracts/TREN/CommunityIssuance.sol#L136)

contracts/TREN/CommunityIssuance.sol#L133-L139


 - [ ] ID-7
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L112-L127) performs a multiplication on the result of a division:
	- [claimable = ((entityRule.totalSupply / TWO_YEARS) * (block.timestamp - entityRule.createdDate)) - entityRule.claimed](contracts/TREN/LockedTREN.sol#L121-L123)

contracts/TREN/LockedTREN.sol#L112-L127


 - [ ] ID-8
[TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L525-L581) performs a multiplication on the result of a division:
	- [collRewardPerUnitStaked = collNumerator / assetStakes](contracts/TrenBoxManager.sol#L563)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L566-L567)

contracts/TrenBoxManager.sol#L525-L581


 - [ ] ID-9
[StabilityPool._computeTRENPerUnitStaked(uint256,uint256)](contracts/StabilityPool.sol#L440-L465) performs a multiplication on the result of a division:
	- [TRENPerUnitStaked = TRENNumerator / _totalDeposits](contracts/StabilityPool.sol#L462)
	- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L463)

contracts/StabilityPool.sol#L440-L465


## incorrect-equality
Impact: Medium
Confidence: High
 - [ ] ID-10
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L93-L102) uses a dangerous strict equality:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L95)

contracts/TREN/LockedTREN.sol#L93-L102


 - [ ] ID-11
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L104-L111) uses a dangerous strict equality:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L105)

contracts/TREN/CommunityIssuance.sol#L104-L111


 - [ ] ID-12
[CommunityIssuance.sendTREN(address,uint256)](contracts/TREN/CommunityIssuance.sol#L141-L150) uses a dangerous strict equality:
	- [safeAmount == 0](contracts/TREN/CommunityIssuance.sol#L145)

contracts/TREN/CommunityIssuance.sol#L141-L150


 - [ ] ID-13
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L104-L110) uses a dangerous strict equality:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L107)

contracts/TREN/LockedTREN.sol#L104-L110


## reentrancy-no-eth
Impact: Medium
Confidence: Medium
 - [ ] ID-14
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L379-L408):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L389)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L399)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L987)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L400)
		- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L924)
	State variables written after the call(s):
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L404)
		- [depositSnapshots[_depositor].S[colls[i]] = 0](contracts/StabilityPool.sol#L946)
		- [depositorSnapshots.P = 0](contracts/StabilityPool.sol#L951)
		- [depositorSnapshots.G = 0](contracts/StabilityPool.sol#L952)
		- [depositorSnapshots.epoch = 0](contracts/StabilityPool.sol#L953)
		- [depositorSnapshots.scale = 0](contracts/StabilityPool.sol#L954)
		- [depositSnapshots[_depositor].S[asset] = currentS](contracts/StabilityPool.sol#L965)
		- [depositorSnapshots.P = currentP](contracts/StabilityPool.sol#L972)
		- [depositorSnapshots.G = currentG](contracts/StabilityPool.sol#L973)
		- [depositorSnapshots.scale = currentScaleCached](contracts/StabilityPool.sol#L974)
		- [depositorSnapshots.epoch = currentEpochCached](contracts/StabilityPool.sol#L975)
	[StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L209) can be used in cross function reentrancies:
	- [StabilityPool.S(address,address)](contracts/StabilityPool.sol#L980-L982)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L209)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L804-L816)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L660-L681)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L759-L767)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L404)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L939)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L199) can be used in cross function reentrancies:
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L379-L408)
	- [StabilityPool.deposits](contracts/StabilityPool.sol#L199)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L804-L816)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L660-L681)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L759-L767)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L400)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L644)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L192) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L642-L646)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L419-L438)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L311-L313)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500)

contracts/StabilityPool.sol#L379-L408


 - [ ] ID-15
Reentrancy in [StabilityPool.provideToSP(uint256,address[])](contracts/StabilityPool.sol#L327-L362):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L339)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L347)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L987)
	- [_sendToStabilityPool(msg.sender,_amount)](contracts/StabilityPool.sol#L351)
		- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L877)
	State variables written after the call(s):
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L354)
		- [depositSnapshots[_depositor].S[colls[i]] = 0](contracts/StabilityPool.sol#L946)
		- [depositorSnapshots.P = 0](contracts/StabilityPool.sol#L951)
		- [depositorSnapshots.G = 0](contracts/StabilityPool.sol#L952)
		- [depositorSnapshots.epoch = 0](contracts/StabilityPool.sol#L953)
		- [depositorSnapshots.scale = 0](contracts/StabilityPool.sol#L954)
		- [depositSnapshots[_depositor].S[asset] = currentS](contracts/StabilityPool.sol#L965)
		- [depositorSnapshots.P = currentP](contracts/StabilityPool.sol#L972)
		- [depositorSnapshots.G = currentG](contracts/StabilityPool.sol#L973)
		- [depositorSnapshots.scale = currentScaleCached](contracts/StabilityPool.sol#L974)
		- [depositorSnapshots.epoch = currentEpochCached](contracts/StabilityPool.sol#L975)
	[StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L209) can be used in cross function reentrancies:
	- [StabilityPool.S(address,address)](contracts/StabilityPool.sol#L980-L982)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool.depositSnapshots](contracts/StabilityPool.sol#L209)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L804-L816)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L660-L681)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L759-L767)
	- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L354)
		- [deposits[_depositor] = _newValue](contracts/StabilityPool.sol#L939)
	[StabilityPool.deposits](contracts/StabilityPool.sol#L199) can be used in cross function reentrancies:
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L379-L408)
	- [StabilityPool.deposits](contracts/StabilityPool.sol#L199)
	- [StabilityPool.getCompoundedDebtTokenDeposits(address)](contracts/StabilityPool.sol#L804-L816)
	- [StabilityPool.getDepositorGains(address,address[])](contracts/StabilityPool.sol#L660-L681)
	- [StabilityPool.getDepositorTRENGain(address)](contracts/StabilityPool.sol#L759-L767)
	- [_sendToStabilityPool(msg.sender,_amount)](contracts/StabilityPool.sol#L351)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L879)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L192) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L642-L646)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L419-L438)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L311-L313)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500)

contracts/StabilityPool.sol#L327-L362


 - [ ] ID-16
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L491)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L499)
		- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L636)
		- [IDebtToken(debtToken).burn(address(this),_debtToOffset)](contracts/StabilityPool.sol#L638)
		- [IActivePool(activePool).sendAsset(_asset,address(this),_amount)](contracts/StabilityPool.sol#L639)
	State variables written after the call(s):
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L499)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L644)
	[StabilityPool.totalDebtTokenDeposits](contracts/StabilityPool.sol#L192) can be used in cross function reentrancies:
	- [StabilityPool._decreaseDebtTokens(uint256)](contracts/StabilityPool.sol#L642-L646)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L419-L438)
	- [StabilityPool.getTotalDebtTokenDeposits()](contracts/StabilityPool.sol#L311-L313)
	- [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500)

contracts/StabilityPool.sol#L479-L500


 - [ ] ID-17
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L391-L393)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L398)
	State variables written after the call(s):
	- [trenBox.debt = _newDebt](contracts/TrenBoxManager.sol#L401)
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L66) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L66)
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
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L66) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L66)
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
	[TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L66) can be used in cross function reentrancies:
	- [TrenBoxManager.TrenBoxes](contracts/TrenBoxManager.sol#L66)
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


 - [ ] ID-18
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L491)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	State variables written after the call(s):
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
		- [P = newP](contracts/StabilityPool.sol#L616)
	[StabilityPool.P](contracts/StabilityPool.sol#L219) can be used in cross function reentrancies:
	- [StabilityPool.P](contracts/StabilityPool.sol#L219)
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L819-L870)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L419-L438)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L554-L618)
	- [StabilityPool.initialize()](contracts/StabilityPool.sol#L262-L269)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
		- [currentEpoch = currentEpochCached](contracts/StabilityPool.sol#L593)
	[StabilityPool.currentEpoch](contracts/StabilityPool.sol#L227) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L819-L870)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L419-L438)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L554-L618)
	- [StabilityPool.currentEpoch](contracts/StabilityPool.sol#L227)
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
		- [currentScale = 0](contracts/StabilityPool.sol#L595)
		- [currentScale = currentScaleCached](contracts/StabilityPool.sol#L608)
	[StabilityPool.currentScale](contracts/StabilityPool.sol#L224) can be used in cross function reentrancies:
	- [StabilityPool._getCompoundedStakeFromSnapshots(uint256,IStabilityPool.Snapshots)](contracts/StabilityPool.sol#L819-L870)
	- [StabilityPool._updateDepositAndSnapshots(address,uint256)](contracts/StabilityPool.sol#L938-L978)
	- [StabilityPool._updateG(uint256)](contracts/StabilityPool.sol#L419-L438)
	- [StabilityPool._updateRewardSumAndProduct(address,uint256,uint256)](contracts/StabilityPool.sol#L554-L618)
	- [StabilityPool.currentScale](contracts/StabilityPool.sol#L224)

contracts/StabilityPool.sol#L479-L500


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-19
[TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L689) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L689


 - [ ] ID-20
[TrenBoxManagerOperations._getTotalsFromBatchLiquidate_NormalMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L593) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L593


 - [ ] ID-21
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(address,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L870) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L870


 - [ ] ID-22
[PriceFeed._fetchOracleScaledPrice(IPriceFeed.OracleRecordV2).priceTimestamp](contracts/PriceFeed.sol#L143) is a local variable never initialized

contracts/PriceFeed.sol#L143


 - [ ] ID-23
[TrenBoxManagerOperations.batchLiquidateTrenBoxes(address,address[]).vars](contracts/TrenBoxManagerOperations.sol#L148) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L148


 - [ ] ID-24
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L740) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L740


 - [ ] ID-25
[TrenBoxManagerOperations._getTotalFromBatchLiquidate_RecoveryMode(address,uint256,uint256,address[]).vars](contracts/TrenBoxManagerOperations.sol#L515) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L515


 - [ ] ID-26
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address).vars](contracts/BorrowerOperations.sol#L101) is a local variable never initialized

contracts/BorrowerOperations.sol#L101


 - [ ] ID-27
[TrenBoxManagerOperations.liquidateTrenBoxes(address,uint256).vars](contracts/TrenBoxManagerOperations.sol#L79) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L79


 - [ ] ID-28
[TRENStaking.increaseFee_Asset(address,uint256).assetFeePerTRENStaked](contracts/TREN/TRENStaking.sol#L209) is a local variable never initialized

contracts/TREN/TRENStaking.sol#L209


 - [ ] ID-29
[TrenBoxManagerOperations._getTotalsFromLiquidateTrenBoxesSequence_NormalMode(address,uint256,uint256,uint256).vars](contracts/TrenBoxManagerOperations.sol#L654) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L654


 - [ ] ID-30
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256).totals](contracts/TrenBoxManagerOperations.sol#L220) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L220


 - [ ] ID-31
[PriceFeed._fetchOracleScaledPrice(IPriceFeed.OracleRecordV2).oraclePrice](contracts/PriceFeed.sol#L142) is a local variable never initialized

contracts/PriceFeed.sol#L142


 - [ ] ID-32
[TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256).zeroVals](contracts/TrenBoxManagerOperations.sol#L847) is a local variable never initialized

contracts/TrenBoxManagerOperations.sol#L847


 - [ ] ID-33
[TRENStaking.increaseFee_DebtToken(uint256).feePerTRENStaked](contracts/TREN/TRENStaking.sol#L225) is a local variable never initialized

contracts/TREN/TRENStaking.sol#L225


 - [ ] ID-34
[BorrowerOperations._adjustTrenBox(address,uint256,address,uint256,uint256,bool,address,address).vars](contracts/BorrowerOperations.sol#L275) is a local variable never initialized

contracts/BorrowerOperations.sol#L275


## unused-return
Impact: Medium
Confidence: Medium
 - [ ] ID-35
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address)](contracts/BorrowerOperations.sol#L87-L173) ignores return value by [ITrenBoxManager(trenBoxManager).increaseTrenBoxColl(vars.asset,msg.sender,_assetAmount)](contracts/BorrowerOperations.sol#L140)

contracts/BorrowerOperations.sol#L87-L173


 - [ ] ID-36
[BorrowerOperations.openTrenBox(address,uint256,uint256,address,address)](contracts/BorrowerOperations.sol#L87-L173) ignores return value by [ITrenBoxManager(trenBoxManager).increaseTrenBoxDebt(vars.asset,msg.sender,vars.compositeDebt)](contracts/BorrowerOperations.sol#L141-L143)

contracts/BorrowerOperations.sol#L87-L173


 - [ ] ID-37
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) ignores return value by [ITrenBoxManager(trenBoxManager).updateBaseRateFromRedemption(_asset,totals.totalCollDrawn,totals.price,totals.totalDebtTokenSupplyAtStart)](contracts/TrenBoxManagerOperations.sol#L286-L288)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-38
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L74-L106) ignores return value by [(answer,updatedAt) = ChainlinkAggregatorV3Interface(sequencerUptimeFeedAddress).latestRoundData()](contracts/Pricing/PriceFeedL2.sol#L77-L85)

contracts/Pricing/PriceFeedL2.sol#L74-L106


 - [ ] ID-39
[PriceFeed._fetchChainlinkOracleResponse(address)](contracts/PriceFeed.sol#L169-L188) ignores return value by [(roundId,answer,updatedAt) = ChainlinkAggregatorV3Interface(_oracleAddress).latestRoundData()](contracts/PriceFeed.sol#L174-L187)

contracts/PriceFeed.sol#L169-L188


## events-access
Impact: Low
Confidence: Medium
 - [ ] ID-40
[TRENStaking.setAddresses(address,address,address,address,address)](contracts/TREN/TRENStaking.sol#L74-L95) should emit an event for: 
	- [feeCollectorAddress = _feeCollectorAddress](contracts/TREN/TRENStaking.sol#L87) 
	- [trenBoxManagerAddress = _trenBoxManagerAddress](contracts/TREN/TRENStaking.sol#L90) 

contracts/TREN/TRENStaking.sol#L74-L95


 - [ ] ID-41
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L39-L62) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/AddressesConfigurable.sol#L45) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 

contracts/Dependencies/AddressesConfigurable.sol#L39-L62


 - [ ] ID-42
[CommunityIssuance.setAdminContract(address)](contracts/TREN/CommunityIssuance.sol#L72-L75) should emit an event for: 
	- [adminContract = _admin](contracts/TREN/CommunityIssuance.sol#L74) 

contracts/TREN/CommunityIssuance.sol#L72-L75


 - [ ] ID-43
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L39-L62) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 

contracts/Dependencies/AddressesConfigurable.sol#L39-L62


 - [ ] ID-44
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L39-L62) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [defaultPool = _addresses[5]](contracts/Dependencies/AddressesConfigurable.sol#L50) 
	- [stabilityPool = _addresses[10]](contracts/Dependencies/AddressesConfigurable.sol#L55) 
	- [stabilityPool = _addresses[10]](contracts/Dependencies/AddressesConfigurable.sol#L55) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 
	- [trenBoxManagerOperations = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L59) 

contracts/Dependencies/AddressesConfigurable.sol#L39-L62


 - [ ] ID-45
[CommunityIssuance.setAddresses(address,address,address)](contracts/TREN/CommunityIssuance.sol#L57-L70) should emit an event for: 
	- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L66) 

contracts/TREN/CommunityIssuance.sol#L57-L70


 - [ ] ID-46
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L39-L62) should emit an event for: 
	- [activePool = _addresses[0]](contracts/Dependencies/AddressesConfigurable.sol#L45) 
	- [adminContract = _addresses[1]](contracts/Dependencies/AddressesConfigurable.sol#L46) 
	- [trenBoxManager = _addresses[13]](contracts/Dependencies/AddressesConfigurable.sol#L58) 

contracts/Dependencies/AddressesConfigurable.sol#L39-L62


 - [ ] ID-47
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L39-L62) should emit an event for: 
	- [timelockAddress = _addresses[11]](contracts/Dependencies/AddressesConfigurable.sol#L56) 

contracts/Dependencies/AddressesConfigurable.sol#L39-L62


 - [ ] ID-48
[AddressesConfigurable.setAddresses(address[])](contracts/Dependencies/AddressesConfigurable.sol#L39-L62) should emit an event for: 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [borrowerOperations = _addresses[2]](contracts/Dependencies/AddressesConfigurable.sol#L47) 
	- [trenBoxManagerOperations = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L59) 
	- [trenBoxManagerOperations = _addresses[14]](contracts/Dependencies/AddressesConfigurable.sol#L59) 

contracts/Dependencies/AddressesConfigurable.sol#L39-L62


## events-maths
Impact: Low
Confidence: Medium
 - [ ] ID-49
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L81-L91) should emit an event for: 
	- [TRENSupplyCap -= _fundToRemove](contracts/TREN/CommunityIssuance.sol#L88) 

contracts/TREN/CommunityIssuance.sol#L81-L91


 - [ ] ID-50
[LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L43-L59) should emit an event for: 
	- [assignedTRENTokens += _totalSupply](contracts/TREN/LockedTREN.sol#L48) 

contracts/TREN/LockedTREN.sol#L43-L59


 - [ ] ID-51
[CommunityIssuance.setWeeklyTrenDistribution(uint256)](contracts/TREN/CommunityIssuance.sol#L152-L154) should emit an event for: 
	- [trenDistribution = _weeklyReward / DISTRIBUTION_DURATION](contracts/TREN/CommunityIssuance.sol#L153) 

contracts/TREN/CommunityIssuance.sol#L152-L154


## missing-zero-check
Impact: Low
Confidence: Medium
 - [ ] ID-52
[TRENStaking.setAddresses(address,address,address,address,address)._feeCollectorAddress](contracts/TREN/TRENStaking.sol#L76) lacks a zero-check on :
		- [feeCollectorAddress = _feeCollectorAddress](contracts/TREN/TRENStaking.sol#L87)

contracts/TREN/TRENStaking.sol#L76


 - [ ] ID-53
[PriceFeedL2.setSequencerUptimeFeedAddress(address)._sequencerUptimeFeedAddress](contracts/Pricing/PriceFeedL2.sol#L44) lacks a zero-check on :
		- [sequencerUptimeFeedAddress = _sequencerUptimeFeedAddress](contracts/Pricing/PriceFeedL2.sol#L50)

contracts/Pricing/PriceFeedL2.sol#L44


 - [ ] ID-54
[TRENStaking.setAddresses(address,address,address,address,address)._debtTokenAddress](contracts/TREN/TRENStaking.sol#L75) lacks a zero-check on :
		- [debtTokenAddress = _debtTokenAddress](contracts/TREN/TRENStaking.sol#L86)

contracts/TREN/TRENStaking.sol#L75


 - [ ] ID-55
[TRENStaking.setAddresses(address,address,address,address,address)._trenBoxManagerAddress](contracts/TREN/TRENStaking.sol#L79) lacks a zero-check on :
		- [trenBoxManagerAddress = _trenBoxManagerAddress](contracts/TREN/TRENStaking.sol#L90)

contracts/TREN/TRENStaking.sol#L79


 - [ ] ID-56
[TRENStaking.setAddresses(address,address,address,address,address)._treasuryAddress](contracts/TREN/TRENStaking.sol#L78) lacks a zero-check on :
		- [treasuryAddress = _treasuryAddress](contracts/TREN/TRENStaking.sol#L89)

contracts/TREN/TRENStaking.sol#L78


 - [ ] ID-57
[Timelock.setPendingAdmin(address)._pendingAdmin](contracts/Timelock.sol#L101) lacks a zero-check on :
		- [pendingAdmin = _pendingAdmin](contracts/Timelock.sol#L105)

contracts/Timelock.sol#L101


 - [ ] ID-58
[AddressesConfigurable.setCommunityIssuance(address)._communityIssuance](contracts/Dependencies/AddressesConfigurable.sol#L64) lacks a zero-check on :
		- [communityIssuance = _communityIssuance](contracts/Dependencies/AddressesConfigurable.sol#L65)

contracts/Dependencies/AddressesConfigurable.sol#L64


 - [ ] ID-59
[AddressesConfigurable.setTRENStaking(address)._trenStaking](contracts/Dependencies/AddressesConfigurable.sol#L68) lacks a zero-check on :
		- [trenStaking = _trenStaking](contracts/Dependencies/AddressesConfigurable.sol#L69)

contracts/Dependencies/AddressesConfigurable.sol#L68


 - [ ] ID-60
[Timelock.executeTransaction(address,uint256,string,bytes,uint256).target](contracts/Timelock.sol#L155) lacks a zero-check on :
		- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L188)

contracts/Timelock.sol#L155


 - [ ] ID-61
[CommunityIssuance.setAddresses(address,address,address)._adminContract](contracts/TREN/CommunityIssuance.sol#L60) lacks a zero-check on :
		- [adminContract = _adminContract](contracts/TREN/CommunityIssuance.sol#L66)

contracts/TREN/CommunityIssuance.sol#L60


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-62
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [newNICR != _partialRedemptionHintNICR || _getNetDebt(_asset,newDebt) < IAdminContract(adminContract).getMinNetDebt(_asset)](contracts/TrenBoxManagerOperations.sol#L1112-L1114)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-63
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executePartialRedemption(_asset,_borrower,newDebt,newColl,newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManagerOperations.sol#L1120-L1128)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-64
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingAssetReward(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L399-L404)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-65
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).executeFullRedemption(_asset,_borrower,newColl)](contracts/TrenBoxManagerOperations.sol#L1100)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-66
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(vars.asset,currentTrenBoxBorrower,vars.price) < IAdminContract(adminContract).getMcr(vars.asset)](contracts/TrenBoxManagerOperations.sol#L363-L366)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-67
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxNetDebt = _getNetDebt(vars.asset,ITrenBoxManager(trenBoxManager).getTrenBoxDebt(vars.asset,currentTrenBoxBorrower) + ITrenBoxManager(trenBoxManager).getPendingDebtTokenReward(vars.asset,currentTrenBoxBorrower))](contracts/TrenBoxManagerOperations.sol#L381-L387)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-68
[SafetyTransfer.decimalsCorrection(address,uint256)](contracts/Dependencies/SafetyTransfer.sol#L12-L31) has external calls inside a loop: [decimals = IERC20Decimals(_token).decimals()](contracts/Dependencies/SafetyTransfer.sol#L19)

contracts/Dependencies/SafetyTransfer.sol#L12-L31


 - [ ] ID-69
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [maxRedeemableDebt = TrenMath._min(remainingDebt,currentTrenBoxNetDebt - IAdminContract(adminContract).getMinNetDebt(vars.asset))](contracts/TrenBoxManagerOperations.sol#L394-L398)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-70
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L257)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-71
[TrenBase._getCompositeDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L29-L31) has external calls inside a loop: [_debt + IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L30)

contracts/Dependencies/TrenBase.sol#L29-L31


 - [ ] ID-72
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [nextUserToCheck = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L254-L255)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-73
[TrenBase._getNetDebt(address,uint256)](contracts/Dependencies/TrenBase.sol#L33-L35) has external calls inside a loop: [_debt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/Dependencies/TrenBase.sol#L34)

contracts/Dependencies/TrenBase.sol#L33-L35


 - [ ] ID-74
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L439-L483) has external calls inside a loop: [currentAddress = ITrenBoxManager(trenBoxManager).getTrenBoxFromTrenBoxOwnersArray(_asset,arrayIndex)](contracts/TrenBoxManagerOperations.sol#L468-L469)

contracts/TrenBoxManagerOperations.sol#L439-L483


 - [ ] ID-75
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [singleRedemption.debtLot = TrenMath._min(_maxDebtTokenAmount,trenBoxDebt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset))](contracts/TrenBoxManagerOperations.sol#L1081-L1084)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-76
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [trenBoxDebt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1076)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-77
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [trenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L1077)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-78
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [currentBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset,currentBorrower)](contracts/TrenBoxManagerOperations.sol#L241)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-79
[TrenBoxManagerOperations._redeemCollateralFromTrenBox(address,address,uint256,uint256,address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L1064-L1132) has external calls inside a loop: [newDebt == IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)](contracts/TrenBoxManagerOperations.sol#L1099)

contracts/TrenBoxManagerOperations.sol#L1064-L1132


 - [ ] ID-80
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxNetDebt > IAdminContract(adminContract).getMinNetDebt(vars.asset)](contracts/TrenBoxManagerOperations.sol#L392)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-81
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L368-L369)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-82
[TrenBoxManagerOperations.redeemCollateral(address,uint256,address,address,address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L207-L307) has external calls inside a loop: [currentBorrower != address(0) && ITrenBoxManager(trenBoxManager).getCurrentICR(_asset,currentBorrower,totals.price) < IAdminContract(adminContract).getMcr(_asset)](contracts/TrenBoxManagerOperations.sol#L236-L239)

contracts/TrenBoxManagerOperations.sol#L207-L307


 - [ ] ID-83
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L362-L371) has external calls inside a loop: [ITRENStaking(trenStaking).increaseFee_DebtToken(_feeAmount)](contracts/FeeCollector.sol#L367)

contracts/FeeCollector.sol#L362-L371


 - [ ] ID-84
[TrenBoxManagerOperations.getRedemptionHints(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L337-L425) has external calls inside a loop: [currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset,currentTrenBoxBorrower)](contracts/TrenBoxManagerOperations.sol#L420-L421)

contracts/TrenBoxManagerOperations.sol#L337-L425


 - [ ] ID-85
[TrenBoxManagerOperations.getApproxHint(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L439-L483) has external calls inside a loop: [currentNICR = ITrenBoxManager(trenBoxManager).getNominalICR(_asset,currentAddress)](contracts/TrenBoxManagerOperations.sol#L470-L471)

contracts/TrenBoxManagerOperations.sol#L439-L483


## reentrancy-benign
Impact: Low
Confidence: Medium
 - [ ] ID-86
Reentrancy in [TrenBoxManager.redistributeDebtAndColl(address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L525-L581):
	External calls:
	- [IStabilityPool(stabilityPool).offset(_debtToOffset,_asset,_collToSendToStabilityPool)](contracts/TrenBoxManager.sol#L537)
	State variables written after the call(s):
	- [L_Colls[_asset] = liquidatedColl](contracts/TrenBoxManager.sol#L574)
	- [L_Debts[_asset] = liquidatedDebt](contracts/TrenBoxManager.sol#L575)
	- [lastCollError_Redistribution[_asset] = collNumerator - (collRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L566-L567)
	- [lastDebtError_Redistribution[_asset] = debtNumerator - (debtRewardPerUnitStaked * assetStakes)](contracts/TrenBoxManager.sol#L568-L569)

contracts/TrenBoxManager.sol#L525-L581


 - [ ] ID-87
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L391-L393)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L398)
	State variables written after the call(s):
	- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L403)
		- [totalStakes[_asset] = newTotal](contracts/TrenBoxManager.sol#L747)

contracts/TrenBoxManager.sol#L378-L413


 - [ ] ID-88
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L629-L640):
	External calls:
	- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L636)
	State variables written after the call(s):
	- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L637)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L644)

contracts/StabilityPool.sol#L629-L640


 - [ ] ID-89
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L491)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	State variables written after the call(s):
	- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
		- [epochToScaleToSum[_asset][currentEpochCached][currentScaleCached] = newS](contracts/StabilityPool.sol#L587)
	- [(collGainPerUnitStaked,debtLossPerUnitStaked) = _computeRewardsPerUnitStaked(_asset,_amountAdded,_debtToOffset,cachedTotalDebtTokenDeposits)](contracts/StabilityPool.sol#L492-L495)
		- [lastAssetError_Offset[assetIndex] = collateralNumerator - (collGainPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L550-L551)
	- [(collGainPerUnitStaked,debtLossPerUnitStaked) = _computeRewardsPerUnitStaked(_asset,_amountAdded,_debtToOffset,cachedTotalDebtTokenDeposits)](contracts/StabilityPool.sol#L492-L495)
		- [lastDebtTokenLossError_Offset = 0](contracts/StabilityPool.sol#L538)
		- [lastDebtTokenLossError_Offset = (debtLossPerUnitStaked * _totalDeposits) - lossNumerator](contracts/StabilityPool.sol#L547)

contracts/StabilityPool.sol#L479-L500


 - [ ] ID-90
Reentrancy in [StabilityPool._sendToDepositor(address,uint256)](contracts/StabilityPool.sol#L920-L926):
	External calls:
	- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L924)
	State variables written after the call(s):
	- [_decreaseDebtTokens(debtTokenWithdrawal)](contracts/StabilityPool.sol#L925)
		- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L644)

contracts/StabilityPool.sol#L920-L926


 - [ ] ID-91
Reentrancy in [StabilityPool._sendToStabilityPool(address,uint256)](contracts/StabilityPool.sol#L876-L881):
	External calls:
	- [IDebtToken(debtToken).sendToPool(_address,address(this),_amount)](contracts/StabilityPool.sol#L877)
	State variables written after the call(s):
	- [totalDebtTokenDeposits = newTotalDeposits](contracts/StabilityPool.sol#L879)

contracts/StabilityPool.sol#L876-L881


 - [ ] ID-92
Reentrancy in [StabilityPool._sendGainsToDepositor(address,address[],uint256[])](contracts/StabilityPool.sol#L892-L917):
	External calls:
	- [IERC20(asset).safeTransfer(_to,amount)](contracts/StabilityPool.sol#L911)
	State variables written after the call(s):
	- [totalColl.amounts = _leftSubColls(totalColl,assets,amounts)](contracts/StabilityPool.sol#L916)

contracts/StabilityPool.sol#L892-L917


 - [ ] ID-93
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L412-L417):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	State variables written after the call(s):
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L415)
		- [epochToScaleToG[currentEpoch][currentScale] = newEpochToScaleToG](contracts/StabilityPool.sol#L436)
	- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L415)
		- [lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits)](contracts/StabilityPool.sol#L463)

contracts/StabilityPool.sol#L412-L417


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-94
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L379-L408):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L389)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L399)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L987)
	Event emitted after the call(s):
	- [TRENPaidToDepositor(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L988)
		- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L399)

contracts/StabilityPool.sol#L379-L408


 - [ ] ID-95
Reentrancy in [TrenBoxManager.closeTrenBoxLiquidation(address,address)](contracts/TrenBoxManager.sol#L610-L623):
	External calls:
	- [_closeTrenBox(_asset,_borrower,Status.closedByLiquidation)](contracts/TrenBoxManager.sol#L618)
		- [ISortedTrenBoxes(sortedTrenBoxes).remove(_asset,_borrower)](contracts/TrenBoxManager.sol#L798)
	- [IFeeCollector(feeCollector).liquidateDebt(_borrower,_asset)](contracts/TrenBoxManager.sol#L619)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,_borrower,0,0,0,TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManager.sol#L620-L622)

contracts/TrenBoxManager.sol#L610-L623


 - [ ] ID-96
Reentrancy in [AdminContract.addNewCollateral(address,uint256,uint256)](contracts/AdminContract.sol#L115-L147):
	External calls:
	- [IStabilityPool(stabilityPool).addCollateralType(_collateral)](contracts/AdminContract.sol#L143)
	Event emitted after the call(s):
	- [CollateralAdded(_collateral)](contracts/AdminContract.sol#L146)

contracts/AdminContract.sol#L115-L147


 - [ ] ID-97
Reentrancy in [TrenBoxManagerOperations._liquidateNormalMode(address,address,uint256)](contracts/TrenBoxManagerOperations.sol#L681-L727):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L697-L699)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L700)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L718)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode)](contracts/TrenBoxManagerOperations.sol#L719-L725)

contracts/TrenBoxManagerOperations.sol#L681-L727


 - [ ] ID-98
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L729-L852):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L784-L786)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L787)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L798)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L799-L805)

contracts/TrenBoxManagerOperations.sol#L729-L852


 - [ ] ID-99
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L729-L852):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L760-L762)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L763)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L770)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.entireTrenBoxColl,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L771-L777)

contracts/TrenBoxManagerOperations.sol#L729-L852


 - [ ] ID-100
Reentrancy in [TrenBoxManager.executePartialRedemption(address,address,uint256,uint256,uint256,address,address)](contracts/TrenBoxManager.sol#L378-L413):
	External calls:
	- [ISortedTrenBoxes(sortedTrenBoxes).reInsert(_asset,_borrower,_newNICR,_upperPartialRedemptionHint,_lowerPartialRedemptionHint)](contracts/TrenBoxManager.sol#L391-L393)
	- [IFeeCollector(feeCollector).decreaseDebt(_borrower,_asset,paybackFraction)](contracts/TrenBoxManager.sol#L398)
	Event emitted after the call(s):
	- [TotalStakesUpdated(_asset,newTotal)](contracts/TrenBoxManager.sol#L748)
		- [_updateStakeAndTotalStakes(_asset,_borrower)](contracts/TrenBoxManager.sol#L403)
	- [TrenBoxUpdated(_asset,_borrower,_newDebt,_newColl,trenBox.stake,TrenBoxManagerOperation.redeemCollateral)](contracts/TrenBoxManager.sol#L405-L412)

contracts/TrenBoxManager.sol#L378-L413


 - [ ] ID-101
Reentrancy in [StabilityPool._sendToDepositor(address,uint256)](contracts/StabilityPool.sol#L920-L926):
	External calls:
	- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L924)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L645)
		- [_decreaseDebtTokens(debtTokenWithdrawal)](contracts/StabilityPool.sol#L925)

contracts/StabilityPool.sol#L920-L926


 - [ ] ID-102
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L491)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L499)
		- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L636)
		- [IDebtToken(debtToken).burn(address(this),_debtToOffset)](contracts/StabilityPool.sol#L638)
		- [IActivePool(activePool).sendAsset(_asset,address(this),_amount)](contracts/StabilityPool.sol#L639)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L645)
		- [_moveOffsetCollAndDebt(_asset,_amountAdded,_debtToOffset)](contracts/StabilityPool.sol#L499)

contracts/StabilityPool.sol#L479-L500


 - [ ] ID-103
Reentrancy in [TrenBoxManagerOperations._liquidateRecoveryMode(address,address,uint256,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L729-L852):
	External calls:
	- [ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(_asset,vars.pendingDebtReward,vars.pendingCollReward)](contracts/TrenBoxManagerOperations.sol#L818-L820)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L823)
	- [ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset,_borrower)](contracts/TrenBoxManagerOperations.sol#L831)
	- [ICollSurplusPool(collSurplusPool).accountSurplus(_asset,_borrower,singleLiquidation.collSurplus)](contracts/TrenBoxManagerOperations.sol#L833-L835)
	Event emitted after the call(s):
	- [TrenBoxLiquidated(_asset,_borrower,singleLiquidation.entireTrenBoxDebt,singleLiquidation.collToSendToSP,ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode)](contracts/TrenBoxManagerOperations.sol#L837-L843)

contracts/TrenBoxManagerOperations.sol#L729-L852


 - [ ] ID-104
Reentrancy in [StabilityPool._moveOffsetCollAndDebt(address,uint256,uint256)](contracts/StabilityPool.sol#L629-L640):
	External calls:
	- [IActivePool(activePool).decreaseDebt(_asset,_debtToOffset)](contracts/StabilityPool.sol#L636)
	Event emitted after the call(s):
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L645)
		- [_decreaseDebtTokens(_debtToOffset)](contracts/StabilityPool.sol#L637)

contracts/StabilityPool.sol#L629-L640


 - [ ] ID-105
Reentrancy in [StabilityPool._withdrawFromSP(uint256,address[])](contracts/StabilityPool.sol#L379-L408):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L389)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	- [_payOutTRENGains(msg.sender)](contracts/StabilityPool.sol#L399)
		- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L987)
	- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L400)
		- [IDebtToken(debtToken).returnFromPool(address(this),_depositor,debtTokenWithdrawal)](contracts/StabilityPool.sol#L924)
	Event emitted after the call(s):
	- [DepositSnapshotUpdated(_depositor,0,0)](contracts/StabilityPool.sol#L955)
		- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L404)
	- [DepositSnapshotUpdated(_depositor,currentP,currentG)](contracts/StabilityPool.sol#L977)
		- [_updateDepositAndSnapshots(msg.sender,newDeposit)](contracts/StabilityPool.sol#L404)
	- [GainsWithdrawn(msg.sender,assets,amounts,loss)](contracts/StabilityPool.sol#L407)
	- [StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits)](contracts/StabilityPool.sol#L645)
		- [_sendToDepositor(msg.sender,debtTokensToWithdraw)](contracts/StabilityPool.sol#L400)
	- [UserDepositChanged(msg.sender,newDeposit)](contracts/StabilityPool.sol#L405)

contracts/StabilityPool.sol#L379-L408


 - [ ] ID-106
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


 - [ ] ID-107
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


 - [ ] ID-108
Reentrancy in [FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L373-L378):
	External calls:
	- [IERC20(debtToken).safeTransfer(_borrower,_refundAmount)](contracts/FeeCollector.sol#L375)
	Event emitted after the call(s):
	- [FeeRefunded(_borrower,_asset,_refundAmount)](contracts/FeeCollector.sol#L376)

contracts/FeeCollector.sol#L373-L378


 - [ ] ID-109
Reentrancy in [StabilityPool.offset(uint256,address,uint256)](contracts/StabilityPool.sol#L479-L500):
	External calls:
	- [_triggerTRENIssuance()](contracts/StabilityPool.sol#L491)
		- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	Event emitted after the call(s):
	- [EpochUpdated(currentEpochCached)](contracts/StabilityPool.sol#L594)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
	- [P_Updated(newP)](contracts/StabilityPool.sol#L617)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
	- [S_Updated(_asset,newS,currentEpochCached,currentScaleCached)](contracts/StabilityPool.sol#L588)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
	- [ScaleUpdated(0)](contracts/StabilityPool.sol#L596)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)
	- [ScaleUpdated(currentScaleCached)](contracts/StabilityPool.sol#L609)
		- [_updateRewardSumAndProduct(_asset,collGainPerUnitStaked,debtLossPerUnitStaked)](contracts/StabilityPool.sol#L497)

contracts/StabilityPool.sol#L479-L500


 - [ ] ID-110
Reentrancy in [BorrowerOperations.closeTrenBox(address)](contracts/BorrowerOperations.sol#L387-L423):
	External calls:
	- [ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset,msg.sender)](contracts/BorrowerOperations.sol#L392)
	- [refund = IFeeCollector(feeCollector).simulateRefund(msg.sender,_asset,1000000000000000000)](contracts/BorrowerOperations.sol#L398)
	- [ITrenBoxManager(trenBoxManager).removeStake(_asset,msg.sender)](contracts/BorrowerOperations.sol#L406)
	- [ITrenBoxManager(trenBoxManager).closeTrenBox(_asset,msg.sender)](contracts/BorrowerOperations.sol#L407)
	Event emitted after the call(s):
	- [TrenBoxUpdated(_asset,msg.sender,0,0,0,BorrowerOperation.closeTrenBox)](contracts/BorrowerOperations.sol#L409)

contracts/BorrowerOperations.sol#L387-L423


 - [ ] ID-111
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


 - [ ] ID-112
Reentrancy in [StabilityPool._triggerTRENIssuance()](contracts/StabilityPool.sol#L412-L417):
	External calls:
	- [TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN()](contracts/StabilityPool.sol#L414)
	Event emitted after the call(s):
	- [G_Updated(newEpochToScaleToG,currentEpoch,currentScale)](contracts/StabilityPool.sol#L437)
		- [_updateG(TRENIssuance)](contracts/StabilityPool.sol#L415)

contracts/StabilityPool.sol#L412-L417


 - [ ] ID-113
Reentrancy in [FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L362-L371):
	External calls:
	- [IERC20(debtToken).safeTransfer(collector,_feeAmount)](contracts/FeeCollector.sol#L365)
	- [ITRENStaking(trenStaking).increaseFee_DebtToken(_feeAmount)](contracts/FeeCollector.sol#L367)
	Event emitted after the call(s):
	- [FeeCollected(_borrower,_asset,collector,_feeAmount)](contracts/FeeCollector.sol#L369)

contracts/FeeCollector.sol#L362-L371


 - [ ] ID-114
Reentrancy in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L154-L196):
	External calls:
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L188)
	Event emitted after the call(s):
	- [ExecuteTransaction(txHash,target,value,signature,data,eta)](contracts/Timelock.sol#L193)

contracts/Timelock.sol#L154-L196


 - [ ] ID-115
Reentrancy in [StabilityPool._payOutTRENGains(address)](contracts/StabilityPool.sol#L984-L990):
	External calls:
	- [ICommunityIssuance(communityIssuance).sendTREN(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L987)
	Event emitted after the call(s):
	- [TRENPaidToDepositor(_depositor,depositorTRENGain)](contracts/StabilityPool.sol#L988)

contracts/StabilityPool.sol#L984-L990


 - [ ] ID-116
Reentrancy in [DefaultPool.sendAssetToActivePool(address,uint256)](contracts/DefaultPool.sol#L81-L102):
	External calls:
	- [IERC20(_asset).safeTransfer(activePool,safetyTransferAmount)](contracts/DefaultPool.sol#L97)
	- [IDeposit(activePool).receivedERC20(_asset,_amount)](contracts/DefaultPool.sol#L98)
	Event emitted after the call(s):
	- [AssetSent(activePool,_asset,safetyTransferAmount)](contracts/DefaultPool.sol#L101)
	- [DefaultPoolAssetBalanceUpdated(_asset,newBalance)](contracts/DefaultPool.sol#L100)

contracts/DefaultPool.sol#L81-L102


 - [ ] ID-117
Reentrancy in [FeeCollector.handleRedemptionFee(address,uint256)](contracts/FeeCollector.sol#L196-L201):
	External calls:
	- [ITRENStaking(trenStaking).increaseFee_Asset(_asset,_amount)](contracts/FeeCollector.sol#L198)
	Event emitted after the call(s):
	- [RedemptionFeeCollected(_asset,_amount)](contracts/FeeCollector.sol#L200)

contracts/FeeCollector.sol#L196-L201


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-118
[TrenBoxManager._updateLastFeeOpTime(address)](contracts/TrenBoxManager.sol#L856-L864) uses timestamp for comparisons
	Dangerous comparisons:
	- [timePassed >= SECONDS_IN_ONE_MINUTE](contracts/TrenBoxManager.sol#L858)

contracts/TrenBoxManager.sol#L856-L864


 - [ ] ID-119
[FeeCollector._updateFeeRecord(address,address,uint256,IFeeCollector.FeeRecord)](contracts/FeeCollector.sol#L281-L305) uses timestamp for comparisons
	Dangerous comparisons:
	- [NOW < _sRecord.from](contracts/FeeCollector.sol#L291)

contracts/FeeCollector.sol#L281-L305


 - [ ] ID-120
[LockedTREN.isEntityExits(address)](contracts/TREN/LockedTREN.sol#L133-L135) uses timestamp for comparisons
	Dangerous comparisons:
	- [entitiesVesting[_entity].createdDate != 0](contracts/TREN/LockedTREN.sol#L134)

contracts/TREN/LockedTREN.sol#L133-L135


 - [ ] ID-121
[LockedTREN.addEntityVesting(address,uint256)](contracts/TREN/LockedTREN.sol#L43-L59) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(entitiesVesting[_entity].createdDate == 0,Entity already has a Vesting Rule)](contracts/TREN/LockedTREN.sol#L46)

contracts/TREN/LockedTREN.sol#L43-L59


 - [ ] ID-122
[LockedTREN.sendTRENTokenToEntity(address)](contracts/TREN/LockedTREN.sol#L93-L102) uses timestamp for comparisons
	Dangerous comparisons:
	- [unclaimedAmount == 0](contracts/TREN/LockedTREN.sol#L95)

contracts/TREN/LockedTREN.sol#L93-L102


 - [ ] ID-123
[CommunityIssuance._getLastUpdateTokenDistribution()](contracts/TREN/CommunityIssuance.sol#L133-L139) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(lastUpdateTime != 0,Stability pool hasn't been assigned)](contracts/TREN/CommunityIssuance.sol#L134)

contracts/TREN/CommunityIssuance.sol#L133-L139


 - [ ] ID-124
[Timelock.queueTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L110-L133) uses timestamp for comparisons
	Dangerous comparisons:
	- [eta < block.timestamp + delay || eta > block.timestamp + delay + GRACE_PERIOD](contracts/Timelock.sol#L121)

contracts/Timelock.sol#L110-L133


 - [ ] ID-125
[FeeCollector._createOrUpdateFeeRecord(address,address,uint256)](contracts/FeeCollector.sol#L244-L263) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= block.timestamp](contracts/FeeCollector.sol#L256)

contracts/FeeCollector.sol#L244-L263


 - [ ] ID-126
[CommunityIssuance.issueTREN()](contracts/TREN/CommunityIssuance.sol#L113-L131) uses timestamp for comparisons
	Dangerous comparisons:
	- [totalTRENIssued >= maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L116)
	- [totalIssuance > maxPoolSupply](contracts/TREN/CommunityIssuance.sol#L121)

contracts/TREN/CommunityIssuance.sol#L113-L131


 - [ ] ID-127
[TrenBoxManagerOperations._validateRedemptionRequirements(address,uint256,uint256,uint256)](contracts/TrenBoxManagerOperations.sol#L1028-L1060) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionBlockTimestamp > block.timestamp](contracts/TrenBoxManagerOperations.sol#L1039)

contracts/TrenBoxManagerOperations.sol#L1028-L1060


 - [ ] ID-128
[CommunityIssuance.removeFundFromStabilityPool(uint256)](contracts/TREN/CommunityIssuance.sol#L81-L91) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(totalTRENIssued <= newCap,CommunityIssuance: Stability Pool doesn't have enough supply.)](contracts/TREN/CommunityIssuance.sol#L83-L86)

contracts/TREN/CommunityIssuance.sol#L81-L91


 - [ ] ID-129
[PriceFeedL2._checkSequencerUptimeFeed()](contracts/Pricing/PriceFeedL2.sol#L74-L106) uses timestamp for comparisons
	Dangerous comparisons:
	- [timeSinceSequencerUp <= delay](contracts/Pricing/PriceFeedL2.sol#L102)

contracts/Pricing/PriceFeedL2.sol#L74-L106


 - [ ] ID-130
[FeeCollector._refundFee(address,address,uint256)](contracts/FeeCollector.sol#L373-L378) uses timestamp for comparisons
	Dangerous comparisons:
	- [_refundAmount != 0](contracts/FeeCollector.sol#L374)

contracts/FeeCollector.sol#L373-L378


 - [ ] ID-131
[TrenBoxManager.updateBaseRateFromRedemption(address,uint256,uint256,uint256)](contracts/TrenBoxManager.sol#L441-L461) uses timestamp for comparisons
	Dangerous comparisons:
	- [assert(bool)(newBaseRate != 0)](contracts/TrenBoxManager.sol#L456)

contracts/TrenBoxManager.sol#L441-L461


 - [ ] ID-132
[LockedTREN.getClaimableTREN(address)](contracts/TREN/LockedTREN.sol#L112-L127) uses timestamp for comparisons
	Dangerous comparisons:
	- [entityRule.startVestingDate > block.timestamp](contracts/TREN/LockedTREN.sol#L116)
	- [block.timestamp >= entityRule.endVestingDate](contracts/TREN/LockedTREN.sol#L118)

contracts/TREN/LockedTREN.sol#L112-L127


 - [ ] ID-133
[Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L154-L196) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp < eta](contracts/Timelock.sol#L170)
	- [block.timestamp > eta + GRACE_PERIOD](contracts/Timelock.sol#L173)

contracts/Timelock.sol#L154-L196


 - [ ] ID-134
[FeeCollector._collectFee(address,address,uint256)](contracts/FeeCollector.sol#L362-L371) uses timestamp for comparisons
	Dangerous comparisons:
	- [_feeAmount != 0](contracts/FeeCollector.sol#L363)

contracts/FeeCollector.sol#L362-L371


 - [ ] ID-135
[FeeCollector._calcExpiredAmount(uint256,uint256,uint256)](contracts/FeeCollector.sol#L319-L341) uses timestamp for comparisons
	Dangerous comparisons:
	- [_from > NOW](contracts/FeeCollector.sol#L329)
	- [NOW >= _to](contracts/FeeCollector.sol#L332)

contracts/FeeCollector.sol#L319-L341


 - [ ] ID-136
[FeeCollector._decreaseDebt(address,address,uint256)](contracts/FeeCollector.sol#L210-L242) uses timestamp for comparisons
	Dangerous comparisons:
	- [sRecord.to <= NOW](contracts/FeeCollector.sol#L218)

contracts/FeeCollector.sol#L210-L242


 - [ ] ID-137
[FeeCollector.collectFees(address[],address[])](contracts/FeeCollector.sol#L161-L189) uses timestamp for comparisons
	Dangerous comparisons:
	- [expiredAmount > 0](contracts/FeeCollector.sol#L178)

contracts/FeeCollector.sol#L161-L189


 - [ ] ID-138
[FeeCollector.simulateRefund(address,address,uint256)](contracts/FeeCollector.sol#L113-L137) uses timestamp for comparisons
	Dangerous comparisons:
	- [record.amount == 0 || record.to < block.timestamp](contracts/FeeCollector.sol#L126)

contracts/FeeCollector.sol#L113-L137


 - [ ] ID-139
[PriceFeed._fetchOracleScaledPrice(IPriceFeed.OracleRecordV2)](contracts/PriceFeed.sol#L137-L156) uses timestamp for comparisons
	Dangerous comparisons:
	- [oraclePrice != 0 && ! _isStalePrice(priceTimestamp,oracle.timeoutSeconds)](contracts/PriceFeed.sol#L152)

contracts/PriceFeed.sol#L137-L156


 - [ ] ID-140
[PriceFeed._isStalePrice(uint256,uint256)](contracts/PriceFeed.sol#L158-L167) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp - _priceTimestamp > _oracleTimeoutSeconds](contracts/PriceFeed.sol#L166)

contracts/PriceFeed.sol#L158-L167


 - [ ] ID-141
[TrenBoxManager._calcRedemptionFee(uint256,uint256)](contracts/TrenBoxManager.sol#L841-L854) uses timestamp for comparisons
	Dangerous comparisons:
	- [redemptionFee >= _assetDraw](contracts/TrenBoxManager.sol#L850)

contracts/TrenBoxManager.sol#L841-L854


 - [ ] ID-142
[CommunityIssuance._addFundToStabilityPoolFrom(uint256,address)](contracts/TREN/CommunityIssuance.sol#L104-L111) uses timestamp for comparisons
	Dangerous comparisons:
	- [lastUpdateTime == 0](contracts/TREN/CommunityIssuance.sol#L105)

contracts/TREN/CommunityIssuance.sol#L104-L111


 - [ ] ID-143
[LockedTREN.transferUnassignedTREN()](contracts/TREN/LockedTREN.sol#L104-L110) uses timestamp for comparisons
	Dangerous comparisons:
	- [unassignedTokens == 0](contracts/TREN/LockedTREN.sol#L107)

contracts/TREN/LockedTREN.sol#L104-L110


## dead-code
Impact: Informational
Confidence: Medium
 - [ ] ID-144
[TrenMath._max(uint256,uint256)](contracts/Dependencies/TrenMath.sol#L28-L30) is never used and should be removed

contracts/Dependencies/TrenMath.sol#L28-L30


 - [ ] ID-145
[BorrowerOperations._getUSDValue(uint256,uint256)](contracts/BorrowerOperations.sol#L448-L450) is never used and should be removed

contracts/BorrowerOperations.sol#L448-L450


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-146
Low level call in [Timelock.executeTransaction(address,uint256,string,bytes,uint256)](contracts/Timelock.sol#L154-L196):
	- [(success,returnData) = target.call{value: value}(callData)](contracts/Timelock.sol#L188)

contracts/Timelock.sol#L154-L196


## similar-names
Impact: Informational
Confidence: Medium
 - [ ] ID-147
Variable [AdminContract.setPercentDivisor(address,uint256).percentDivisor](contracts/AdminContract.sol#L247) is too similar to [IAdminContract.setPercentDivisor(address,uint256).precentDivisor](contracts/Interfaces/IAdminContract.sol#L82)

contracts/AdminContract.sol#L247


 - [ ] ID-148
Variable [IAdminContract.setCollateralParameters(address,uint256,uint256,uint256,uint256,uint256,uint256,uint256).percentDivisor](contracts/Interfaces/IAdminContract.sol#L71) is too similar to [IAdminContract.setPercentDivisor(address,uint256).precentDivisor](contracts/Interfaces/IAdminContract.sol#L82)

contracts/Interfaces/IAdminContract.sol#L71


 - [ ] ID-149
Variable [PriceFeed.MAX_PRICE_DEVIATION_BETWEEN_ROUNDS_LOWER_LIMIT](contracts/PriceFeed.sol#L31) is too similar to [PriceFeed.MAX_PRICE_DEVIATION_BETWEEN_ROUNDS_UPPER_LIMIT](contracts/PriceFeed.sol#L32)

contracts/PriceFeed.sol#L31


 - [ ] ID-150
Variable [AdminContract.CCR_DEFAULT](contracts/AdminContract.sol#L27) is too similar to [AdminContract.MCR_DEFAULT](contracts/AdminContract.sol#L28)

contracts/AdminContract.sol#L27


 - [ ] ID-151
Variable [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound1](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L70) is too similar to [SfrxEth2EthPriceAggregator.latestRoundData().answeredInRound2](contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L79)

contracts/Pricing/SfrxEth2EthPriceAggregator.sol#L70


 - [ ] ID-152
Variable [AdminContract.setCollateralParameters(address,uint256,uint256,uint256,uint256,uint256,uint256,uint256).percentDivisor](contracts/AdminContract.sol#L156) is too similar to [IAdminContract.setPercentDivisor(address,uint256).precentDivisor](contracts/Interfaces/IAdminContract.sol#L82)

contracts/AdminContract.sol#L156


## constable-states
Impact: Optimization
Confidence: High
 - [ ] ID-153
[TrenBoxManager.isSetupInitialized](contracts/TrenBoxManager.sol#L101) should be constant 

contracts/TrenBoxManager.sol#L101


 - [ ] ID-154
[TRENToken._1_MILLION](contracts/TREN/TRENToken.sol#L12) should be constant 

contracts/TREN/TRENToken.sol#L12


