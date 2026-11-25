# Prototype and Android page inventory

## Current totals

| Evidence | 3.2.0 HTML | 3.3.0 HTML | Android |
| --- | ---: | ---: | ---: |
| App 3.0 registered renderer keys | 152 | 165 | |
| Wallet 2.0 registered renderer keys | 127 | 127 | |
| Total registered renderer keys | 279 | 292 | |
| Distinct product screens verified in emulator | | | 33 |
| Distinct typed Compose destination expressions found in main source | | | 126 |
| Final distinct product screen total | Pending | Pending | Pending |

Use the root entry as the primary HTML scope. Track 3.3.0 separately because it changes the Locals and Inbox entry points and adds Trips. Count distinct full-screen destinations, including tabs with their own navigation destination. Record overlays, filters, and repeated record instances under their parent. Cross-renderer copies and shared step renderers require review before the registered key total can be translated to product screens. The embedded form entries Elite application, Merchant application, and Add another merchant are outside the renderer key count. Their entry paths and unique screens still need verification.

Browser evidence came from headless Chrome on Windows through a local HTTP server. A temporary response hook read the initialized view registries in both iframe renderers without changing repository code. It established registration. Each screen still needs navigation verification. Prototype checkout base is 4fb58f5 with local edits present.

Android evidence came from ADB UI hierarchy inspection and emulator taps on emulator-5554, Android 17 / API 37, 1080 × 2424 px at density 420. Package com.youapp.you_app.uat reports version 3.1.0, code 280, and the login sheet reports 3.1.0-staging. Kotlin checkout is d3c5016e. The source count covers unique generic composable destination spellings in app and feature main source. In-route steps and tabs can share a Compose destination, and some source routes may be absent or gated in this APK.

## Initial screen mapping

| Flow | HTML candidate | Android observation | Evidence |
| --- | --- | --- | --- |
| Welcome | App 3.0 welcome | Welcome with Start Exploring | Emulator started here. |
| Guest Discover | App 3.0 discover | Discover with Locals, Activities, Merchant and Feed controls | Tapped Start Exploring. The Locals browse view appeared. |
| Guest sign-in prompt | App 3.0 guest login overlay | Welcome to YouApp sheet | Tapped profile avatar in guest Discover. Overlay recorded under Discover. |
| Email login | App 3.0 login overlay and Wallet 2.0 signup candidate | Get Started Now sheet | Tapped Sign In from the guest prompt. The email field, Login and Google options appeared. Overlay recorded under Discover. |

## Android new-account walkthrough

The approved new staging account completed email OTP verification with the supplied staging code. The native OTP UI is a dialog and is recorded as a state under the email login flow. Android and HTML candidates below are aligned by task. Their visual parity is pending.

| Android screen | HTML candidate | Emulator path |
| --- | --- | --- |
| Display name | Wallet 2.0 obName or App 3.0 name | Submit OTP. Enter YouApp HTML Test and tap Continue. |
| Date of birth | Wallet 2.0 obDob or App 3.0 dob | Continue from Display name. Tap Skip. |
| Gender | Wallet 2.0 obGender or App 3.0 gender | Skip date of birth. Tap Skip. |
| Referrer | Wallet 2.0 obRef | Skip gender. Skip referrer to enter signed-in Discover. |
| Locals messages | App 3.0 chats | Tap bottom Locals. Conversation list layout was visible with the verification gate. |
| Scan to Pay entry | Wallet 2.0 scan | Tap bottom Scan. Observed the unverified payment state. |
| YouPage | Wallet 2.0 home and business | Tap the profile avatar. Observed You and Business tabs under this destination. |
| Settings | Wallet 2.0 settings | Tap the gear in YouPage. |
| Verify to continue | App 3.0 gate | YouPage ? Activate Wallet. A related gate appeared on Locals. |
| Mobile Number | App 3.0 phone or pfPhone | Tap Verify me from the wallet gate. |
| Phone country picker | App 3.0 pfCountry | Tap the dialing code on Mobile Number. |

The 13 observed full-screen destinations include Welcome and Discover from the initial run. Signed-in Discover and Feed were inspected as states within the home destination. The You and Business tabs were inspected within YouPage. The Locals entry was gated, so chatroom access remains unverified. Wallet activation stopped before entering a phone number or submitting identity details. The wallet email code prompt has yet to be reached.

