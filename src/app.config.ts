export default {
  pages: [
    'pages/index/index',
    'pages/addBill/index',
    'pages/categoryManage/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '账单记录',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4f46e5',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '账单',
        iconPath: 'assets/tab-bill.png',
        selectedIconPath: 'assets/tab-bill-active.png'
      }
    ]
  }
}
