import React from 'react';
import LedgerScreen from './LedgerScreen';

// LedgerScreen은 route.params 및 navigation prop을 사용하지 않으므로
// 별도의 AsyncStorage resolve 없이 직접 렌더링합니다.
const LedgerTabScreen = ({ navigation }: any) => {
  return <LedgerScreen />;
};

export default LedgerTabScreen;