## Android existing verified-account walkthrough

Confirmed logout in Settings, returned to Welcome, then signed in with the approved existing staging account. Email OTP succeeded and opened Discover directly. YouPage showed Identity verified, an existing transaction, and the Reconnect Wallet state.

| Android screen | HTML candidate | Emulator path and outcome |
| --- | --- | --- |
| Reconnect Wallet | App 3.0 activate or Wallet 2.0 YouPage reconnect state | Discover ? profile avatar ? YouPage ? Reconnect Wallet. The screen asked to verify email. Tapping Reconnect Wallet showed ?Wallet connection isn't available in this build yet.? The flow remained on the same screen. |

Reconnect Wallet adds one screen to the emulator count. The logout confirmation is an overlay under Settings. The user session remained signed in.

## Android wallet and Discover follow-up

After leaving Reconnect Wallet, YouPage displayed an active balance and wallet actions. The earlier reconnect message still applies to that attempt. The following destinations were opened through the existing verified account in the same installed build.

| Android screen | HTML candidate | Verified entry path |
| --- | --- | --- |
| Transaction History | Wallet 2.0 scanHistory or App 3.0 whist | YouPage ? History. |
| Receipt | Wallet 2.0 scanArchiveReceipt or App 3.0 wrcpt | Transaction History ? completed incoming MYRT record. |
| Bank Account List | App 3.0 hbanks, candidate pending scope check | Transaction History ? Bank Account icon. |
| My money | Wallet 2.0 wallets | YouPage ? See All. |
| Currency details | Wallet 2.0 walletCurrency | My money ? US dollar. |
| Connect Wallet | Wallet 2.0 walletConnect | My money ? Connect. Provider choices were displayed. |
| Top Up | Wallet 2.0 walletTopUp | YouPage ? Top Up. The Pay With sheet was also opened. |
| Search Service Hosts | App 3.0 search | Discover ? Search locals. |
| Rewards | Wallet 2.0 rewards | YouPage ? Rewards. |

Scan and Pay opened the live scanner. It is counted under the existing Scan to Pay destination, alongside the earlier unverified state. No QR was submitted. On this pass, tapping bottom Locals from signed-in Discover left Discover visible. Chatroom access remains unverified. No wallet provider was opened and no payment or top-up was submitted.

## Android control checks

These checks ran on the installed 3.1.0 staging build with the existing verified account. Invite friends and Choose your plan add two full-screen destinations. The share chooser and membership tier tabs are recorded under their parent screens.

| Screen | Control exercised | Observed result |
| --- | --- | --- |
| Rewards | Referrals | Empty history message appeared. |
| Rewards | Cashback | Cashback availability message appeared. |
| Rewards | Other | Empty history message appeared. |
| Rewards | All | Existing reward history returned. |
| Rewards | Back | Returned to YouPage. |
| YouPage | Referral QR | Opened Invite friends. HTML candidate is Wallet 2.0 invite. |
| Invite friends | Copy referral code | Tapped. Clipboard contents remain unverified. |
| Invite friends | Share link | Opened Android share chooser. Back returned to Invite friends. |
| Invite friends | See plans | Opened Choose your plan. HTML candidate is Wallet 2.0 subscribe. |
| Choose your plan | VIP and SVIP | Both plan cards rendered with their respective terms. |

Pending on these screens are the remaining share and referral controls, the billing-period selection, and membership checkout. Other route groups still need a full control inventory. Record device gates, disabled controls, and actions awaiting a dedicated test scenario separately from exercised controls.

## Android Discover and main menu follow-up

| Entry or control | Observed result | HTML candidate |
| --- | --- | --- |
| Discover ? Activities | The browse tab reported no experiences available in this country. | App 3.0 discover, Activities state |
| Activities ? Search activities | Opened Search Experience Hosts. Counted under the existing host search destination with different copy. | App 3.0 search |
| Activities ? Experiences | Opened Experiences. Applied showed the Pending empty state and a record under Fully Booked. My Event showed upcoming events. | App 3.0 actmine |
| My Event ? View Details | Opened an owned experience detail with Edit Experience. | App 3.0 actd or exp |
| My Event ? Applicant List on an event with zero applicants | Tapped and remained on My Event. Recheck with an event that has applicants. | App 3.0 actappl |
| Discover ? Merchant ? first listing | Opened merchant details. About appeared initially. Check-in showed existing visitors and Summary showed demographic information. | App 3.0 mer, candidate pending view-level mapping |
| Discover ? main menu ? Manage Activities | Opened Your Experiences with Listed status and existing records. | App 3.0 hexps or actmine, pending task-level mapping |
| Discover ? main menu ? Host Settings | An Important Notice appeared. Close returned to Discover. Agreement and downstream settings remain unverified. | App 3.0 hset or Wallet 2.0 hostSet |
| Discover ? main menu ? Create Activity | Opened the create sheet with Create Service and Create Experience. | App 3.0 cexp and hsvcform entry candidates |

