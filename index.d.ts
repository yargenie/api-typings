/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: MPNS.UserInfo,
  }
  userInfoReadyCallback?: MPNS.GetUserInfoSuccessCallback,
}