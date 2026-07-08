export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/statistics/index',
    'pages/profile/index',
    'pages/search/index',
    'pages/trash/index',
    'pages/category-manage/index',
    'pages/wallet-manage/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '记账本',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#10b981',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '记账',
        iconPath: 'assets/bill-unselected.svg',
        selectedIconPath: 'assets/bill-selected.svg',
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/profile-unselected.svg',
        selectedIconPath: 'assets/profile-selected.svg',
      },
    ],
  },
});