Four new full-screen destinations were observed. Merchant detail tabs and the main menu, host notice, and create sheet are recorded as states. Merchant Pay, actual Check in, and publishing or editing an experience remain unverified.

## Android service booking

| Android entry or control | Observed result | HTML candidate |
| --- | --- | --- |
| Discover → Locals → Featured Hosts | Opened Meet with Erica, with bookable services and hourly prices. | App 3.0 svc |
| Host detail → Reserve | Opened Schedule with one guest. The initial date had no availability, with RM0 and Reserve disabled. | App 3.0 schedule |
| Schedule → Go to next available date | Available services and time slots appeared. | App 3.0 schedule availability state |
| Select the second service at 12:00 PM | The two-hour selection showed RM300 at RM150/hour. | App 3.0 schedule price state |
| Increase guests from one to two | Guest count changed to two. The total stayed at RM300. | App 3.0 schedule guest state |
| Increase duration from two to three hours | The total increased to RM450. | App 3.0 schedule duration state |

### Booking request and chat

Submitted the existing staging selection for Erica on 28 November 2026, 12:00?15:00, with two guests and RM450 displayed on Schedule. Android opened Erica's existing chat with a new system message and a Service card marked Requested. No payment screen appeared during submission. The HTML renderer contains a separate booking payment view.

| Android entry or control | Observed result |
| --- | --- |
| Schedule Reserve | Created a request and opened Erica's chat. |
| Service card expand/collapse | Collapsed and reopened the booking card. |
| Service card progress control | Opened Progress Detail. It showed Waiting for Confirmation and stated that the host must confirm. |
| Chat Add | Opened Gallery, Camera, Document, Location, and GIF choices. Individual actions were not exercised. |
| Service card Modify | Opened Re-schedule meeting. The form initially showed two hours, one guest, and 0 MYR with no start time selected. No modification was submitted. |

Erica's chat and Re-schedule meeting add two full-screen destinations beyond Host detail and Schedule. The HTML chat candidate is App 3.0 bchat. The reschedule pairing remains open. The emulator is on Re-schedule meeting. Acceptance, payment, and later booking states remain pending host confirmation or a staged fixture for those states.

## Registered HTML keys


### App 3.0 in 3.2.0

`actappl`, `actd`, `actedit`, `activate`, `actmine`, `ann`, `annd`, `apconf`, `apdet`, `apdone`, `apform`, `aplist`, `aprecv`, `apsending`, `askq`, `bchat`, `bdone7`, `bill`, `billin`, `billpay`, `cam7`, `cardd`, `cards`, `cexp`, `chat`, `chats`, `compose`, `coupons`, `cpin7`, `cpinok7`, `cprev7`, `delotp`, `delreason`, `didit`, `discover`, `dob`, `exp`, `expres`, `floc7`, `force`, `forgot`, `freeze`, `gate`, `gateway`, `gender`, `gform`, `gimedia`, `ginfo`, `ginvite`, `gperm`, `gpic`, `gpick`, `guestlock`, `happl`, `hbankf`, `hbanks`, `hcat`, `hcity`, `hcsel`, `hearn`, `hexp`, `hexps`, `hmap`, `hostres`, `hosttab`, `hreview`, `hsched`, `hset`, `hsplans`, `hstep`, `hsvcform`, `hwd`, `hwdd`, `hxedit`, `hxplans`, `kycPhotos`, `kycRejected`, `language`, `limits`, `login7`, `maint`, `media`, `mediav`, `medit`, `mer`, `merArea`, `merBoard`, `merDone`, `merPeople`, `merPhotos`, `merRev`, `merReviews`, `merWho`, `myfeed`, `myqr`, `name`, `newpin`, `otp`, `paid`, `pay`, `pfCountry`, `pfPhone`, `pfPhoneOtp`, `phone`, `pinLocked`, `pinset`, `plans`, `post`, `profedit`, `profile`, `reviews`, `rform`, `sblock`, `scan`, `schedule`, `sconn`, `search`, `secq`, `settings`, `sexport`, `slang`, `sloc`, `spay`, `sperm`, `spin7`, `splash`, `spreview`, `srefer`, `stub`, `sub`, `svc`, `swap`, `swapc`, `tcard`, `tier`, `tierdone`, `topup`, `tureview`, `tusend`, `txn`, `verifyhost`, `verifying`, `walletActive`, `wdone`, `welcome`, `whist`, `wproc`, `wrcpt`, `wresult`, `wset`, `xfer`, `youpage`


