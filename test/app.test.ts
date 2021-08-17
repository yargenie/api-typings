import { expectType } from 'tsd'

expectType<void>(App({}))

App({
  globalData: {
    userInfo: {} as MPNS.UserInfo,
  },
  userInfoReadyCallback(userInfo: MPNS.UserInfo) {
    userInfo.gender
  },
  onLaunch() {
    const logs: number[] = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res.userInfo)
              }
            },
          })
        }
      },
    })
  },
  f(a: number) {
    return a.toFixed()
  },
  onError() {},
  onHide() {
    expectType<string>(this.f(1))
  },
  onPageNotFound(e) {
    expectType<boolean>(e.isEntryPage)
  },
})

expectType<MPNS.App.Instance<Record<string, any>>>(getApp())
