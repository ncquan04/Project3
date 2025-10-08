import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar } from 'react-native';
import AppProvider from './src/contexts';
import { RootNavigation } from './src/navigation';
import {
  SafeAreaFrameContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

class ClassError extends React.PureComponent<{ children: React.ReactNode }> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error);
  }
  render() {
    return this.props.children;
  }
}

function App(): React.JSX.Element {
  return (
    <ClassError>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={'#00000055'}
        networkActivityIndicatorVisible
        showHideTransition={'fade'}
        translucent
      />
      <SafeAreaProvider
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <AppProvider>
          <RootNavigation />
        </AppProvider>
      </SafeAreaProvider>
    </ClassError>
  );
}

export default App;