### Additional App 3.0 keys in 3.3.0

`tpEdit`, `tpFriend`, `tpJoin`, `tpPeople`, `tpPlace`, `tpPlan`, `tpPlanChat`, `tpPlanNew`, `tpStay`, `tpStop`, `trip`, `tripAdd`, `trips`


### Wallet 2.0 in both versions

`addMerchant`, `availability`, `billConfirm`, `billDone`, `billInput`, `billReceipt`, `bills`, `bizDash`, `bizQr`, `bookingDetail`, `business`, `cbSettings`, `checkout`, `ckResult`, `confirm`, `createExp`, `cxDone`, `discover`, `done`, `editProfile`, `elApply`, `elApplyDone`, `ewAutoFail`, `ewConfirm`, `ewCountry`, `ewDetail`, `ewDone`, `ewFail`, `ewOpening`, `ewOtp`, `ewPhone`, `ewRecv`, `expPlan`, `guestLogin`, `guestScan`, `home`, `hostSet`, `insights`, `invite`, `kyc`, `kycActive`, `kycConfirmed`, `kycIntro`, `kycOtp`, `kycPhone`, `kycPhotos`, `kycVerifying`, `limits`, `listingDetail`, `mcApply`, `mcApplyDone`, `merchConfirm`, `merchDetail`, `merchInsight`, `mreload`, `mwCancelled`, `mwWait`, `myMerch`, `myQr`, `obDob`, `obGender`, `obName`, `obRef`, `otp`, `pin`, `pinConf`, `pinCur`, `pinNew`, `pinOk`, `pinOtp`, `processing`, `profile`, `refCode`, `refNet`, `regMerchants`, `rewardDetail`, `rewardNotif`, `rewards`, `rfChat`, `scan`, `scanArchiveReceipt`, `scanHistory`, `scanReceipt`, `servicePlans`, `settings`, `shApply`, `shTab`, `signup`, `splash`, `subscribe`, `superhost`, `svip`, `tier`, `topUp`, `tuExt`, `tuExtDone`, `tuProc`, `tuSend`, `txHist`, `txReceipt`, `vouchers`, `wActConnect`, `wChoose`, `wConnected`, `wDetail`, `wVerify`, `walletApprove`, `walletBooking`, `walletConnect`, `walletCurrency`, `walletPaymentSource`, `walletTopUp`, `walletTopUpAmount`, `walletTopUpDone`, `walletTopUpReceipt`, `walletTopUpStable`, `wallets`, `wdDone`, `withdraw`, `xsAddr`, `xsAmt`, `xsDone`, `xsFail`, `xsPin`, `xsProc`, `xsRecv`, `xsTo`

## Android source destination candidates

