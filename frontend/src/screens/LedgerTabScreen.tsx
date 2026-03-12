import React from 'react';
import LedgerScreen from './LedgerScreen';

// Pass route and navigation props through so LedgerScreen can read route.params
// when navigated as a stack screen, and fall back to AsyncStorage when used as a tab.
const LedgerTabScreen = ({ navigation, route }: any) => {
  return <LedgerScreen navigation={navigation} route={route} />;
};

export default LedgerTabScreen;
