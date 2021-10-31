---
title: "Opt-in IDFA on iOS 14.5"
description: "With the release of iOS 14.5 Apple has now made the ID for Advertisers (IDFA) conditional on an opt-in pop up. This ID is used to attribute advertisements to individual users which is critical for marketing."
date: "2021-11-01T16:20:00.00Z"
category: "Explanation"
---

After announcing that the Identifier for Advertisers (IDFA) would become opt-in with the release of iOS 14 in (announced in June, 2020) the launch was pushed back. Supposedly to give advertisers more time to prepare for the change. Finally the update was released with udpate 14.5 earlier this year. 

## Attribution 101

The IDFA is used by advertisers for a process called attribution. Attribution is connecting an acquired user with the ad that brought them into the app. This is done by using cookies in the user's browser to record which ads they've clicked on, and what apps they have installed. Attribution is necessary for the advertiser to calculate key performance indicators (KPIs). 

An example of a KPI is return on investment (ROI) calculated by dividing the amount of revenue from acquired users divided by the cost to acquire those users. An ad campaign reaches the break-even point if its ROI is 100%.

The IDFA plays a critical role in how attribution is done on mobile with iOS. Without having IDFA enabled the accuracy and reliability of attribution for iPhone users will decrease siginificantly. Prior to the update around 80% of iOS users had IDFA enabled for their apps. After it is likely to drop to around 20-40%.

Without attribution it will be difficult to calculate the ROI for a given user. Advertisers will essentially be flying blind unable to objectively evaluate the performance of an ad campaign using data. This will make it more difficult to pay a fair price on an ad since the advertiser will not know how much money that ad will generate.

Users on iPhone are a particularly important segment because on average they have more discretionary income compared to Android users. Most iPhone models are expensive, targeting the "flagship" tier of phone. While Android has a solid lineup of phones under $200 that monopolize the low to mid tier of phones. 

## Impact on MMPs

The stakeholder most impacted by this change will be the Mobile Measurement Partners (MMPs). They sell attribution as a service to advertisers. The utility of their service depends on having reliable accuracy. The IDFA is used for "user level attribution" which is by far the most helpful form of attribution. User level means that we can see which individual users were part of a specific campaign. We can then evaluate the value of each user, and when aggregating users in a campaign we can do so intelligently factoring in variability between users. 

Part of the IDFA opt-in update was a push to MMPs to move away from user level attribution and towards SKAdNetwork. A service provided by Apple that provides aggregate-level info on an ad campaign, lacking information about individual users. This can be used to evaluate the ROI of a campaign but is not helpful for evaluating the quality of a user. Companies tend to have several KPIs measuring engagement for users beyond how much money they spend.

The other work around has been to use a method called fingerprinting. Fingerprinting relies on other device metadata like IP address or user agent to probabilistically match a user. The main problem is that this method is less accurate, the lack of IDFA will make matching on the advertisers backend more difficult as well. 

Apple has said fingerprinting is not allowed under their new policy. But they have not started enforcing this policy strictly and several MMPs continue to use fingerprinting and other user level attribution methods. Some MMPs have gone ahead and started following Apple's new policy, while other's are not, giving them a competitive advantage. (I am being intentionaly vague about which MMPs I am talking about.) The major question is when and how Apple will choose to enforce these new policies and what penalties, if any, will come. 

## Conclusion 

The MMPs are massive companies and Apple's stance is likely to shake up the very lucrative marketing industry. Google may not be far behind in making the Google Advertising ID opt-in as well. While the policies have already changed, there has not been much change in enforcement. 

One immediate change has been the number of users who have IDFA enabled, which changed as soon as the update went out. This proves that when people are given a choice they will choose privacy. I applaud Apple's decision to give user's the choice to protect their data. The marketing industry will need to learn to adapt to this new changing ecosystem. 
