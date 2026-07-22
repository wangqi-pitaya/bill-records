import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import './app.scss';
import { ToastContainer } from './components/Toast';

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    // App launched
  });

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

export default App;