`YouRoute.AnnouncementDetail`, `YouRoute.Announcements`, `YouRoute.AskQuestion`, `YouRoute.BadgeKycProcessing`, `YouRoute.BadgeKycWebView`, `YouRoute.BadgePhoneCountry`, `YouRoute.BadgePhoneNumber`, `YouRoute.BadgeProfileMedia`, `YouRoute.BadgeVerification`, `YouRoute.BadgeWalletReconnect`, `YouRoute.BankAccountEditor`, `YouRoute.BankAccounts`, `YouRoute.BlockedUsers`, `YouRoute.BookService`, `YouRoute.Career`, `YouRoute.ChangeEmail`, `YouRoute.ChangeEmailOtp`, `YouRoute.ChangeMobileNumber`, `YouRoute.ChatList`, `YouRoute.ChatLocationPicker`, `YouRoute.ChatRoom`, `YouRoute.ChatSearch`, `YouRoute.ChoosePlan`, `YouRoute.ConnectWallet`, `YouRoute.ConnectedAccounts`, `YouRoute.ConvertTopUp`, `YouRoute.CreateExperience`, `YouRoute.DeleteAccount`, `YouRoute.DeleteAccountOtp`, `YouRoute.DevicePermissions`, `YouRoute.EditExperience`, `YouRoute.Education`, `YouRoute.Elite`, `YouRoute.EliteMerchantDetail`, `YouRoute.EliteReferralNetwork`, `YouRoute.ExperienceCheckout`, `YouRoute.ExperienceDetail`, `YouRoute.ExperiencePlans`, `YouRoute.ExperienceReserve`, `YouRoute.FeaturedLocals`, `YouRoute.FeedCompose`, `YouRoute.FeedMediaPreview`, `YouRoute.FeedThread`, `YouRoute.FeedbackForm`, `YouRoute.FillInYourDetails`, `YouRoute.FundingActivity`, `YouRoute.Home`, `YouRoute.HostAllReviews`, `YouRoute.HostAwardEditor`, `YouRoute.HostBadgeVerification`, `YouRoute.HostCategoryForm`, `YouRoute.HostDetail`, `YouRoute.HostRecentSearches`, `YouRoute.HostReviews`, `YouRoute.HostSearch`, `YouRoute.HostSearchSeeAll`, `YouRoute.HostServiceEditor`, `YouRoute.HostServiceLocationPicker`, `YouRoute.HostSettings`, `YouRoute.Limits`, `YouRoute.LocalsCategory`, `YouRoute.Login`, `YouRoute.ManageExperiences`, `YouRoute.ManagedWalletDetail`, `YouRoute.MeetIntro`, `YouRoute.MembershipHistory`, `YouRoute.MembershipReceipt`, `YouRoute.MembershipSuccess`, `YouRoute.MerchantDetail`, `YouRoute.MerchantRecentSearches`, `YouRoute.MerchantSearch`, `YouRoute.ModifyBooking`, `YouRoute.MyFeed`, `YouRoute.MyMoney`, `YouRoute.MyQr`, `YouRoute.MyWallets`, `YouRoute.Onboarding`, `YouRoute.OtherProfile`, `YouRoute.PaydibsTopUp`, `YouRoute.PaymentPinRecovery`, `YouRoute.PaymentPinSetting`, `YouRoute.PersonalDetails`, `YouRoute.PlaceSelector`, `YouRoute.Plans`, `YouRoute.Profile`, `YouRoute.PromoCodeDetail`, `YouRoute.PromoCodes`, `YouRoute.ReferralChatIntent`, `YouRoute.ReferralRewardDetail`, `YouRoute.Regional`, `YouRoute.RegisteredMerchants`, `YouRoute.ReportProblem`, `YouRoute.ResumeMembership`, `YouRoute.ResumeTopUp`, `YouRoute.RewardDetail`, `YouRoute.Rewards`, `YouRoute.ScanAndPay`, `YouRoute.ScanPayQr`, `YouRoute.ScanPaymentStatus`, `YouRoute.ScanQr`, `YouRoute.ScanRecovery`, `YouRoute.ScanTopUp`, `YouRoute.SelectCountry`, `YouRoute.SelectCurrency`, `YouRoute.SelectLanguage`, `YouRoute.ServiceCheckout`, `YouRoute.ServiceWaitingPayment`, `YouRoute.Settings`, `YouRoute.SettingsReferralCode`, `YouRoute.ShareToChat`, `YouRoute.SignedMerchant`, `YouRoute.Splash`, `YouRoute.SvipCheckout`, `YouRoute.SvipUpgrade`, `YouRoute.TopUp`, `YouRoute.TransactionDetail`, `YouRoute.TransactionReceipt`, `YouRoute.TravelCard`, `YouRoute.VerifyToContinue`, `YouRoute.VipConfirmation`, `YouRoute.Wallet`, `YouRoute.WalletExport`, `YouRoute.WalletQr`, `YouRoute.WalletSend`, `YouRoute.Withdrawal`, `YouRoute.WithdrawalDetail`
